/* 
    CONFIGURATION:
    1. Gemini Key: https://aistudio.google.com/app/apikey
*/
const API_KEY = "AIzaSyDhuZPyP5mgnjRhjwl84qMBDtvNf2eUu-4"; // Replace if needed
const MAX_CARDS = 25;
const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800";

let gameLibrary = [];
let quizAnswers = {};
let editingGameId = null;

// Valid Platforms for "Other" Validation
const validPlatforms = [
  "pc",
  "ps4",
  "ps5",
  "xbox 360",
  "xbox one",
  "xbox series x",
  "xbox series s",
  "switch",
  "nintendo switch",
  "mobile",
  "ios",
  "android",
  "mac",
  "steam deck",
];

// Map quiz values to proper display names
const platformDisplayMap = {
  pc: "PC",
  ps5: "PlayStation 5",
  ps4: "PlayStation 4",
  switch: "Nintendo Switch",
  xbox: "Xbox Series X/S",
  mobile: "Mobile",
  ios: "Mobile (iOS)",
  android: "Mobile (Android)",
};

// --- DOM Elements ---
const modal = document.getElementById("modal-overlay");
const btnOpenModal = document.getElementById("btn-open-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnAiFetch = document.getElementById("btn-ai-fetch");
const btnSaveGame = document.getElementById("btn-save-game");
const grid = document.getElementById("game-grid");
const countDisplay = document.getElementById("count-display");
const apiStatus = document.getElementById("api-status");
const modalTitle = document.getElementById("modal-title");

// Filters
const filterText = document.getElementById("filter-text");
const filterPlatform = document.getElementById("filter-platform");
const filterStatus = document.getElementById("filter-status");
const sortDropdown = document.getElementById("sort-dropdown");

// Quiz
const quizModal = document.getElementById("quiz-modal");
const quizContent = document.getElementById("quiz-content");
const btnOpenQuiz = document.getElementById("btn-open-quiz");

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
let currentQuizIndex = 0;

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  loadLibrary();
  renderLibrary();
});

// --- Event Listeners ---
btnOpenModal.addEventListener("click", () => {
  if (gameLibrary.length >= MAX_CARDS) {
    alert("Backlog Full! You must complete or remove a game to add more.");
    return;
  }
  editingGameId = null; // Ensure we are in Add mode
  resetModal();
  modalTitle.textContent = "Add New Title";
  btnSaveGame.textContent = "Add Game to Rack";
  modal.classList.remove("hidden");
});

btnCloseModal.addEventListener("click", () => modal.classList.add("hidden"));

btnAiFetch.addEventListener("click", async (e) => {
  e.preventDefault();
  const query = inputSearch.value.trim();
  if (!query) return;
  await fetchGameDataSmart(query);
});

btnSaveGame.addEventListener("click", addGameToLibrary);

// Filter Listeners
[filterText, filterPlatform, filterStatus, sortDropdown].forEach((el) => {
  el.addEventListener("input", renderLibrary);
  el.addEventListener("change", renderLibrary);
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
  apiStatus.textContent = "Powered by AI. Enter title and click Auto-Fill.";
  apiStatus.style.color = "#a0a0b0";
  validateForm();
}

function createPlatformChip(name, selectImmediately = false) {
  const chip = document.createElement("div");
  chip.className = "chip";
  chip.textContent = name;
  if (selectImmediately && selectedPlatform === name)
    chip.classList.add("selected"); // Check if already selected

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

function addCustomGoalToUI(text, isChecked = true) {
  const div = document.createElement("div");
  div.className = "checkbox-container";
  div.innerHTML = `<input type="checkbox" value="${text}" class="goal-check" ${isChecked ? "checked" : ""}><span class="checkmark"></span>${text}`;
  div.querySelector("input").addEventListener("change", validateForm);
  customGoalsList.appendChild(div);
  validateForm();
}

function validateForm() {
  const title = inputTitle.value.trim();
  const checks = document.querySelectorAll(".goal-check:checked");
  btnSaveGame.disabled = !(title && selectedPlatform && checks.length > 0);
}

// --- CORE LIBRARY LOGIC ---

function addGameToLibrary() {
  const goalInputs = document.querySelectorAll(".goal-check:checked");
  const goals = Array.from(goalInputs).map((input) => ({
    text: input.value,
    completed: false,
  }));

  if (editingGameId) {
    // UPDATE EXISTING GAME
    const gameIndex = gameLibrary.findIndex((g) => g.id === editingGameId);
    if (gameIndex > -1) {
      const existing = gameLibrary[gameIndex];

      // Map old completion status to new goals if they match
      const mergedGoals = goals.map((newGoal) => {
        const oldGoal = existing.goals.find((g) => g.text === newGoal.text);
        return {
          text: newGoal.text,
          completed: oldGoal ? oldGoal.completed : false,
        };
      });

      gameLibrary[gameIndex] = {
        ...existing,
        title: inputTitle.value,
        developer: inputDev.value,
        genre: inputGenre.value,
        hours: inputHours.value,
        description: inputDesc.value,
        image: inputImg.value || PLACEHOLDER_IMG,
        platform: selectedPlatform,
        goals: mergedGoals,
      };

      // Recalculate completion
      const allDone = mergedGoals.every((g) => g.completed);
      gameLibrary[gameIndex].isComplete = allDone && mergedGoals.length > 0;
    }
    editingGameId = null;
  } else {
    // CREATE NEW GAME
    const newGame = {
      id: Date.now(),
      title: inputTitle.value,
      developer: inputDev.value || "Unknown",
      genre: inputGenre.value || "Unknown",
      hours: inputHours.value || "N/A",
      description: inputDesc.value || "",
      image: inputImg.value || PLACEHOLDER_IMG,
      platform: selectedPlatform,
      goals: goals,
      satisfaction: 0,
      isComplete: false,
    };
    gameLibrary.push(newGame);
  }

  saveLibrary();
  renderLibrary();
  modal.classList.add("hidden");
}

// --- EDIT FUNCTIONALITY ---
window.editGame = function (id) {
  const game = gameLibrary.find((g) => g.id === id);
  if (!game) return;

  editingGameId = id;
  resetModal(); // Clear first

  // Set UI to Edit Mode
  modalTitle.textContent = "Edit Game Details";
  btnSaveGame.textContent = "Save Changes";

  // Populate Fields
  inputTitle.value = game.title;
  inputDev.value = game.developer;
  inputGenre.value = game.genre;
  inputHours.value = game.hours;
  inputDesc.value = game.description;
  inputImg.value = game.image === PLACEHOLDER_IMG ? "" : game.image;

  // Populate Platform
  createPlatformChip(game.platform, true);

  // Populate Goals
  // Reset standard checks first
  document.querySelectorAll(".goal-check").forEach((c) => (c.checked = false));
  customGoalsList.innerHTML = ""; // Clear customs

  game.goals.forEach((g) => {
    // Try to find matching standard checkbox
    const standardCheck = Array.from(
      document.querySelectorAll(".search-section ~ form .goal-check"),
    ).find((i) => i.value === g.text);

    if (standardCheck) {
      standardCheck.checked = true;
    } else {
      // It's a custom goal
      addCustomGoalToUI(g.text, true);
    }
  });

  validateForm();
  modal.classList.remove("hidden");
};

function renderLibrary() {
  grid.innerHTML = "";
  countDisplay.textContent = gameLibrary.length;

  // Filter Logic
  const txt = filterText.value.toLowerCase();
  const plat = filterPlatform.value;
  const stat = filterStatus.value;
  const sort = sortDropdown.value;

  let filtered = gameLibrary.filter((g) => {
    const matchesText =
      g.title.toLowerCase().includes(txt) ||
      g.genre.toLowerCase().includes(txt);
    const matchesPlat =
      plat === "all" || g.platform.toLowerCase().includes(plat.toLowerCase());
    const matchesStat =
      stat === "all" || (stat === "completed" ? g.isComplete : !g.isComplete);
    return matchesText && matchesPlat && matchesStat;
  });

  // Sorting Logic
  if (sort === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "hours")
    filtered.sort((a, b) => parseInt(a.hours) - parseInt(b.hours));
  else if (sort === "satisfaction")
    filtered.sort((a, b) => b.satisfaction - a.satisfaction);
  else filtered.sort((a, b) => b.id - a.id);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>No games found matching criteria.</p></div>`;
    return;
  }

  filtered.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";

    const bgUrl =
      game.image && game.image !== "" ? game.image : PLACEHOLDER_IMG;
    const bgStyle = `background-image: url('${bgUrl}');`;

    const completedCount = game.goals.filter((g) => g.completed).length;
    const totalCount = game.goals.length;
    const percent =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    card.innerHTML = `
            <div class="card-header" style="${bgStyle}">
                <div class="platform-badge">${game.platform}</div>
                <div class="card-actions">
                    <button class="btn-icon-card btn-edit-card" onclick="editGame(${game.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon-card btn-delete-card" onclick="deleteGame(${game.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
                ${game.isComplete ? '<div class="completed-sash">COMPLETE</div><div class="completion-star"><i class="fa-solid fa-star"></i></div>' : ""}
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
                    <input type="range" min="-100" max="100" value="${game.satisfaction}" class="sat-slider" onchange="updateSat(${game.id}, this.value)">
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

    grid.appendChild(card);
  });
}

function updateSat(id, val) {
  const g = gameLibrary.find((x) => x.id === id);
  if (g) {
    g.satisfaction = parseInt(val);
    saveLibrary();
    document.getElementById(`sat-val-${id}`).textContent = `${val}%`;

    // Auto-update sort if currently filtering by satisfaction
    if (sortDropdown.value === "satisfaction") {
      renderLibrary();
    }
  }
}

function deleteGame(id) {
  if (confirm("Are you sure you want to delete this game card?")) {
    gameLibrary = gameLibrary.filter((g) => g.id !== id);
    saveLibrary();
    renderLibrary();
  }
}

function toggleGoal(gameId, goalIndex) {
  const game = gameLibrary.find((g) => g.id === gameId);
  if (game) {
    game.goals[goalIndex].completed = !game.goals[goalIndex].completed;

    const allDone = game.goals.every((g) => g.completed);

    if (allDone && !game.isComplete) {
      game.isComplete = true;
      triggerConfetti();
    } else if (!allDone) {
      game.isComplete = false;
    }

    saveLibrary();
    renderLibrary();
  }
}

function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#7000ff", "#ff0055", "#00e676", "#ffd700"],
  });
}

function saveLibrary() {
  localStorage.setItem("gameLibrary", JSON.stringify(gameLibrary));
}

function loadLibrary() {
  const data = localStorage.getItem("gameLibrary");
  if (data) gameLibrary = JSON.parse(data);
}

// --- QUIZ & RECOMMENDATION LOGIC ---

const questions = [
  {
    id: "mood",
    question: "What's your vibe right now?",
    options: [
      { val: "action", label: "Adrenaline & Action" },
      { val: "story", label: "Deep Story & Narrative" },
      { val: "relax", label: "Chill & Relaxing" },
      { val: "challenge", label: "Hardcore Challenge" },
    ],
  },
  {
    id: "time",
    question: "How much time do you have?",
    options: [
      { val: "short", label: "Short (Under 10h)" },
      { val: "medium", label: "Medium (10-30h)" },
      { val: "long", label: "Long (30h-100h)" },
      { val: "infinity", label: "Endless / Multiplayer" },
    ],
  },
  {
    id: "era",
    question: "Do you prefer modern or retro?",
    options: [
      { val: "modern", label: "Modern Graphics" },
      { val: "retro", label: "Retro / Pixel Art" },
      { val: "indie", label: "Unique Indie Art" },
      { val: "any", label: "Don't Care" },
    ],
  },
  {
    id: "platform",
    question: "Which platform are you playing on?",
    isPlatform: true,
    options: [
      { val: "pc", label: "PC" },
      { val: "ps5", label: "PlayStation 5" },
      { val: "ps4", label: "PlayStation 4" },
      { val: "switch", label: "Nintendo Switch" },
      { val: "xbox", label: "Xbox Series X/S" },
      { val: "other", label: "Other (Type it)" },
    ],
  },
];

btnOpenQuiz.addEventListener("click", () => {
  currentQuizIndex = 0;
  quizAnswers = {};
  quizModal.classList.remove("hidden");
  renderQuiz();
});

function renderQuiz() {
  const q = questions[currentQuizIndex];
  let html = `
        <div class="quiz-header">
            <h3>Question ${currentQuizIndex + 1}/${questions.length}</h3>
            <button onclick="quizModal.classList.add('hidden')" class="close-icon"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="quiz-body">
            <h2>${q.question}</h2>
            <div class="quiz-options">
    `;

  q.options.forEach((opt) => {
    if (opt.val === "other") {
      html += `
                <div class="input-group" style="margin-top:10px;">
                    <input type="text" id="quiz-other-input" placeholder="Type platform (e.g. Mobile, 3DS)">
                    <button class="btn-secondary" onclick="handleOtherPlatform()">Confirm</button>
                </div>
                <div id="other-error" class="error-msg">Invalid platform. Please choose a standard one.</div>
             `;
    } else {
      html += `<div class="quiz-option" onclick="handleAnswer('${q.id}', '${opt.val}')">${opt.label}</div>`;
    }
  });

  html += `</div></div>`;
  quizContent.innerHTML = html;
}

function handleOtherPlatform() {
  const input = document.getElementById("quiz-other-input");
  const err = document.getElementById("other-error");
  const val = input.value.trim().toLowerCase();

  const isValid = validPlatforms.some((p) => val.includes(p));

  if (isValid) {
    quizAnswers["platform"] = val;
    finishQuiz();
  } else {
    err.style.display = "block";
  }
}

function handleAnswer(key, val) {
  quizAnswers[key] = val;
  if (currentQuizIndex < questions.length - 1) {
    currentQuizIndex++;
    renderQuiz();
  } else {
    finishQuiz();
  }
}

async function finishQuiz() {
  quizContent.innerHTML = `
        <div class="quiz-body" style="text-align:center;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:3rem; color:var(--accent);"></i>
            <h3>Asking AI for recommendations...</h3>
        </div>
    `;

  try {
    const recommendedTitles = await callGeminiForRecommendations(quizAnswers);

    quizContent.innerHTML = `
            <div class="quiz-body" style="text-align:center;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size:3rem; color:var(--accent);"></i>
                <h3>Fetching cover art...</h3>
            </div>
        `;

    const recommendationsWithImages = await Promise.all(
      recommendedTitles.map(async (game) => {
        const img = await fetchSmartImage(game.title);
        return { ...game, image: img || PLACEHOLDER_IMG };
      }),
    );

    renderRecommendations(recommendationsWithImages);
  } catch (e) {
    console.error(e);
    quizContent.innerHTML = `<div class="quiz-body"><h3>AI Error. Please try again later.</h3></div>`;
  }
}

async function callGeminiForRecommendations(answers) {
  const prompt = `
        Based on these gaming preferences, suggest exactly 5 real video games.
        Mood: ${answers.mood}
        Time Available: ${answers.time}
        Era/Style: ${answers.era}
        Platform: ${answers.platform}
        
        Return ONLY a raw JSON array of objects. No markdown.
        Format: [{"title": "Game Name", "reason": "Short reason why"}, ...]
    `;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(text);
}

function renderRecommendations(games) {
  let html = `
        <div class="quiz-header">
            <h3>Top 5 Picks For You</h3>
            <button onclick="quizModal.classList.add('hidden')" class="close-icon"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="quiz-body">
            <div class="recommendations-grid">
    `;

  games.forEach((g) => {
    const safeTitle = g.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");

    html += `
            <div class="rec-card">
                <div class="rec-image" style="background-image: url('${g.image}')"></div>
                <div class="rec-info">
                    <div class="rec-title">${g.title}</div>
                    <div class="rec-meta">${g.reason}</div>
                    <button class="btn-add-rec" id="btn-add-${safeTitle.replace(/\s+/g, "")}" onclick='addRecToLib("${safeTitle}", "${g.image}")'>
                        <i class="fa-solid fa-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
  });

  html += `</div></div>`;
  quizContent.innerHTML = html;
}

// Full Fetch Add for Recommendations
window.addRecToLib = async (title, image) => {
  if (gameLibrary.length >= MAX_CARDS) {
    alert("Library full! Cannot add more games.");
    return;
  }

  // UX Feedback
  const btn = document.querySelector(
    `button[onclick*="${title.replace(/'/g, "\\'")}"]`,
  );
  if (btn) {
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Fetching Info...`;
    btn.disabled = true;
  }

  try {
    // Full Fetch to populate details (Dev, Genre, Hours)
    const aiData = await callGeminiForStats(title);

    // Correct Platform Display Name Mapping
    const displayPlatform =
      platformDisplayMap[quizAnswers.platform] || quizAnswers.platform;

    const newGame = {
      id: Date.now(),
      title: title,
      developer: aiData.developer || "Unknown",
      genre: aiData.genre || "Unknown",
      hours: aiData.estimated_hours_main || "N/A",
      description: aiData.description || "Recommended via Game Rack Quiz",
      image: image,
      platform: displayPlatform, // Mapped Name (e.g., "Nintendo Switch")
      goals: [{ text: "Complete Main Story", completed: false }],
      satisfaction: 0,
      isComplete: false,
    };

    gameLibrary.push(newGame);
    saveLibrary();
    renderLibrary();

    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
      btn.style.background = "var(--success)";
    }
  } catch (e) {
    console.error("Failed to fetch full details for rec", e);
    // Fallback add if API fails
    const fallbackPlatform =
      platformDisplayMap[quizAnswers.platform] || quizAnswers.platform;

    const fallbackGame = {
      id: Date.now(),
      title: title,
      developer: "Unknown",
      genre: "Unknown",
      hours: "Unknown",
      description: "Recommended via Game Rack Quiz",
      image: image,
      platform: fallbackPlatform,
      goals: [{ text: "Complete Main Story", completed: false }],
      satisfaction: 0,
      isComplete: false,
    };
    gameLibrary.push(fallbackGame);
    saveLibrary();
    renderLibrary();
  }
};

async function callGeminiForStats(query) {
  const prompt = `Return JSON for game "${query}": {title, developer, genre, description, platforms, estimated_hours_main}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(text);
}

async function fetchSmartImage(query) {
  try {
    const res = await fetch(
      `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=1`,
    );
    const data = await res.json();
    if (data && data.length > 0 && data[0].steamAppID) {
      return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${data[0].steamAppID}/header.jpg`;
    }
  } catch (e) {}

  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " video game")}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    if (searchData.query.search && searchData.query.search.length > 0) {
      const pageId = searchData.query.search[0].pageid;
      const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pageids=${pageId}&pithumbsize=600&format=json&origin=*`;
      const imgRes = await fetch(imgUrl);
      const imgData = await imgRes.json();
      const page = imgData.query.pages[pageId];
      if (page.thumbnail) return page.thumbnail.source;
    }
  } catch (e) {}

  return null;
}
