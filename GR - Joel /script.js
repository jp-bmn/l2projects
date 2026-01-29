const questions = [
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

let currentQuestion = 0;
let answers = {};
let showResults = false;
let showRecommendations = false;
let recommendations = [];

async function fetchGameRecommendations() {
  const preferenceScores = analyzeAnswers();
  const searchQueries = generateSearchQueries(preferenceScores);
  
  try {
    recommendations = [];
    for (const query of searchQueries) {
      const response = await fetch(`https://api.rawg.io/api/games?key=2ba9173f79c54187be93d77b1b526bf3&search=${encodeURIComponent(query)}&page_size=5&ordering=-rating`);
      const data = await response.json();
      if (data.results) {
        recommendations = [...recommendations, ...data.results.slice(0, 3)];
      }
    }
    recommendations = recommendations.slice(0, 12);
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
  
  // Analyze answers and weight preferences
  if (answers['completion_satisfaction'] === 'narrative') scores.story += 2;
  if (answers['completion_satisfaction'] === 'completionist') scores.completionist += 2;
  if (answers['completion_satisfaction'] === 'mastery') scores.competitive += 2;
  
  if (answers['story_vs_gameplay'] === 'worth_suffering') scores.story += 2;
  if (answers['story_vs_gameplay'] === 'gameplay_first') scores.gameplay += 2;
  
  if (answers['taste_description'] === 'open_quality') scores.aaa += 1;
  if (answers['taste_description'] === 'expand_horizons') scores.indie += 1;
  
  if (answers['ideal_length'] === 'epic') scores.rpg += 2;
  if (answers['ideal_length'] === 'short') scores.action += 1;
  
  return scores;
}

function generateSearchQueries(scores) {
  const queries = [];
  
  if (scores.story > 0) queries.push('narrative story-driven');
  if (scores.rpg > 0) queries.push('RPG role-playing');
  if (scores.action > 0) queries.push('action adventure');
  if (scores.completionist > 0) queries.push('open-world sandbox collectibles');
  if (scores.gameplay > 0) queries.push('gameplay mechanics challenging');
  
  // Add default queries if none selected
  if (queries.length === 0) {
    queries.push('adventure', 'puzzle', 'strategy');
  }
  
  return queries.slice(0, 4);
}

function renderQuiz() {
  const app = document.getElementById('app');
  
  if (showRecommendations) {
    renderRecommendations();
    return;
  }
  
  if (showResults) {
    app.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div class="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-purple-500">
          <div class="text-center mb-6">
            <div class="w-16 h-16 text-purple-400 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><circle cx="12" cy="15" r="1.5"/><circle cx="19" cy="15" r="1.5"/><path d="M8 15h4M15 15h4"/></svg>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
            <p class="text-slate-300">Your gaming profile has been recorded.</p>
          </div>

          <div class="bg-slate-700 rounded-xl p-6 mb-6">
            <h3 class="text-xl font-semibold text-white mb-4">Your Answers:</h3>
            <div class="space-y-3 max-h-96 overflow-y-auto">
              ${questions.map((q, idx) => {
                const selectedOption = q.options.find(opt => opt.value === answers[q.id]);
                return `
                  <div class="bg-slate-600 rounded-lg p-3">
                    <p class="text-sm text-slate-300 mb-1">Q${idx + 1}: ${q.question}</p>
                    <p class="text-white font-medium">${selectedOption?.label || 'Not answered'}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="flex gap-4">
            <button onclick="handleViewRecommendations()" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Get Recommendations
            </button>
            <button onclick="handleRestart()" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = answers[currentQ.id] !== undefined;

  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div class="max-w-3xl w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-purple-500">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><circle cx="12" cy="15" r="1.5"/><circle cx="19" cy="15" r="1.5"/><path d="M8 15h4M15 15h4"/></svg>
              </div>
              <h1 class="text-2xl font-bold text-white">Gamer Personality Quiz</h1>
            </div>
            <span class="text-white font-semibold">
              ${currentQuestion + 1} / ${questions.length}
            </span>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-purple-900 rounded-full h-2">
            <div
              class="bg-white h-2 rounded-full transition-all duration-300"
              style="width: ${progress}%"
            />
          </div>
        </div>

        <!-- Question Content -->
        <div class="p-8">
          <div class="mb-6">
            <p class="text-sm text-purple-400 font-semibold mb-2">${currentQ.category}</p>
            <h2 class="text-2xl font-bold text-white mb-6">${currentQ.question}</h2>
          </div>

          <!-- Options -->
          <div class="space-y-3 mb-8">
            ${currentQ.options.map((option) => {
              const isSelected = answers[currentQ.id] === option.value;
              return `
                <button
                  onclick="handleAnswer('${currentQ.id}', '${option.value}')"
                  class="w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-purple-500 hover:bg-slate-600'
                  }"
                >
                  <span class="font-medium">${option.label}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Navigation -->
          <div class="flex justify-between gap-4">
            <button
              onclick="handlePrevious()"
              ${currentQuestion === 0 ? 'disabled' : ''}
              class="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentQuestion === 0
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-600 text-white hover:bg-slate-500'
              }"
            >
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              Previous
            </button>

            <button
              onclick="handleNext()"
              ${!isAnswered ? 'disabled' : ''}
              class="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                !isAnswered
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }"
            >
              ${currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function handleAnswer(questionId, value) {
  answers[questionId] = value;
  renderQuiz();
}

function handleNext() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
  } else {
    showResults = true;
  }
  renderQuiz();
}

function handlePrevious() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuiz();
  }
}

function handleRestart() {
  currentQuestion = 0;
  answers = {};
  showResults = false;
  showRecommendations = false;
  recommendations = [];
  renderQuiz();
}

async function handleViewRecommendations() {
  showRecommendations = true;
  renderQuiz();
  await fetchGameRecommendations();
  renderQuiz();
}

function renderRecommendations() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div class="max-w-5xl w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-purple-500">
        <button onclick="handleBackToResults()" class="mb-6 flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Back to Results
        </button>
        
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">Recommended Games</h2>
          <p class="text-slate-300">Based on your gaming personality profile</p>
        </div>
        
        ${recommendations.length === 0 ? `
          <div class="text-center py-12">
            <div class="inline-block animate-spin mb-4">
              <svg class="w-8 h-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg>
            </div>
            <p class="text-slate-300">Loading recommendations...</p>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${recommendations.map((game) => `
              <div class="bg-slate-700 rounded-lg overflow-hidden hover:border-purple-500 border border-transparent transition-colors">
                ${game.background_image ? `
                  <div class="w-full h-40 overflow-hidden bg-slate-600">
                    <img src="${game.background_image}" alt="${game.name}" class="w-full h-full object-cover hover:scale-105 transition-transform">
                  </div>
                ` : `
                  <div class="w-full h-40 bg-slate-600 flex items-center justify-center">
                    <span class="text-slate-400">No Image</span>
                  </div>
                `}
                <div class="p-4">
                  <h3 class="text-white font-semibold mb-2 line-clamp-2">${game.name}</h3>
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-yellow-400 font-semibold">${game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
                    <span class="text-slate-400 text-sm">/ 5.0</span>
                  </div>
                  <div class="flex flex-wrap gap-1 mb-3">
                    ${(game.genres || []).slice(0, 3).map(g => `
                      <span class="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded">${g.name}</span>
                    `).join('')}
                  </div>
                  <a href="https://rawg.io/games/${game.slug}" target="_blank" class="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">View Details →</a>
                </div>
              </div>
            `).join('')}
          </div>
        `}
        
        <div class="mt-8 pt-6 border-t border-slate-600 flex justify-between">
          <button onclick="handleRestart()" class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Retake Quiz
          </button>
          <button onclick="handleViewRecommendations()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Refresh Recommendations
          </button>
        </div>
      </div>
    </div>
  `;
}

function handleBackToResults() {
  showRecommendations = false;
  renderQuiz();
}

// Initial render
renderQuiz();
