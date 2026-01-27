const API_KEY = "AIzaSyDhuZPyP5mgnjRhjwl84qMBDtvNf2eUu-4";

const MAX_CARDS = 25;
let gameLibrary = [];

// --- DOM Elements ---
const modal = document.getElementById("modal-overlay");
const btnOpenModal = document.getElementById("btn-open-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnAiFetch = document.getElementById("btn-ai-fetch");
const btnSaveGame = document.getElementById("btn-save-game");
const grid = document.getElementById("game-grid");
const countDisplay = document.getElementById("count-display");
const filterInput = document.getElementById("filter-input");
const apiStatus = document.getElementById("api-status");

// Form Inputs
const inputSearch = document.getElementById("game-search-input");
const inputTitle = document.getElementById("input-title");
const inputDev = document.getElementById("input-dev");
const inputGenre = document.getElementById("input-genre");
const inputHours = document.getElementById("input-hours");
const inputDesc = document.getElementById("input-desc");
const inputImg = document.getElementById("input-img");
const platformChipsContainer = document.getElementById("platform-chips");
const inputCustomPlatform = document.getElementById("custom-platform");
const customGoalsList = document.getElementById("custom-goals-list");
const inputNewGoal = document.getElementById("new-goal-text");
const btnAddGoal = document.getElementById("btn-add-goal");

// State
let selectedPlatform = null;
let customGoals = [];

// --- Event Listeners ---

btnOpenModal.addEventListener("click", () => {
  if (gameLibrary.length >= MAX_CARDS) {
    alert("Backlog Full! You must complete or remove a game to add more.");
    return;
  }
  resetModal();
  modal.classList.remove("hidden");
});

btnCloseModal.addEventListener("click", () => modal.classList.add("hidden"));

// Press Enter to Search
inputSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    btnAiFetch.click();
  }
});

btnAiFetch.addEventListener("click", async (e) => {
  e.preventDefault();
  const query = inputSearch.value.trim();
  if (!query) return;
  await fetchGameDataSmart(query);
});

btnSaveGame.addEventListener("click", addGameToLibrary);

filterInput.addEventListener("input", (e) => {
  renderLibrary(e.target.value.toLowerCase());
});

inputCustomPlatform.addEventListener("change", (e) => {
  if (e.target.value.trim() !== "") {
    createPlatformChip(e.target.value.trim(), true);
    e.target.value = "";
  }
});

btnAddGoal.addEventListener("click", () => {
  const txt = inputNewGoal.value.trim();
  if (txt) {
    addCustomGoalToUI(txt);
    inputNewGoal.value = "";
  }
});

document.getElementById("game-form").addEventListener("change", validateForm);
document.getElementById("game-form").addEventListener("keyup", validateForm);

// --- Core Functions ---

function resetModal() {
  inputSearch.value = "";
  inputTitle.value = "";
  inputDev.value = "";
  inputGenre.value = "";
  inputHours.value = "";
  inputDesc.value = "";
  inputImg.value = "";
  inputCustomPlatform.value = "";
  platformChipsContainer.innerHTML = "";
  selectedPlatform = null;
  document.querySelectorAll(".goal-check").forEach((c) => (c.checked = false));
  customGoalsList.innerHTML = "";
  apiStatus.textContent =
    "Powered by AI & SteamDB. Enter title and click Auto-Fill.";
  apiStatus.style.color = "#a0a0b0";
  validateForm();
}

function createPlatformChip(name, selectImmediately = false) {
  const chip = document.createElement("div");
  chip.className = "chip";
  chip.textContent = name;
  chip.onclick = () => {
    document
      .querySelectorAll(".chip")
      .forEach((c) => c.classList.remove("selected"));
    chip.classList.add("selected");
    selectedPlatform = name;
    validateForm();
  };
  platformChipsContainer.appendChild(chip);
  if (selectImmediately) chip.click();
}

function addCustomGoalToUI(text) {
  const div = document.createElement("div");
  div.className = "checkbox-container";
  div.innerHTML = `<input type="checkbox" value="${text}" class="goal-check" checked><span class="checkmark"></span>${text}`;
  div.querySelector("input").addEventListener("change", validateForm);
  customGoalsList.appendChild(div);
  validateForm();
}

function validateForm() {
  const title = inputTitle.value.trim();
  const checks = document.querySelectorAll(".goal-check:checked");
  btnSaveGame.disabled = !(title && selectedPlatform && checks.length > 0);
}

// --- SMART API LOGIC (Gemini + Steam + Wiki) ---

async function fetchGameDataSmart(query) {
  if (!API_KEY || API_KEY.includes("YOUR")) {
    apiStatus.textContent = "Error: Missing Gemini API Key in script.js";
    apiStatus.style.color = "var(--danger)";
    return;
  }

  apiStatus.textContent = "Searching Databases...";
  apiStatus.style.color = "var(--accent)";
  btnAiFetch.disabled = true;

  try {
    // Run Text (AI) and Image (Steam/Wiki) searches in parallel
    const [aiData, smartImage] = await Promise.all([
      callGeminiForStats(query),
      fetchSmartImage(query),
    ]);

    // 1. Populate Text from Gemini
    inputTitle.value = aiData.title || query;
    inputDev.value = aiData.developer || "Unknown";
    inputGenre.value = aiData.genre || "Unknown";
    inputDesc.value = aiData.description || "";
    inputHours.value = `${aiData.estimated_hours_main || "?"}h (Main) / ${aiData.estimated_hours_100 || "?"}h (100%)`;

    // 2. Populate Platforms
    platformChipsContainer.innerHTML = "";
    const platforms = Array.isArray(aiData.platforms)
      ? aiData.platforms
      : ["PC", "Console"];
    platforms.forEach((p) => createPlatformChip(p));

    // 3. Populate Image
    if (smartImage) {
      inputImg.value = smartImage;
      apiStatus.textContent = "Success! Data & Art Found.";
      apiStatus.style.color = "var(--success)";
    } else {
      inputImg.value = ""; // Clear it so gradient takes over
      apiStatus.textContent = "Data found. No image available (using default).";
      apiStatus.style.color = "#fb8c00"; // Orange
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    apiStatus.textContent = "Error fetching data. Try manually.";
    apiStatus.style.color = "var(--danger)";
  } finally {
    btnAiFetch.disabled = false;
    validateForm();
  }
}

// Helper: Call Gemini
async function callGeminiForStats(query) {
  const models = ["gemini-2.5-flash", "gemini-2.5-pro"];
  const prompt = `Return a raw JSON object (no markdown) for game "${query}". Fields: title, developer, genre, description (max 2 sentences), platforms (array of strings), estimated_hours_main (string), estimated_hours_100 (string). Use "Unknown" if unsure.`;

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(text);
    } catch (e) {
      console.log(`Model ${model} failed, trying next...`);
    }
  }
  throw new Error("All AI models failed.");
}

// Helper: Smart Image Fetcher (Steam -> Wiki -> Null)
async function fetchSmartImage(query) {
  // 1. Try CheapShark (which maps to Steam)
  try {
    const steamImg = await getSteamImage(query);
    if (steamImg) return steamImg;
  } catch (e) {
    console.log("Steam fetch failed, trying Wiki...");
  }

  // 2. Fallback to Wikipedia
  try {
    const wikiImg = await getWikiImage(query);
    if (wikiImg) return wikiImg;
  } catch (e) {
    console.log("Wiki fetch failed");
  }

  return null;
}

// Sub-helper: CheapShark -> Steam
async function getSteamImage(query) {
  // CheapShark is free, keyless, and CORS friendly
  const res = await fetch(
    `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=1`,
  );
  const data = await res.json();

  if (data && data.length > 0) {
    const steamAppID = data[0].steamAppID;
    if (steamAppID) {
      // Construct official Steam Header URL (High Reliability)
      return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppID}/header.jpg`;
    }
  }
  return null;
}

// Sub-helper: Wikipedia
async function getWikiImage(query) {
  // Search
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " video game")}&format=json&origin=*`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (!searchData.query.search || searchData.query.search.length === 0)
    return null;

  const pageId = searchData.query.search[0].pageid;

  // Get Image
  const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pageids=${pageId}&pithumbsize=600&format=json&origin=*`;
  const imgRes = await fetch(imgUrl);
  const imgData = await imgRes.json();

  const page = imgData.query.pages[pageId];
  if (page.thumbnail && page.thumbnail.source) {
    return page.thumbnail.source;
  }
  return null;
}

// --- Library Logic ---

function addGameToLibrary() {
  const goalInputs = document.querySelectorAll(".goal-check:checked");
  const goals = Array.from(goalInputs).map((input) => ({
    text: input.value,
    completed: false,
  }));

  const newGame = {
    id: Date.now(),
    title: inputTitle.value,
    developer: inputDev.value,
    genre: inputGenre.value,
    hours: inputHours.value,
    description: inputDesc.value,
    image: inputImg.value,
    platform: selectedPlatform,
    goals: goals,
    satisfaction: 0,
  };

  gameLibrary.push(newGame);
  renderLibrary();
  modal.classList.add("hidden");
}

function renderLibrary(filterText = "") {
  grid.innerHTML = "";
  countDisplay.textContent = gameLibrary.length;

  const filtered = gameLibrary.filter(
    (g) =>
      g.title.toLowerCase().includes(filterText) ||
      g.genre.toLowerCase().includes(filterText) ||
      g.platform.toLowerCase().includes(filterText),
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>No games found matching criteria.</p></div>`;
    return;
  }

  filtered.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";

    const bgStyle = game.image
      ? `background-image: url('${game.image}');`
      : `background: linear-gradient(135deg, #2a2a35, #1a1a24);`;

    const completedCount = game.goals.filter((g) => g.completed).length;
    const totalCount = game.goals.length;
    const percent =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    card.innerHTML = `
            <div class="card-header" style="${bgStyle}">
                <div class="platform-badge">${game.platform}</div>
            </div>
            <div class="card-body">
                <h3 class="card-title">${game.title}</h3>
                <div class="card-meta">
                    <span>${game.developer}</span>
                    <span>${game.genre}</span>
                </div>
                <p class="card-desc">${game.description}</p>
                <div class="card-meta"><i class="fa-regular fa-clock"></i> ${game.hours}</div>

                <div class="progression-section">
                    <div class="progress-header">
                        <span>Progress</span>
                        <span>${percent}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="goals-list" id="goals-list-${game.id}"></div>
                </div>

                <div class="satisfaction-wrapper">
                    <label class="satisfaction-label">Satisfaction: <span class="sat-value" id="sat-val-${game.id}">${game.satisfaction}%</span></label>
                    <input type="range" min="-100" max="100" value="${game.satisfaction}" class="sat-slider" data-id="${game.id}">
                </div>
            </div>
        `;

    const goalListContainer = card.querySelector(`#goals-list-${game.id}`);
    game.goals.forEach((goal, index) => {
      const goalDiv = document.createElement("div");
      goalDiv.className = `goal-item ${goal.completed ? "completed" : ""}`;
      goalDiv.innerHTML = `<i class="fa-regular ${goal.completed ? "fa-square-check" : "fa-square"}"></i> ${goal.text}`;
      goalDiv.addEventListener("click", () => toggleGoal(game.id, index));
      goalListContainer.appendChild(goalDiv);
    });

    const slider = card.querySelector(".sat-slider");
    slider.addEventListener("input", (e) => {
      game.satisfaction = e.target.value;
      const valSpan = card.querySelector(`#sat-val-${game.id}`);
      valSpan.textContent = `${e.target.value}%`;
      const val = parseInt(e.target.value);
      if (val > 50) valSpan.style.color = "var(--success)";
      else if (val < -50) valSpan.style.color = "var(--danger)";
      else valSpan.style.color = "var(--accent)";
    });

    grid.appendChild(card);
  });
}

function toggleGoal(gameId, goalIndex) {
  const game = gameLibrary.find((g) => g.id === gameId);
  if (game) {
    game.goals[goalIndex].completed = !game.goals[goalIndex].completed;
    renderLibrary(filterInput.value.toLowerCase());
  }
}
