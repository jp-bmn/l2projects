const API_KEY = "AIzaSyDhuZPyP5mgnjRhjwl84qMBDtvNf2eUu-4";
const RAWG_API_KEY = "2ba9173f79c54187be93d77b1b526bf3";
const MAX_CARDS = 25;

let gameLibrary = [];
let quizAnswers = {};
let hasCompletedQuiz = false;

// Quiz state
let currentQuizQuestion = 0;
let showQuizResults = false;
let showRecommendations = false;
let recommendations = [];

// ===== QUIZ QUESTIONS =====
const quizQuestions = [
    {
        id: 'completion_satisfaction',
        category: 'Completion Philosophy',
        question: 'When you finish a game, what feels most satisfying?',
        options: [
            { value: 'story', label: 'Seeing the credits roll on the main story' },
            { value: 'completionist', label: 'Finding every collectible and secret' },
            { value: 'mastery', label: 'Mastering the mechanics and getting good at it' },
            { value: 'narrative', label: 'Experiencing all the narrative branches and endings' }
        ]
    },
    {
        id: 'game_not_clicking',
        category: 'Completion Philosophy',
        question: 'If a game isn\'t clicking with you after a few hours, you typically:',
        options: [
            { value: 'push_through', label: 'Push through—I paid for it' },
            { value: 'drop_immediately', label: 'Drop it immediately' },
            { value: 'research', label: 'Look up reviews to see if it gets better' },
            { value: 'easy_mode', label: 'Lower the difficulty to rush through the story' }
        ]
    },
    {
        id: 'ideal_length',
        category: 'Time Investment Preferences',
        question: 'Your ideal game length is:',
        options: [
            { value: 'short', label: 'Under 10 hours—short and sweet' },
            { value: 'medium', label: '10-25 hours—substantial but focused' },
            { value: 'long', label: '25-50 hours—a good meaty experience' },
            { value: 'epic', label: '50+ hours—I want to live in this world' }
        ]
    },
    {
        id: 'limited_time',
        category: 'Time Investment Preferences',
        question: 'When you have limited gaming time, you\'d rather:',
        options: [
            { value: 'steady_progress', label: 'Make steady progress on one longer game' },
            { value: 'complete_short', label: 'Complete an entire short game' },
            { value: 'mood_based', label: 'Play whatever you\'re in the mood for' },
            { value: 'closest_finish', label: 'Tackle the game you\'re closest to finishing' }
        ]
    },
    {
        id: 'backlog_motivation',
        category: 'Genre and Interest Mapping',
        question: 'Rank your TOP motivation for keeping games on your backlog:',
        options: [
            { value: 'critically_acclaimed', label: 'Critically acclaimed' },
            { value: 'friend_recommended', label: 'Friends recommended it' },
            { value: 'series_love', label: 'Part of a series I love' },
            { value: 'sale_interest', label: 'Looked interesting on sale' },
            { value: 'cultural_touchstone', label: 'Cultural touchstone/everyone played it' }
        ]
    },
    {
        id: 'taste_description',
        category: 'Genre and Interest Mapping',
        question: 'Which best describes your taste?',
        options: [
            { value: 'stick_to_genres', label: 'I know what genres I love and stick to them' },
            { value: 'open_quality', label: 'I\'m open to anything if it\'s well-made' },
            { value: 'variety', label: 'I like variety and switching between different types of games' },
            { value: 'expand_horizons', label: 'I\'m trying to expand my horizons beyond my comfort zone' }
        ]
    },
    {
        id: 'story_vs_gameplay',
        category: 'Engagement Style',
        question: 'A game with an amazing story but clunky gameplay is:',
        options: [
            { value: 'worth_suffering', label: 'Worth suffering through' },
            { value: 'watch_playthrough', label: 'Better watched as a playthrough' },
            { value: 'adjust_difficulty', label: 'Only worth it if I can adjust difficulty' },
            { value: 'gameplay_first', label: 'Not for me—gameplay comes first' }
        ]
    },
    {
        id: 'bounce_reason',
        category: 'Engagement Style',
        question: 'You\'re more likely to bounce off a game because:',
        options: [
            { value: 'pacing', label: 'Slow start or pacing issues' },
            { value: 'difficulty', label: 'Too difficult or frustrating' },
            { value: 'story_setting', label: 'Story/setting doesn\'t grab me' },
            { value: 'similarity', label: 'Feels too similar to other games I\'ve played' }
        ]
    },
    {
        id: 'planning_priority',
        category: 'Strategic Preferences',
        question: 'When planning what to play next, you prioritize:',
        options: [
            { value: 'shortest_first', label: 'Shortest games first to clear numbers' },
            { value: 'excitement', label: 'Whatever I\'m most excited about' },
            { value: 'least_likely', label: 'Games I\'m least likely to enjoy so I can remove them guilt-free' },
            { value: 'mix_variety', label: 'Mix of lengths and genres for variety' }
        ]
    }
];

// ===== DOM ELEMENTS =====
const quizModal = document.getElementById('quiz-modal');
const quizContent = document.getElementById('quiz-content');
const btnOpenQuiz = document.getElementById('btn-open-quiz');

const modal = document.getElementById('modal-overlay');
const btnOpenModal = document.getElementById('btn-open-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnAiFetch = document.getElementById('btn-ai-fetch');
const btnSaveGame = document.getElementById('btn-save-game');
const grid = document.getElementById('game-grid');
const countDisplay = document.getElementById('count-display');
const filterInput = document.getElementById('filter-input');
const sortDropdown = document.getElementById('sort-dropdown');
const apiStatus = document.getElementById('api-status');

// Form Inputs
const inputSearch = document.getElementById('game-search-input');
const inputTitle = document.getElementById('input-title');
const inputDev = document.getElementById('input-dev');
const inputGenre = document.getElementById('input-genre');
const inputHours = document.getElementById('input-hours');
const inputDesc = document.getElementById('input-desc');
const inputImg = document.getElementById('input-img');
const platformChipsContainer = document.getElementById('platform-chips');
const inputCustomPlatform = document.getElementById('custom-platform');
const customGoalsList = document.getElementById('custom-goals-list');
const inputNewGoal = document.getElementById('new-goal-text');
const btnAddGoal = document.getElementById('btn-add-goal');
const btnToggleAdvanced = document.getElementById('btn-toggle-advanced');
const advancedFields = document.getElementById('advanced-fields');

// Advanced inputs
const inputCriticScore = document.getElementById('input-critic-score');
const inputHype = document.getElementById('input-hype');
const inputFriendRec = document.getElementById('input-friend-rec');
const inputFavSeries = document.getElementById('input-fav-series');

// State
let selectedPlatform = null;
let customGoals = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderLibrary();
});

// ===== QUIZ FUNCTIONS =====
btnOpenQuiz.addEventListener('click', () => {
    quizModal.classList.remove('hidden');
    currentQuizQuestion = 0;
    showQuizResults = false;
    showRecommendations = false;
    recommendations = [];
    renderQuizContent();
});

function renderQuizContent() {
    if (showRecommendations) {
        renderRecommendationsView();
        return;
    }

    if (showQuizResults) {
        renderQuizResults();
        return;
    }

    // Render quiz question
    const q = quizQuestions[currentQuizQuestion];
    const progress = ((currentQuizQuestion + 1) / quizQuestions.length) * 100;
    const isAnswered = quizAnswers[q.id] !== undefined;

    quizContent.innerHTML = `
        <div class="quiz-header">
            <div class="quiz-header-top">
                <div class="quiz-title-area">
                    <i class="fa-solid fa-gamepad"></i>
                    <h2>Gamer Personality Quiz</h2>
                </div>
                <button onclick="closeQuizModal()" class="close-icon">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="quiz-progress-info">
                <span>${currentQuizQuestion + 1} / ${quizQuestions.length}</span>
            </div>
            <div class="quiz-progress-bar-bg">
                <div class="quiz-progress-fill" style="width: ${progress}%"></div>
            </div>
        </div>

        <div class="quiz-body">
            <p class="quiz-category">${q.category}</p>
            <h3 class="quiz-question">${q.question}</h3>
            <div class="quiz-options">
                ${q.options.map(option => {
                    const isSelected = quizAnswers[q.id] === option.value;
                    return `
                        <button 
                            onclick="handleQuizAnswer('${q.id}', '${option.value}')"
                            class="quiz-option ${isSelected ? 'selected' : ''}"
                        >
                            ${option.label}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="quiz-footer">
            <button 
                onclick="handleQuizPrevious()"
                class="btn-secondary"
                ${currentQuizQuestion === 0 ? 'disabled' : ''}
            >
                <i class="fa-solid fa-chevron-left"></i> Previous
            </button>
            <button 
                onclick="handleQuizNext()"
                class="btn-primary"
                ${!isAnswered ? 'disabled' : ''}
            >
                ${currentQuizQuestion === quizQuestions.length - 1 ? 'Finish' : 'Next'}
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    `;
}

function handleQuizAnswer(questionId, value) {
    quizAnswers[questionId] = value;
    renderQuizContent();
}

function handleQuizNext() {
    if (currentQuizQuestion < quizQuestions.length - 1) {
        currentQuizQuestion++;
        renderQuizContent();
    } else {
        showQuizResults = true;
        hasCompletedQuiz = true;
        saveToLocalStorage();
        
        // Re-score all games
        gameLibrary.forEach(game => {
            game.aiScore = calculateGameScore(game);
        });
        saveToLocalStorage();
        renderLibrary();
        renderQuizContent();
    }
}

function handleQuizPrevious() {
    if (currentQuizQuestion > 0) {
        currentQuizQuestion--;
        renderQuizContent();
    }
}

function renderQuizResults() {
    quizContent.innerHTML = `
        <div class="quiz-header">
            <div class="quiz-header-top">
                <div class="quiz-title-area">
                    <i class="fa-solid fa-trophy"></i>
                    <h2>Quiz Complete!</h2>
                </div>
                <button onclick="closeQuizModal()" class="close-icon">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <div class="quiz-body" style="text-align: center;">
            <div style="margin-bottom: 30px;">
                <i class="fa-solid fa-circle-check" style="font-size: 4rem; color: var(--success); margin-bottom: 20px; display: block;"></i>
                <h3 style="font-size: 1.8rem; margin-bottom: 10px; font-family: 'Rajdhani', sans-serif; font-weight: 700;">Your Profile is Ready!</h3>
                <p style="color: var(--text-muted); font-size: 1rem;">Your backlog is now intelligently ranked based on your preferences.</p>
            </div>

            <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--border);">
                <h4 style="margin-bottom: 15px; color: var(--accent); font-family: 'Rajdhani', sans-serif; font-size: 1.2rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Answers Summary</h4>
                <div style="max-height: 300px; overflow-y: auto; text-align: left;">
                    ${quizQuestions.map((q, idx) => `
                        <div style="margin-bottom: 15px; padding: 12px; background: var(--bg-color); border-radius: 8px; border: 1px solid var(--border);">
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Q${idx + 1}: ${q.category}</p>
                            <p style="font-weight: 600; color: var(--text-main); margin-bottom: 3px; font-size: 0.85rem;">${q.question}</p>
                            <p style="color: var(--accent); font-weight: 600; font-size: 0.9rem;">→ ${q.options.find(opt => opt.value === quizAnswers[q.id])?.label || 'Not answered'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="quiz-footer" style="flex-direction: column; gap: 10px;">
            <button onclick="handleViewRecommendations()" class="btn-primary" style="width: 100%; justify-content: center;">
                <i class="fa-solid fa-sparkles"></i> View Recommended Games
            </button>
            <button onclick="handleRetakeQuiz()" class="btn-secondary" style="width: 100%; justify-content: center;">
                <i class="fa-solid fa-rotate-right"></i> Retake Quiz
            </button>
            <button onclick="closeQuizModal()" class="btn-text" style="width: 100%; justify-content: center; color: var(--text-muted);">
                Close & View My Backlog
            </button>
        </div>
    `;
}

async function handleViewRecommendations() {
    showRecommendations = true;
    renderQuizContent();
    await fetchGameRecommendations();
    renderQuizContent();
}

function handleRetakeQuiz() {
    currentQuizQuestion = 0;
    quizAnswers = {};
    showQuizResults = false;
    showRecommendations = false;
    recommendations = [];
    renderQuizContent();
}

function closeQuizModal() {
    quizModal.classList.add('hidden');
    renderLibrary();
}

// ===== GAME RECOMMENDATIONS =====
async function fetchGameRecommendations() {
    const preferenceScores = analyzeAnswers();
    const searchQueries = generateSearchQueries(preferenceScores);
    
    try {
        recommendations = [];
        for (const query of searchQueries) {
            const response = await fetch(
                `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=5&ordering=-rating`
            );
            const data = await response.json();
            if (data.results) {
                recommendations = [...recommendations, ...data.results.slice(0, 3)];
            }
        }
        // Remove duplicates and limit to 12
        const uniqueGames = [...new Map(recommendations.map(item => [item.id, item])).values()];
        recommendations = uniqueGames.slice(0, 12);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        recommendations = [];
    }
}

function analyzeAnswers() {
    const scores = {
        story: 0,
        gameplay: 0,
        completionist: 0,
        competitive: 0,
        indie: 0,
        aaa: 0,
        rpg: 0,
        action: 0
    };
    
    if (quizAnswers['completion_satisfaction'] === 'narrative') scores.story += 2;
    if (quizAnswers['completion_satisfaction'] === 'completionist') scores.completionist += 2;
    if (quizAnswers['completion_satisfaction'] === 'mastery') scores.competitive += 2;
    
    if (quizAnswers['story_vs_gameplay'] === 'worth_suffering') scores.story += 2;
    if (quizAnswers['story_vs_gameplay'] === 'gameplay_first') scores.gameplay += 2;
    
    if (quizAnswers['taste_description'] === 'open_quality') scores.aaa += 1;
    if (quizAnswers['taste_description'] === 'expand_horizons') scores.indie += 1;
    
    if (quizAnswers['ideal_length'] === 'epic') scores.rpg += 2;
    if (quizAnswers['ideal_length'] === 'short') scores.action += 1;
    
    return scores;
}

function generateSearchQueries(scores) {
    const queries = [];
    
    if (scores.story > 0) queries.push('narrative story-driven');
    if (scores.rpg > 0) queries.push('RPG role-playing');
    if (scores.action > 0) queries.push('action adventure');
    if (scores.completionist > 0) queries.push('open-world sandbox');
    if (scores.gameplay > 0) queries.push('gameplay mechanics');
    
    if (queries.length === 0) {
        queries.push('adventure', 'puzzle', 'strategy');
    }
    
    return queries.slice(0, 4);
}

function renderRecommendationsView() {
    quizContent.innerHTML = `
        <div class="quiz-header">
            <div class="quiz-header-top">
                <div class="quiz-title-area">
                    <i class="fa-solid fa-sparkles"></i>
                    <h2>Recommended Games</h2>
                </div>
                <button onclick="closeQuizModal()" class="close-icon">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div style="padding: 15px 30px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border);">
                <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">Based on your gaming personality profile</p>
            </div>
        </div>

        <div class="quiz-body">
            <button onclick="handleBackToResults()" class="btn-text" style="margin-bottom: 20px;">
                <i class="fa-solid fa-chevron-left"></i> Back to Results
            </button>

            ${recommendations.length === 0 ? `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: var(--accent); margin-bottom: 20px; display: inline-block;"></i>
                    <p style="color: var(--text-muted); font-size: 1.1rem;">Loading recommendations...</p>
                </div>
            ` : `
                <div class="recommendations-grid">
                    ${recommendations.map(game => `
                        <div class="recommendation-card">
                            ${game.background_image ? `
                                <div class="rec-card-image">
                                    <img src="${game.background_image}" alt="${game.name}">
                                </div>
                            ` : `
                                <div class="rec-card-image rec-card-no-image">
                                    <i class="fa-solid fa-gamepad"></i>
                                </div>
                            `}
                            <div class="rec-card-body">
                                <h4>${game.name}</h4>
                                <div class="rec-card-rating">
                                    <span class="rating-score">${game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
                                    <span class="rating-max">/ 5.0</span>
                                </div>
                                <div class="rec-card-genres">
                                    ${(game.genres || []).slice(0, 3).map(g => `
                                        <span class="genre-tag">${g.name}</span>
                                    `).join('')}
                                </div>
                                <a href="https://rawg.io/games/${game.slug}" target="_blank" class="rec-card-link">
                                    View Details <i class="fa-solid fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>

        <div class="quiz-footer">
            <button onclick="handleRetakeQuiz()" class="btn-secondary">
                <i class="fa-solid fa-rotate-right"></i> Retake Quiz
            </button>
            <button onclick="handleViewRecommendations()" class="btn-primary">
                <i class="fa-solid fa-arrows-rotate"></i> Refresh
            </button>
        </div>
    `;
}

function handleBackToResults() {
    showRecommendations = false;
    renderQuizContent();
}

// ===== SCORING SYSTEM =====
function calculateGameScore(game) {
    if (!hasCompletedQuiz) return 50;
    
    const scores = {
        enjoyment: calculateEnjoymentScore(game),
        timeToComplete: calculateTimeToCompleteScore(game),
        timeCommitment: calculateTimeCommitmentScore(game),
        completionist: calculateCompletionistScore(game),
        mood: calculateMoodScore(game)
    };
    
    const weights = {
        enjoyment: 0.35,
        timeToComplete: 0.20,
        timeCommitment: 0.15,
        completionist: 0.15,
        mood: 0.15
    };
    
    const overall = 
        scores.enjoyment * weights.enjoyment +
        scores.timeToComplete * weights.timeToComplete +
        scores.timeCommitment * weights.timeCommitment +
        scores.completionist * weights.completionist +
        scores.mood * weights.mood;
    
    return Math.round(overall);
}

function calculateEnjoymentScore(game) {
    let score = 50;
    
    if (quizAnswers.backlog_motivation === 'critically_acclaimed' && game.criticScore >= 85) {
        score += 30;
    }
    if (quizAnswers.backlog_motivation === 'friend_recommended' && game.friendRecommended) {
        score += 25;
    }
    if (quizAnswers.backlog_motivation === 'series_love' && game.favoriteSeries) {
        score += 25;
    }
    if (game.hypeLevel >= 8) score += 20;
    else if (game.hypeLevel >= 6) score += 10;
    
    return Math.min(score, 100);
}

function calculateTimeToCompleteScore(game) {
    const mainHours = parseFloat(game.hours) || 20;
    
    const preferences = {
        'short': { ideal: 5, min: 0, max: 10 },
        'medium': { ideal: 17, min: 10, max: 25 },
        'long': { ideal: 35, min: 25, max: 50 },
        'epic': { ideal: 60, min: 50, max: 200 }
    };
    
    const userPref = preferences[quizAnswers.ideal_length] || preferences.medium;
    
    let score = 50;
    if (mainHours >= userPref.min && mainHours <= userPref.max) {
        const distanceFromIdeal = Math.abs(mainHours - userPref.ideal);
        const range = userPref.max - userPref.min;
        score = 100 - (distanceFromIdeal / range * 30);
    } else if (mainHours < userPref.min) {
        score = 50 - ((userPref.min - mainHours) / userPref.min * 50);
    } else {
        score = 50 - ((mainHours - userPref.max) / userPref.max * 50);
    }
    
    if (quizAnswers.planning_priority === 'shortest_first' && mainHours < 15) {
        score += 20;
    }
    
    return Math.max(0, Math.min(score, 100));
}

function calculateTimeCommitmentScore(game) {
    let score = 70;
    const mainHours = parseFloat(game.hours) || 20;
    
    if (quizAnswers.limited_time === 'steady_progress') {
        if (mainHours > 20) score += 20;
    } else if (quizAnswers.limited_time === 'complete_short') {
        if (mainHours < 15) score += 30;
        else score -= 20;
    } else if (quizAnswers.limited_time === 'mood_based') {
        score += 10;
    }
    
    if (quizAnswers.game_not_clicking === 'push_through') {
        score += 10;
    } else if (quizAnswers.game_not_clicking === 'drop_immediately') {
        score += 5;
    }
    
    return Math.max(0, Math.min(score, 100));
}

function calculateCompletionistScore(game) {
    let score = 50;
    
    const hasCompletionistGoals = game.goals.some(g => 
        g.text.toLowerCase().includes('achievement') || 
        g.text.toLowerCase().includes('100%')
    );
    
    if (quizAnswers.completion_satisfaction === 'story') {
        score += 20;
    } else if (quizAnswers.completion_satisfaction === 'completionist') {
        if (hasCompletionistGoals) score += 25;
    } else if (quizAnswers.completion_satisfaction === 'mastery') {
        score += 15;
    } else if (quizAnswers.completion_satisfaction === 'narrative') {
        score += 15;
    }
    
    return Math.max(0, Math.min(score, 100));
}

function calculateMoodScore(game) {
    let score = 60;
    const mainHours = parseFloat(game.hours) || 20;
    
    if (quizAnswers.planning_priority === 'excitement') {
        score = game.hypeLevel * 10;
    } else if (quizAnswers.planning_priority === 'shortest_first') {
        if (mainHours < 10) score += 40;
        else if (mainHours < 20) score += 20;
        else score -= 20;
    } else if (quizAnswers.planning_priority === 'least_likely') {
        if (game.hypeLevel < 5) score += 30;
    } else if (quizAnswers.planning_priority === 'mix_variety') {
        score += 15;
    }
    
    return Math.max(0, Math.min(score, 100));
}

function getPriorityLabel(score) {
    if (score >= 85) return { text: 'HIGH PRIORITY', color: 'var(--success)', icon: 'fa-fire' };
    if (score >= 70) return { text: 'MEDIUM', color: 'var(--accent)', icon: 'fa-star' };
    if (score >= 50) return { text: 'LOW', color: '#fb8c00', icon: 'fa-circle' };
    return { text: 'CONSIDER REMOVING', color: 'var(--danger)', icon: 'fa-circle-xmark' };
}

// ===== GAME MANAGEMENT =====
btnOpenModal.addEventListener('click', () => {
    if (gameLibrary.length >= MAX_CARDS) {
        alert('Backlog Full! You must complete or remove a game to add more.');
        return;
    }
    resetModal();
    modal.classList.remove('hidden');
});

btnCloseModal.addEventListener('click', () => modal.classList.add('hidden'));

inputSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        btnAiFetch.click();
    }
});

btnAiFetch.addEventListener('click', async (e) => {
    e.preventDefault();
    const query = inputSearch.value.trim();
    if (!query) return;
    await fetchGameDataSmart(query);
});

btnSaveGame.addEventListener('click', addGameToLibrary);

filterInput.addEventListener('input', (e) => {
    renderLibrary(e.target.value.toLowerCase());
});

sortDropdown.addEventListener('change', () => renderLibrary());

inputCustomPlatform.addEventListener('change', (e) => {
    if (e.target.value.trim() !== '') {
        createPlatformChip(e.target.value.trim(), true);
        e.target.value = '';
    }
});

btnAddGoal.addEventListener('click', () => {
    const txt = inputNewGoal.value.trim();
    if (txt) {
        addCustomGoalToUI(txt);
        inputNewGoal.value = '';
    }
});

btnToggleAdvanced.addEventListener('click', () => {
    advancedFields.classList.toggle('hidden');
    const icon = btnToggleAdvanced.querySelector('i');
    icon.className = advancedFields.classList.contains('hidden') ? 
        'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
});

document.getElementById('game-form').addEventListener('change', validateForm);
document.getElementById('game-form').addEventListener('keyup', validateForm);

function resetModal() {
    inputSearch.value = '';
    inputTitle.value = '';
    inputDev.value = '';
    inputGenre.value = '';
    inputHours.value = '';
    inputDesc.value = '';
    inputImg.value = '';
    inputCustomPlatform.value = '';
    inputCriticScore.value = '';
    inputHype.value = '';
    inputFriendRec.checked = false;
    inputFavSeries.checked = false;
    platformChipsContainer.innerHTML = '';
    selectedPlatform = null;
    document.querySelectorAll('.goal-check').forEach(c => c.checked = false);
    customGoalsList.innerHTML = '';
    advancedFields.classList.add('hidden');
    apiStatus.textContent = 'Powered by AI. Enter title and click Auto-Fill.';
    apiStatus.style.color = '#a0a0b0';
    validateForm();
}

function createPlatformChip(name, selectImmediately = false) {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = name;
    chip.onclick = () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedPlatform = name;
        validateForm();
    };
    platformChipsContainer.appendChild(chip);
    if (selectImmediately) chip.click();
}

function addCustomGoalToUI(text) {
    const div = document.createElement('div');
    div.className = 'checkbox-container';
    div.innerHTML = `<input type="checkbox" value="${text}" class="goal-check" checked><span class="checkmark"></span>${text}`;
    div.querySelector('input').addEventListener('change', validateForm);
    customGoalsList.appendChild(div);
    validateForm();
}

function validateForm() {
    const title = inputTitle.value.trim();
    const checks = document.querySelectorAll('.goal-check:checked');
    btnSaveGame.disabled = !(title && selectedPlatform && checks.length > 0);
}

async function fetchGameDataSmart(query) {
    if (!API_KEY || API_KEY.includes('YOUR')) {
        apiStatus.textContent = 'Error: Missing Gemini API Key in script.js';
        apiStatus.style.color = 'var(--danger)';
        return;
    }

    apiStatus.textContent = 'Searching Databases...';
    apiStatus.style.color = 'var(--accent)';
    btnAiFetch.disabled = true;

    try {
        const [aiData, smartImage] = await Promise.all([
            callGeminiForStats(query),
            fetchSmartImage(query)
        ]);

        inputTitle.value = aiData.title || query;
        inputDev.value = aiData.developer || 'Unknown';
        inputGenre.value = aiData.genre || 'Unknown';
        inputDesc.value = aiData.description || '';
        inputHours.value = aiData.estimated_hours_main || '?';
        
        if (aiData.critic_score) inputCriticScore.value = aiData.critic_score;

        platformChipsContainer.innerHTML = '';
        const platforms = Array.isArray(aiData.platforms) ? aiData.platforms : ['PC', 'Console'];
        platforms.forEach(p => createPlatformChip(p));

        if (smartImage) {
            inputImg.value = smartImage;
            apiStatus.textContent = 'Success! Data & Art Found.';
            apiStatus.style.color = 'var(--success)';
        } else {
            inputImg.value = '';
            apiStatus.textContent = 'Data found. No image available (using default).';
            apiStatus.style.color = '#fb8c00';
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        apiStatus.textContent = 'Error fetching data. Try manually.';
        apiStatus.style.color = 'var(--danger)';
    } finally {
        btnAiFetch.disabled = false;
        validateForm();
    }
}

async function callGeminiForStats(query) {
    const models = ['gemini-2.5-flash', 'gemini-2.5-pro'];
    const prompt = `Return a raw JSON object (no markdown) for game "${query}". Fields: title, developer, genre, description (max 2 sentences), platforms (array of strings), estimated_hours_main (number), critic_score (0-100, if known). Use "Unknown" if unsure.`;

    for (const model of models) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                }
            );
            if (!res.ok) continue;
            const data = await res.json();
            const text = data.candidates[0].content.parts[0].text
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            return JSON.parse(text);
        } catch (e) {
            console.log(`Model ${model} failed, trying next...`);
        }
    }
    throw new Error('All AI models failed.');
}

async function fetchSmartImage(query) {
    try {
        const steamImg = await getSteamImage(query);
        if (steamImg) return steamImg;
    } catch (e) {
        console.log('Steam fetch failed, trying Wiki...');
    }

    try {
        const wikiImg = await getWikiImage(query);
        if (wikiImg) return wikiImg;
    } catch (e) {
        console.log('Wiki fetch failed');
    }

    return null;
}

async function getSteamImage(query) {
    const res = await fetch(
        `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=1`
    );
    const data = await res.json();

    if (data && data.length > 0) {
        const steamAppID = data[0].steamAppID;
        if (steamAppID) {
            return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppID}/header.jpg`;
        }
    }
    return null;
}

async function getWikiImage(query) {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' video game')}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.query.search || searchData.query.search.length === 0) return null;

    const pageId = searchData.query.search[0].pageid;
    const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pageids=${pageId}&pithumbsize=600&format=json&origin=*`;
    const imgRes = await fetch(imgUrl);
    const imgData = await imgRes.json();

    const page = imgData.query.pages[pageId];
    if (page.thumbnail && page.thumbnail.source) {
        return page.thumbnail.source;
    }
    return null;
}

function addGameToLibrary() {
    const goalInputs = document.querySelectorAll('.goal-check:checked');
    const goals = Array.from(goalInputs).map(input => ({
        text: input.value,
        completed: false
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
        criticScore: parseInt(inputCriticScore.value) || 75,
        hypeLevel: parseInt(inputHype.value) || 5,
        friendRecommended: inputFriendRec.checked,
        favoriteSeries: inputFavSeries.checked,
        aiScore: 50
    };

    newGame.aiScore = calculateGameScore(newGame);

    gameLibrary.push(newGame);
    saveToLocalStorage();
    renderLibrary();
    modal.classList.add('hidden');
}

function renderLibrary(filterText = '') {
    grid.innerHTML = '';
    countDisplay.textContent = gameLibrary.length;

    let filtered = gameLibrary.filter(g =>
        g.title.toLowerCase().includes(filterText) ||
        g.genre.toLowerCase().includes(filterText) ||
        g.platform.toLowerCase().includes(filterText)
    );

    const sortBy = sortDropdown.value;
    if (sortBy === 'score') {
        filtered.sort((a, b) => (b.aiScore || 50) - (a.aiScore || 50));
    } else if (sortBy === 'title') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'hours') {
        filtered.sort((a, b) => parseFloat(a.hours) - parseFloat(b.hours));
    } else if (sortBy === 'added') {
        filtered.sort((a, b) => b.id - a.id);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state"><p>No games found matching criteria.</p></div>`;
        return;
    }

    filtered.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';

        const bgStyle = game.image ?
            `background-image: url('${game.image}');` :
            `background: linear-gradient(135deg, #2a2a35, #1a1a24);`;

        const completedCount = game.goals.filter(g => g.completed).length;
        const totalCount = game.goals.length;
        const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

        const priority = getPriorityLabel(game.aiScore || 50);

        card.innerHTML = `
            <div class="card-header" style="${bgStyle}">
                <div class="platform-badge">${game.platform}</div>
                ${hasCompletedQuiz ? `
                <div class="ai-score-badge" style="background: ${priority.color};">
                    <i class="fa-solid ${priority.icon}"></i> ${game.aiScore}
                </div>` : ''}
            </div>
            <div class="card-body">
                <h3 class="card-title">${game.title}</h3>
                <div class="card-meta">
                    <span>${game.developer}</span>
                    <span>${game.genre}</span>
                </div>
                <p class="card-desc">${game.description}</p>
                <div class="card-meta"><i class="fa-regular fa-clock"></i> ${game.hours}h</div>

                ${hasCompletedQuiz ? `
                <div class="ai-recommendation">
                    <i class="fa-solid ${priority.icon}"></i> ${priority.text}
                </div>` : ''}

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

                <button class="btn-remove" data-id="${game.id}">
                    <i class="fa-solid fa-trash"></i> Remove
                </button>
            </div>
        `;

        const goalListContainer = card.querySelector(`#goals-list-${game.id}`);
        game.goals.forEach((goal, index) => {
            const goalDiv = document.createElement('div');
            goalDiv.className = `goal-item ${goal.completed ? 'completed' : ''}`;
            goalDiv.innerHTML = `<i class="fa-regular ${goal.completed ? 'fa-square-check' : 'fa-square'}"></i> ${goal.text}`;
            goalDiv.addEventListener('click', () => toggleGoal(game.id, index));
            goalListContainer.appendChild(goalDiv);
        });

        const slider = card.querySelector('.sat-slider');
        slider.addEventListener('input', (e) => {
            game.satisfaction = e.target.value;
            const valSpan = card.querySelector(`#sat-val-${game.id}`);
            valSpan.textContent = `${e.target.value}%`;
            const val = parseInt(e.target.value);
            if (val > 50) valSpan.style.color = 'var(--success)';
            else if (val < -50) valSpan.style.color = 'var(--danger)';
            else valSpan.style.color = 'var(--accent)';
            saveToLocalStorage();
        });

        const btnRemove = card.querySelector('.btn-remove');
        btnRemove.addEventListener('click', () => removeGame(game.id));

        grid.appendChild(card);
    });
}

function toggleGoal(gameId, goalIndex) {
    const game = gameLibrary.find(g => g.id === gameId);
    if (game) {
        game.goals[goalIndex].completed = !game.goals[goalIndex].completed;
        saveToLocalStorage();
        renderLibrary(filterInput.value.toLowerCase());
    }
}

function removeGame(gameId) {
    if (confirm('Remove this game from your backlog?')) {
        gameLibrary = gameLibrary.filter(g => g.id !== gameId);
        saveToLocalStorage();
        renderLibrary(filterInput.value.toLowerCase());
    }
}

// ===== LOCAL STORAGE =====
function saveToLocalStorage() {
    localStorage.setItem('gameLibrary', JSON.stringify(gameLibrary));
    localStorage.setItem('quizAnswers', JSON.stringify(quizAnswers));
    localStorage.setItem('hasCompletedQuiz', hasCompletedQuiz);
}

function loadFromLocalStorage() {
    const savedLibrary = localStorage.getItem('gameLibrary');
    const savedQuiz = localStorage.getItem('quizAnswers');
    const savedQuizStatus = localStorage.getItem('hasCompletedQuiz');

    if (savedLibrary) gameLibrary = JSON.parse(savedLibrary);
    if (savedQuiz) quizAnswers = JSON.parse(savedQuiz);
    if (savedQuizStatus) hasCompletedQuiz = savedQuizStatus === 'true';
}
