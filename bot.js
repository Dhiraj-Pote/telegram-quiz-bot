// Telegram Quiz Bot - Daily Quiz with 2-Day Validity
// File: bot.js

const TelegramBot = require('node-telegram-bot-api');
const Database = require('better-sqlite3');

// ============= CONFIGURATION =============
const BOT_TOKEN = '8590540828:AAFDdhQzqP3_LQLcTLPNZbtOe8s2Mb8A3DU';
const DATABASE_PATH = process.env.DATABASE_PATH || './quiz.db';
const db = new Database(DATABASE_PATH);

// SQLite optimizations for better performance and reliability
db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
db.pragma('synchronous = NORMAL'); // Balance between safety and speed
db.pragma('foreign_keys = ON'); // Enable foreign key constraints
db.pragma('temp_store = MEMORY'); // Store temp tables in memory

console.log('📁 Database path:', DATABASE_PATH);
console.log('✅ SQLite optimizations applied');

// Admin username (can attempt quiz unlimited times)
const ADMIN_USERNAME = 'ys16108';

// ============= DAILY QUIZ QUESTIONS =============
// Change these questions daily! Format: YYYY-MM-DD
const DAILY_QUIZZES = {
  '2025-12-25': {
 questions: [
      {
        question: "What spiritual benefit is gained by hearing or telling this story?",
        options: [
          "Gain physical strength of a boar",
          "Never face financial loss",
          "Freed from brahmana-killing sin, gain Vaikuṇṭha",
          "Become the next Lord Brahma"
        ],
        correct: 2 // C
      },
      {
        question: "Why did Brahmā call Hiraṇyākṣa 'blessed'?",
        options: [
          "His brother would avenge him",
          "He died seeing the Supreme Lord's face",
          "He was the strongest demon ever",
          "He was granted a place in sun planet"
        ],
        correct: 1 // B
      },


 {
        question: "How was Hiraṇyākṣa finally killed by the Lord?",
        options: [
          "Striking of His mace",
          "Sudarśana Cakra",
          "Slap at the root of the ear",
          "Crushing of His forefeet"
        ],
        correct: 2 // C
      },
      {
        question: "How did the Lord feel the impact of the demon's hard fist?",
        options: [
          "Mountain struck by thunderbolt",
          "Elephant struck by flowers",
          "Caused Him great pain",
          "Slight scratch on His chest"
        ],
        correct: 1 // B: Like an elephant struck by a wreath of flowers
      },

      {
        question: "What did Hiraṇyākṣa do when all his weapons were broken and his magic failed?",
        options: [
          "Tried to crush the Lord in embrace",
          "Begged for immortality boon",
          "Dove into ocean depths to hide",
          "Threw a mountain at the Lord"
        ],
        correct: 0 // A
      },
      {
        question: "How did the Lord bring an end to all the demon's mystic conjuring tricks?",
        options: [
          "Drinking rain of blood and pus",
          "Blowing His conchshell Pāñcajanya",
          "Striking ground with His hoof",
          "Casting His Sudarśana Cakra"
        ],
        correct: 3 // D
      },
      {
        question: "How did Hiraṇyākṣa react when the Lord stood before him unarmed after losing His mace?",
        options: [
          "Laughed and tried to grab Earth",
          "Immediately struck Lord's chest",
          "Respected combat laws, did not strike",
          "Surrendered respecting Lord's bravery"
        ],
        correct: 2 // C
      },
    
      {
        question: "What distinguishes the Lord from the inhabitants of Vaikuṇṭha?",
        options: [
          "Distinct bodily form",
          "Golden Mukuta crown",
          "Peacock feather",
          "Śrīvatsa mark on His chest"
        ],
        correct: 3 // D: The Śrīvatsa mark
      }
    ],    
    validUntil: '2025-12-27' // 2 days validity
  },
  // Add new quiz for next day
  '2025-12-30': {
    questions: [
      {
        question: "What happened to Brahmā's body when his sons, the Kumāras, refused to follow his orders?",
        options: [
          "Filled with terrible anger he tried to suppress",
          "Gave up his life and took new body",
          "Laughed at their determination",
          "Fell into deep sleep from disappointment"
        ],
        correct: 0 // A
      },
      {
        question: "Who was born from between the eyebrows of Brahmā as a result of his suppressed anger?",
        options: [
          "Lord Rudra (Śiva)",
          "Nārada Muni",
          "Dakṣa",
          "Kardama Muni"
        ],
        correct: 0 // A
      },
      {
        question: "Which group of beings was created from Brahmā's 'shining' and 'jovial' form, associated with the daytime?",
        options: [
          "Ghosts and spirits",
          "Demigods (Devas)",
          "Rakshasas (Man-eaters)",
          "Pitṛs (Ancestors)"
        ],
        correct: 1 // B
      },
      {
        question: "From which part of Brahmā were the sages (like Marīci, Atri, and Vasiṣṭha) born?",
        options: [
          "Various limbs and parts of his body",
          "His breath (Prāna)",
          "His hair",
          "His tears"
        ],
        correct: 0 // A
      },
      {
        question: "When the Yakṣas and Rākṣasas were born, what was their immediate reaction toward Brahma?",
        options: [
          "Offered prayers and flowers",
          "Ran to eat him from hunger and thirst",
          "Asked for a kingdom to rule",
          "Began performing severe penance"
        ],
        correct: 1 // B
      },
      {
        question: "What entities were created from the hair that dropped from Brahma's body while he was crawling in a frustrated state?",
        options: [
          "Birds and flying insects",
          "Ferocious snakes and cobras (Nāgas)",
          "Forest trees and medicinal herbs",
          "Small animals like rabbits and deer"
        ],
        correct: 1 // B
      },
      {
        question: "From which part of Brahma's body were the ghosts (Bhūtas) and fiends (Piśācas) evolved?",
        options: [
          "His sloth and laziness",
          "His laughter",
          "His shadow",
          "His fingernails"
        ],
        correct: 0 // A
      },
      {
        question: "The more one is free from the desire for sex, the more he is promoted to the level of the demigods.",
        options: [
          "True",
          "False"
        ],
        correct: 0 // True
      }
    ],
    validUntil: '2026-01-02'
  },
  '2026-01-05': {
    questions: [

      {
        question: "Why did Kardama Muni perform penance on the bank of the Sarasvati for ten thousand years?",
        options: [
          "Gain mystic powers to defeat demigods",
          "Escape material world responsibilities",
          "Follow Brahma's command to increase progeny",
          "Become King of the universe"
        ],
        correct: 2 // C
      },
      {
        question: "What is the primary spiritual guideline for selecting a spouse to ensure a stable marriage?",
        options: [
          "Be enamored by external beauty",
          "Prioritize social status and wealth",
          "Select partner of like disposition and spiritual compatibility",
          "Choose based on secular friends' recommendation"
        ],
        correct: 2 // C
      },
      {
        question: "According to SB 12th Canto, what will be the superficial basis of marriage in Kali-yuga?",
        options: [
          "Sex life and physical attraction",
          "Deep philosophical and religious agreement",
          "Mutual desire to serve Supreme Lord",
          "Strict adherence to Vedic lineages"
        ],
        correct: 0 // A
      },
      {
        question: "Why did Kardama Muni worship the Supreme Lord for a wife instead of the demigoddess Uma?",
        options: [
          "Unaware that Uma grants good wives",
          "Bhagavatam recommends worshipping Lord with or without desires",
          "Wanted to prove he was better yogi",
          "Strictly forbidden from speaking to demigods"
        ],
        correct: 1 // B
      },
      {
        question: "How was the sacred Bindu-sarovara formed by the Supreme Personality of Godhead?",
        options: [
          "Striking His lotus feet upon earth",
          "Accumulation of sacrificial offerings",
          "Lord's tears of compassion for Kardama",
          "Melting of Himalayan glaciers"
        ],
        correct: 2 // C
      },
      {
        question: "What does Kardama Muni identify as the only 'sturdy boat' to cross the ocean of material existence?",
        options: [
          "Vast empirical and Vedic knowledge",
          "Shelter and service of Lord's lotus feet",
          "Severe physical austerities",
          "Strict adherence to social and political duties"
        ],
        correct: 1 // B
      },
      {
        question: "Who was the divine son promised to Kardama and Devahuti by the Lord?",
        options: [
          "Prahlad",
          "Kapila",
          "Pruthu Maharaj",
          "Dhruva"
        ],
        correct: 1 // B
      },
      
      {
        question: "What is the result of deficiency in sex life in a Kali-yuga marriage based on sense gratification?",
        options: [
          "Couple will seek counseling from elders",
          "Question of divorce will immediately arise",
          "Couple will turn toward spiritual life together",
          "Perform penance to regain attraction"
        ],
        correct: 1 // B
      },
      {
        question: "In the context of 'akama sarva-kamo va', how should a person with material desires approach worship?",
        options: [
          "Worship many demigods for each desire",
          "Give up worship until they are pure",
          "Worship Supreme Lord with great intensity",
          "Focus only on karma-kanda rituals"
        ],
        correct: 2 // C
      },
      {
        question: "What was the Lord's reaction to seeing Kardama Muni's sincere penance?",
        options: [
          "Felt indifferent to physical suffering",
          "So pleased and compassionate He shed tears",
          "Tested him by offering more material wealth",
          "Asked to continue another ten thousand years"
        ],
        correct: 1 // B
      }
    ],
    validUntil: '2026-01-09'
  }
};

const QUESTION_TIME_LIMIT = 60; // seconds

// ============= HELPER: Get Current Quiz =============
function getCurrentQuizDate() {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day for comparison
  
  // Check if today's quiz exists and is valid
  if (DAILY_QUIZZES[today]) {
    const validUntil = new Date(DAILY_QUIZZES[today].validUntil);
    validUntil.setHours(23, 59, 59, 999); // Set to end of day
    if (now <= validUntil) {
      return today;
    }
  }
  
  // Check all quizzes to find one that's still valid
  for (const quizDate in DAILY_QUIZZES) {
    const validUntil = new Date(DAILY_QUIZZES[quizDate].validUntil);
    validUntil.setHours(23, 59, 59, 999); // Set to end of day
    const quizDateObj = new Date(quizDate);
    quizDateObj.setHours(0, 0, 0, 0);
    
    // Quiz is valid if we're between quiz date and validUntil date
    if (quizDateObj <= now && now <= validUntil) {
      return quizDate;
    }
  }
  
  return null;
}

function getQuizQuestions(quizDate) {
  return DAILY_QUIZZES[quizDate]?.questions || [];
}

// ============= DATABASE SETUP =============
db.exec(`CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER,
  quiz_date TEXT,
  username TEXT,
  first_name TEXT,
  has_attempted INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, quiz_date)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  quiz_date TEXT,
  username TEXT,
  first_name TEXT,
  score INTEGER,
  total_time INTEGER,
  user_answers TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.exec(`CREATE TABLE IF NOT EXISTS active_quizzes (
  user_id INTEGER PRIMARY KEY,
  quiz_date TEXT,
  current_question INTEGER,
  score INTEGER,
  start_time INTEGER,
  question_start_time INTEGER,
  user_answers TEXT
)`);

// Restore leaderboard data if database is empty (first deployment to volume)
function restoreLeaderboardIfNeeded() {
  const quizDate = '2025-12-25';
  const existingData = db.prepare('SELECT COUNT(*) as count FROM results WHERE quiz_date = ?').get(quizDate);
  
  if (existingData.count === 0) {
    console.log('📊 Restoring leaderboard data...');
    
    const leaderboardData = [
      { username: 'ys16108', first_name: 'Ys', score: 7, total_time: 94, user_id: 1001 },
      { username: 'shubham', first_name: 'Shubham', score: 7, total_time: 72, user_id: 1002 },
      { username: 'dhiraj', first_name: 'Dhiraj', score: 7, total_time: 180, user_id: 1003 },
      { username: 'ashish', first_name: 'Ashish', score: 5, total_time: 115, user_id: 1004 }
    ];
    
    const insertResult = db.prepare(
      'INSERT INTO results (user_id, quiz_date, username, first_name, score, total_time, user_answers) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    
    const insertUser = db.prepare(
      'INSERT INTO users (user_id, quiz_date, username, first_name, has_attempted) VALUES (?, ?, ?, ?, 1)'
    );
    
    leaderboardData.forEach(entry => {
      const userAnswers = JSON.stringify(Array(8).fill(0));
      insertResult.run(entry.user_id, quizDate, entry.username, entry.first_name, entry.score, entry.total_time, userAnswers);
      insertUser.run(entry.user_id, quizDate, entry.username, entry.first_name);
    });
    
    console.log('✅ Leaderboard data restored!');
  }
}

restoreLeaderboardIfNeeded();

// ============= BOT INITIALIZATION =============
const bot = new TelegramBot(BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});
const userTimers = {};

// ============= HELPER FUNCTIONS =============
// Prepare statements once for better performance
const preparedStatements = {
  hasUserAttempted: db.prepare('SELECT has_attempted FROM users WHERE user_id = ? AND quiz_date = ?'),
  markUserAttempted: db.prepare('INSERT OR REPLACE INTO users (user_id, quiz_date, username, first_name, has_attempted) VALUES (?, ?, ?, ?, 1)'),
  saveResult: db.prepare('INSERT INTO results (user_id, quiz_date, username, first_name, score, total_time, user_answers) VALUES (?, ?, ?, ?, ?, ?, ?)'),
  getUserResult: db.prepare('SELECT * FROM results WHERE user_id = ? AND quiz_date = ?'),
  getLeaderboard: db.prepare('SELECT username, first_name, score, total_time FROM results WHERE quiz_date = ? ORDER BY score DESC, total_time ASC LIMIT 10'),
  startQuiz: db.prepare('INSERT OR REPLACE INTO active_quizzes (user_id, quiz_date, current_question, score, start_time, question_start_time, user_answers) VALUES (?, ?, 0, 0, ?, ?, ?)'),
  getQuizState: db.prepare('SELECT * FROM active_quizzes WHERE user_id = ?'),
  updateQuizState: db.prepare('UPDATE active_quizzes SET current_question = ?, score = ?, question_start_time = ?, user_answers = ? WHERE user_id = ?'),
  deleteQuizState: db.prepare('DELETE FROM active_quizzes WHERE user_id = ?')
};

function hasUserAttempted(userId, quizDate) {
  const row = preparedStatements.hasUserAttempted.get(userId, quizDate);
  return row && row.has_attempted === 1;
}

function markUserAttempted(userId, quizDate, username, firstName) {
  preparedStatements.markUserAttempted.run(userId, quizDate, username, firstName);
}

function saveResult(userId, quizDate, username, firstName, score, totalTime, userAnswers) {
  preparedStatements.saveResult.run(userId, quizDate, username, firstName, score, totalTime, JSON.stringify(userAnswers));
}

function getUserResult(userId, quizDate) {
  return preparedStatements.getUserResult.get(userId, quizDate);
}

function getLeaderboard(quizDate) {
  return preparedStatements.getLeaderboard.all(quizDate);
}

function startQuiz(userId, quizDate) {
  const now = Date.now();
  preparedStatements.startQuiz.run(userId, quizDate, now, now, JSON.stringify([]));
}

function getQuizState(userId) {
  return preparedStatements.getQuizState.get(userId);
}

function updateQuizState(userId, currentQuestion, score, questionStartTime, userAnswers) {
  preparedStatements.updateQuizState.run(currentQuestion, score, questionStartTime, JSON.stringify(userAnswers), userId);
}

function deleteQuizState(userId) {
  preparedStatements.deleteQuizState.run(userId);
}

function clearTimer(userId) {
  if (userTimers[userId]) {
    if (userTimers[userId].timeout) {
      clearTimeout(userTimers[userId].timeout);
    }
    if (userTimers[userId].interval) {
      clearInterval(userTimers[userId].interval);
    }
    delete userTimers[userId];
  }
}

// ============= BOT COMMANDS =============
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || '';
  const isAdmin = username.toLowerCase() === ADMIN_USERNAME.toLowerCase();

  const quizDate = getCurrentQuizDate();
  
  if (!quizDate) {
    bot.sendMessage(chatId, '⚠️ No active quiz available right now. Please check back later!');
    return;
  }

  const attempted = await hasUserAttempted(userId, quizDate);
  const validUntil = DAILY_QUIZZES[quizDate].validUntil;
  const showStartButton = !attempted || isAdmin;

  const welcomeMessage = `🎯 *Śrīmad Bhāgavatam Quiz\n (Canto 3 chapter 20)!*\n\n` +

    `⏰ Valid Until: ${validUntil}\n\n` +
    `Please read SB (Canto 3 chapter 21)\nbefore attempting this quiz\n\n` +

    `${attempted && !isAdmin ? '✅ You have already taken this quiz!\nYou can review your answers.' : '✨ Ready to begin?'}`;

  const keyboard = {
    inline_keyboard: showStartButton ? [
      [{ text: '▶️ Start Quiz', callback_data: 'start_quiz' }],
      [{ text: '🏆 View Leaderboard', callback_data: 'leaderboard' }]
    ] : [
      [{ text: '📝 Review My Answers', callback_data: 'review_answers' }],
      [{ text: '🏆 View Leaderboard', callback_data: 'leaderboard' }]
    ]
  };

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

bot.onText(/\/leaderboard/, async (msg) => {
  const chatId = msg.chat.id;
  const quizDate = getCurrentQuizDate();
  if (quizDate) {
    await showLeaderboard(chatId, quizDate);
  }
});

bot.onText(/\/review/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const quizDate = getCurrentQuizDate();
  if (quizDate) {
    await showReview(chatId, userId, quizDate);
  }
});

bot.onText(/\/clearuser (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || '';
  const isAdmin = username.toLowerCase() === ADMIN_USERNAME.toLowerCase();

  if (!isAdmin) {
    bot.sendMessage(chatId, '⛔ This command is only available for admins.');
    return;
  }

  const targetUsername = match[1].replace('@', ''); // Remove @ if present
  const quizDate = getCurrentQuizDate();

  if (!quizDate) {
    bot.sendMessage(chatId, '⚠️ No active quiz available.');
    return;
  }

  try {
    // First check if user exists
    const checkResult = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM results WHERE username = ? AND quiz_date = ?', [targetUsername, quizDate], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!checkResult) {
      bot.sendMessage(chatId, `⚠️ No results found for @${targetUsername} in quiz ${quizDate}\n\nTip: Username might be stored differently. Use /listusers to see all usernames.`);
      return;
    }

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM results WHERE username = ? AND quiz_date = ?', [targetUsername, quizDate], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE username = ? AND quiz_date = ?', [targetUsername, quizDate], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    bot.sendMessage(chatId, `✅ Cleared results for @${targetUsername} from quiz ${quizDate}`);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error clearing user data: ${error.message}`);
  }
});

bot.onText(/\/listusers/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || '';
  const isAdmin = username.toLowerCase() === ADMIN_USERNAME.toLowerCase();

  if (!isAdmin) {
    bot.sendMessage(chatId, '⛔ This command is only available for admins.');
    return;
  }

  const quizDate = getCurrentQuizDate();
  if (!quizDate) {
    bot.sendMessage(chatId, '⚠️ No active quiz available.');
    return;
  }

  try {
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT username, first_name, score FROM results WHERE quiz_date = ? ORDER BY score DESC', [quizDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (users.length === 0) {
      bot.sendMessage(chatId, 'No users found for current quiz.');
      return;
    }

    let userList = `👥 *Users in Quiz ${quizDate}:*\n\n`;
    users.forEach((user, index) => {
      userList += `${index + 1}. @${user.username || 'unknown'} (${user.first_name || 'N/A'}) - Score: ${user.score}\n`;
    });

    bot.sendMessage(chatId, userList, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// ============= CALLBACK HANDLERS =============
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  const quizDate = getCurrentQuizDate();
  if (!quizDate) {
    bot.answerCallbackQuery(query.id, { text: 'No active quiz!', show_alert: true });
    return;
  }

  if (data === 'start_quiz') {
    const username = query.from.username || '';
    const isAdmin = username.toLowerCase() === ADMIN_USERNAME.toLowerCase();
    
    const attempted = await hasUserAttempted(userId, quizDate);
    if (attempted && !isAdmin) {
      bot.answerCallbackQuery(query.id, { text: 'You already took this quiz!', show_alert: true });
      return;
    }

    await startQuiz(userId, quizDate);
    await sendQuestion(chatId, userId, quizDate, 0);
  } else if (data === 'leaderboard') {
    await showLeaderboard(chatId, quizDate);
  } else if (data === 'review_answers') {
    await showReview(chatId, userId, quizDate);
  } else if (data.startsWith('answer_')) {
    const parts = data.split('_');
    const questionIndex = parseInt(parts[1]);
    const answerIndex = parseInt(parts[2]);

    clearTimer(userId);
    await handleAnswer(chatId, userId, query.message.message_id, quizDate, questionIndex, answerIndex);
  }

  bot.answerCallbackQuery(query.id);
});

// ============= QUIZ LOGIC =============
async function sendQuestion(chatId, userId, quizDate, questionIndex) {
  const questions = getQuizQuestions(quizDate);
  
  if (questionIndex >= questions.length) {
    await finishQuiz(chatId, userId, quizDate);
    return;
  }

  const question = questions[questionIndex];

  const questionText = `📝 *Question ${questionIndex + 1}/${questions.length}*\n\n` +
    `${question.question}\n\n` +
    `⏱️ Time: 60 seconds`;

  const keyboard = {
    inline_keyboard: question.options.map((option, index) => [
      { text: option, callback_data: `answer_${questionIndex}_${index}` }
    ])
  };

  const sentMessage = await bot.sendMessage(chatId, questionText, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });

  // Store the start time for this question
  const questionStartTime = Date.now();
  
  // Update timer display every 5 seconds
  const timerInterval = setInterval(async () => {
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    const remaining = Math.max(0, QUESTION_TIME_LIMIT - elapsed);
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      return;
    }

    const updatedText = `📝 *Question ${questionIndex + 1}/${questions.length}*\n\n` +
      `${question.question}\n\n` +
      `⏱️ Time: ${remaining} seconds`;

    try {
      await bot.editMessageText(updatedText, {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      // Message might have been answered, clear interval
      clearInterval(timerInterval);
    }
  }, 5000); // Update every 5 seconds

  userTimers[userId] = {
    timeout: setTimeout(async () => {
      clearInterval(timerInterval);
      await handleTimeout(chatId, userId, sentMessage.message_id, quizDate, questionIndex);
    }, QUESTION_TIME_LIMIT * 1000),
    interval: timerInterval
  };
}

async function handleAnswer(chatId, userId, messageId, quizDate, questionIndex, answerIndex) {
  const questions = getQuizQuestions(quizDate);
  const question = questions[questionIndex];
  const state = await getQuizState(userId);
  
  // Check if state exists (user might have lost session)
  if (!state) {
    await bot.editMessageText('⚠️ Quiz session expired. Please use /start to begin a new quiz.', {
      chat_id: chatId,
      message_id: messageId
    });
    clearTimer(userId);
    return;
  }
  
  const isCorrect = answerIndex === question.correct;

  // Clear both timeout and interval when answer is selected
  clearTimer(userId);

  const userAnswers = JSON.parse(state.user_answers);
  userAnswers.push(answerIndex);

  let feedbackText = '';

  if (isCorrect) {
    feedbackText = `✅ *Correct!*\n\n${question.question}\n\n✓ ${question.options[question.correct]}`;
    await updateQuizState(userId, state.current_question + 1, state.score + 1, Date.now(), userAnswers);
  } else {
    feedbackText = `❌ *Wrong!*\n\n${question.question}\n\n` +
      `Your answer: ${question.options[answerIndex]}\n` +
      `Correct answer: ✓ ${question.options[question.correct]}`;
    await updateQuizState(userId, state.current_question + 1, state.score, Date.now(), userAnswers);
  }

  await bot.editMessageText(feedbackText, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown'
  });

  setTimeout(async () => {
    await sendQuestion(chatId, userId, quizDate, questionIndex + 1);
  }, 2000);
}

async function handleTimeout(chatId, userId, messageId, quizDate, questionIndex) {
  const questions = getQuizQuestions(quizDate);
  const question = questions[questionIndex];
  const state = await getQuizState(userId);
  
  // Check if state exists (user might have lost session)
  if (!state) {
    await bot.editMessageText('⚠️ Quiz session expired. Please use /start to begin a new quiz.', {
      chat_id: chatId,
      message_id: messageId
    });
    clearTimer(userId);
    return;
  }

  const userAnswers = JSON.parse(state.user_answers);
  userAnswers.push(null);

  const timeoutText = `⏰ *Time's Up!*\n\n${question.question}\n\n` +
    `Correct answer: ✓ ${question.options[question.correct]}`;

  await bot.editMessageText(timeoutText, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown'
  });

  await updateQuizState(userId, state.current_question + 1, state.score, Date.now(), userAnswers);

  setTimeout(async () => {
    await sendQuestion(chatId, userId, quizDate, questionIndex + 1);
  }, 2000);
}

async function finishQuiz(chatId, userId, quizDate) {
  const state = await getQuizState(userId);
  const totalTime = Math.floor((Date.now() - state.start_time) / 1000);
  const userAnswers = JSON.parse(state.user_answers);

  const user = await bot.getChat(userId).catch(() => ({ username: 'Unknown', first_name: 'User' }));

  await markUserAttempted(userId, quizDate, user.username || 'Unknown', user.first_name || 'User');
  await saveResult(userId, quizDate, user.username || 'Unknown', user.first_name || 'User', state.score, totalTime, userAnswers);
  await deleteQuizState(userId);
  clearTimer(userId);

  const questions = getQuizQuestions(quizDate);
  let resultEmoji = '🎉';
  let resultMessage = 'Outstanding!';
  
  if (state.score >= 4) {
    resultEmoji = '🏆';
    resultMessage = 'Excellent work!';
  } else if (state.score >= 3) {
    resultEmoji = '👏';
    resultMessage = 'Good job!';
  } else {
    resultEmoji = '💪';
    resultMessage = 'Keep practicing!';
  }

  const resultText = `${resultEmoji} *Quiz Complete!*\n\n` +
    `${resultMessage}\n\n` +
    `📊 *Your Results:*\n` +
    `Score: ${state.score}/${questions.length}\n` +
    `Time: ${totalTime} seconds`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '📝 Review Your Answers', callback_data: 'review_answers' }],
      [{ text: '🏆 View Leaderboard', callback_data: 'leaderboard' }]
    ]
  };

  bot.sendMessage(chatId, resultText, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

async function showReview(chatId, userId, quizDate) {
  const result = await getUserResult(userId, quizDate);
  
  if (!result) {
    bot.sendMessage(chatId, '⚠️ You haven\'t taken this quiz yet!');
    return;
  }

  const questions = getQuizQuestions(quizDate);
  const userAnswers = JSON.parse(result.user_answers);

  let reviewText = `📝 *Your Quiz Review*\n\n`;
  reviewText += `📊 Score: ${result.score}/${questions.length}\n`;
  reviewText += `⏱️ Time: ${result.total_time}s\n\n`;

  questions.forEach((q, qIndex) => {
    const userChoice = userAnswers[qIndex];
    const isCorrect = userChoice === q.correct;
    
    reviewText += `*Q${qIndex + 1}: ${q.question}*\n`;
    
    if (userChoice === null) {
      reviewText += `⏰ Time's up - No answer\n`;
    } else if (isCorrect) {
      reviewText += `✅ Your answer: ${q.options[userChoice]}\n`;
    } else {
      reviewText += `❌ Your answer: ${q.options[userChoice]}\n`;
      reviewText += `✓ Correct: ${q.options[q.correct]}\n`;
    }
    reviewText += `\n`;
  });

  bot.sendMessage(chatId, reviewText, { parse_mode: 'Markdown' });
}

async function showLeaderboard(chatId, quizDate) {
  const leaderboard = await getLeaderboard(quizDate);
  const questions = getQuizQuestions(quizDate);
  const totalQuestions = questions.length;

  if (leaderboard.length === 0) {
    bot.sendMessage(chatId, '🏆 *Leaderboard*\n\nNo results yet. Be the first!', {
      parse_mode: 'Markdown'
    });
    return;
  }

  let leaderboardText = `🏆 *Leaderboard - ${quizDate}*\n\n`;

  leaderboard.forEach((entry, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    const name = entry.first_name || entry.username || 'Anonymous';
    leaderboardText += `${medal} *${name}* - ${entry.score}/${totalQuestions} (${entry.total_time}s)\n`;
  });

  bot.sendMessage(chatId, leaderboardText, { parse_mode: 'Markdown' });
}

// ============= ERROR HANDLING =============
bot.on('polling_error', (error) => {
  console.log('Polling error:', error.code, error.message);
  
  // Don't crash on network errors, let it retry
  if (error.code === 'EFATAL' || error.code === 'ETELEGRAM') {
    console.log('Network error detected, bot will retry automatically...');
  }
});

// Handle process termination gracefully
process.once('SIGINT', () => {
  console.log('Bot stopping...');
  bot.stopPolling();
  db.close();
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('Bot stopping...');
  bot.stopPolling();
  db.close();
  process.exit(0);
});

console.log('🤖 Daily Quiz Bot is running...');
console.log('Current quiz date:', getCurrentQuizDate());
console.log('📅 Remember to add new quiz questions daily!');