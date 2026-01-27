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

// State for Modal
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

btnAiFetch.addEventListener("click", async (e) => {
  e.preventDefault();
  const query = inputSearch.value.trim();
  if (!query) return;
  await fetchGameData(query);
});

btnSaveGame.addEventListener("click", addGameToLibrary);

filterInput.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  renderLibrary(term);
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

// --- Functions ---

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
  customGoals = [];

  apiStatus.textContent = "Powered by AI. Enter title and click Auto-Fill.";
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

  if (selectImmediately) {
    chip.click();
  }
}

function addCustomGoalToUI(text) {
  const div = document.createElement("div");
  div.className = "checkbox-container";
  div.innerHTML = `
        <input type="checkbox" value="${text}" class="goal-check" checked>
        <span class="checkmark"></span>
        ${text}
    `;
  div.querySelector("input").addEventListener("change", validateForm);
  customGoalsList.appendChild(div);
  validateForm();
}

function validateForm() {
  const title = inputTitle.value.trim();
  const checks = document.querySelectorAll(".goal-check:checked");

  if (title && selectedPlatform && checks.length > 0) {
    btnSaveGame.disabled = false;
  } else {
    btnSaveGame.disabled = true;
  }
}

// --- API Logic ---

async function fetchGameData(query) {
  if (!API_KEY || API_KEY.includes("YOUR_API_KEY")) {
    apiStatus.textContent = "Error: Please paste your API Key in script.js";
    apiStatus.style.color = "var(--danger)";
    return;
  }

  apiStatus.textContent = "Summoning AI... please wait.";
  apiStatus.style.color = "var(--accent)";
  btnAiFetch.disabled = true;

  // Using gemini-pro which is generally more stable for general queries
  // If this fails, try swapping 'gemini-pro' with 'gemini-1.5-flash'
  const MODEL_NAME = "gemini-2.5-flash";

  const prompt = `Return a raw JSON object (no markdown formatting) for the video game "${query}". 
    Fields: title, developer, genre, description (max 2 sentences), platforms (array of strings), estimated_hours_main (string), estimated_hours_100 (string). 
    If unknown, use "Unknown".`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || response.statusText);
    }

    const data = await response.json();

    // Safety check to ensure the structure exists
    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("AI returned an unexpected structure.");
    }

    const textRes = data.candidates[0].content.parts[0].text;

    // Sanitize JSON string (remove markdown ```json ... ```)
    const jsonString = textRes
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let gameInfo;
    try {
      gameInfo = JSON.parse(jsonString);
    } catch (e) {
      throw new Error("Failed to parse AI response. Try again.");
    }

    // Populate Fields
    inputTitle.value = gameInfo.title || query;
    inputDev.value = gameInfo.developer || "Unknown";
    inputGenre.value = gameInfo.genre || "Unknown";
    inputDesc.value = gameInfo.description || "";
    inputHours.value = `${gameInfo.estimated_hours_main || "?"}h (Main) / ${gameInfo.estimated_hours_100 || "?"}h (100%)`;

    // Clear and fill platforms
    platformChipsContainer.innerHTML = "";
    const platforms = Array.isArray(gameInfo.platforms)
      ? gameInfo.platforms
      : ["PC", "Console"];
    platforms.forEach((p) => createPlatformChip(p));

    apiStatus.textContent = "Data fetched successfully!";
    apiStatus.style.color = "var(--success)";
  } catch (error) {
    console.error("Game Rack API Error:", error);
    apiStatus.textContent = `Error: ${error.message}`;
    apiStatus.style.color = "var(--danger)";
  } finally {
    btnAiFetch.disabled = false;
    validateForm();
  }
}

// --- Card Logic ---

function addGameToLibrary() {
  const goalInputs = document.querySelectorAll(".goal-check:checked");
  const goals = Array.from(goalInputs).map((input) => ({
    text: input.value,
    completed: false,
  }));

  const newGame = {
    id: Date.now(),
    title: inputTitle.value,
    developer: inputDev.value || "Unknown",
    genre: inputGenre.value || "Unknown",
    hours: inputHours.value || "N/A",
    description: inputDesc.value || "",
    image: inputImg.value || null,
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
    const percent = Math.round((completedCount / totalCount) * 100);

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
                <div class="card-meta">Est: ${game.hours}</div>

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

      goalDiv.addEventListener("click", () => {
        toggleGoal(game.id, index);
      });

      goalListContainer.appendChild(goalDiv);
    });

    const slider = card.querySelector(".sat-slider");
    slider.addEventListener("input", (e) => {
      game.satisfaction = e.target.value;
      card.querySelector(`#sat-val-${game.id}`).textContent =
        `${e.target.value}%`;
      const val = parseInt(e.target.value);
      const valSpan = card.querySelector(`#sat-val-${game.id}`);
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
