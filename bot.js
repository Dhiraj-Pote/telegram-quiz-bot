// Telegram Quiz Bot - Daily Quiz with 2-Day Validity
// File: bot.js

const TelegramBot = require('node-telegram-bot-api');
const Database = require('better-sqlite3');

// ============= CONFIGURATION =============
const BOT_TOKEN = '8590540828:AAFDdhQzqP3_LQLcTLPNZbtOe8s2Mb8A3DU';
const db = new Database('./quiz.db');

// Admin username (can attempt quiz unlimited times)
const ADMIN_USERNAME = 'ys16108';

// ============= DAILY QUIZ QUESTIONS =============
// Change these questions daily! Format: YYYY-MM-DD
const DAILY_QUIZZES = {
  '2025-12-24': {
    questions: [
      {
        question: "Who is described as the most independent demigod of the universe who came to witness the fight?",
        options: ["Lord Shiva", "Lord Brahma", "Indra", "Manu"],
        correct: 1
      },
      {
        question: "How did Lord Varaha ensure the safety of the Earth before engaging in the final duel?",
        options: ["He placed her on the water and empowered her to float", "He hid the Earth behind the sun", "He handed the Earth over to Lord Brahma", "He swallowed the Earth to keep her safe inside His body"],
        correct: 0
      },
      {
        question: "Why did Lord Brahma urge Lord Varaha to kill the demon quickly without 'playing' with him?",
        options: ["Because the 'demoniac hour' (evening) was fast approaching", "Because the Earth was starting to sink again", "Because the demon was gaining strength from the sun", "Because the demigods were about to lose their immortality"],
        correct: 0
      },
      {
        question: "Did the demon Hiranyaksha glorify the Lord with his words, despite his wanting to deride Him?",
        options: ["True", "False"],
        correct: 0
      },
      {
        question: "Who refuses liberation even if it is offered to them?",
        options: ["Impersonalists", "Asuras", "Karmis", "Devotees of the Lord"],
        correct: 3
      }
    ],
    validUntil: '2025-12-26' // 2 days validity
  },
  // Add new quiz for next day
  '2025-12-26': {
    questions: [
      {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
        correct: 1
      },
      // Add 4 more questions...
    ],
    validUntil: '2025-12-27'
  }
};

const QUESTION_TIME_LIMIT = 60; // seconds

// ============= HELPER: Get Current Quiz =============
function getCurrentQuizDate() {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if today's quiz exists and is valid
  if (DAILY_QUIZZES[today]) {
    const validUntil = new Date(DAILY_QUIZZES[today].validUntil);
    const now = new Date();
    if (now <= validUntil) {
      return today;
    }
  }
  
  // Check for valid quiz from previous day
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (DAILY_QUIZZES[yesterdayStr]) {
    const validUntil = new Date(DAILY_QUIZZES[yesterdayStr].validUntil);
    const now = new Date();
    if (now <= validUntil) {
      return yesterdayStr;
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

// ============= BOT INITIALIZATION =============
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const userTimers = {};

// ============= HELPER FUNCTIONS =============
function hasUserAttempted(userId, quizDate) {
  const row = db.prepare('SELECT has_attempted FROM users WHERE user_id = ? AND quiz_date = ?')
    .get(userId, quizDate);
  return row && row.has_attempted === 1;
}

function markUserAttempted(userId, quizDate, username, firstName) {
  db.prepare(
    'INSERT OR REPLACE INTO users (user_id, quiz_date, username, first_name, has_attempted) VALUES (?, ?, ?, ?, 1)'
  ).run(userId, quizDate, username, firstName);
}

function saveResult(userId, quizDate, username, firstName, score, totalTime, userAnswers) {
  db.prepare(
    'INSERT INTO results (user_id, quiz_date, username, first_name, score, total_time, user_answers) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, quizDate, username, firstName, score, totalTime, JSON.stringify(userAnswers));
}

function getUserResult(userId, quizDate) {
  return db.prepare('SELECT * FROM results WHERE user_id = ? AND quiz_date = ?')
    .get(userId, quizDate);
}

function getLeaderboard(quizDate) {
  return db.prepare(
    `SELECT username, first_name, score, total_time 
     FROM results 
     WHERE quiz_date = ?
     ORDER BY score DESC, total_time ASC 
     LIMIT 10`
  ).all(quizDate);
}

function startQuiz(userId, quizDate) {
  const now = Date.now();
  db.prepare(
    'INSERT OR REPLACE INTO active_quizzes (user_id, quiz_date, current_question, score, start_time, question_start_time, user_answers) VALUES (?, ?, 0, 0, ?, ?, ?)'
  ).run(userId, quizDate, now, now, JSON.stringify([]));
}

function getQuizState(userId) {
  return db.prepare('SELECT * FROM active_quizzes WHERE user_id = ?').get(userId);
}

function updateQuizState(userId, currentQuestion, score, questionStartTime, userAnswers) {
  db.prepare(
    'UPDATE active_quizzes SET current_question = ?, score = ?, question_start_time = ?, user_answers = ? WHERE user_id = ?'
  ).run(currentQuestion, score, questionStartTime, JSON.stringify(userAnswers), userId);
}

function deleteQuizState(userId) {
  db.prepare('DELETE FROM active_quizzes WHERE user_id = ?').run(userId);
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

  const welcomeMessage = `🎯 *Śrīmad Bhāgavatam Quiz\n (Canto 3 chapter 18)!*\n\n` +

    `⏰ Valid Until: ${validUntil}\n\n` +
    `Please read SB (Canto 3 chapter 18)\nbefore attempting this quiz\n\n` +

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
    leaderboardText += `${medal} *${name}* - ${entry.score}/5 (${entry.total_time}s)\n`;
  });

  bot.sendMessage(chatId, leaderboardText, { parse_mode: 'Markdown' });
}

// ============= ERROR HANDLING =============
bot.on('polling_error', (error) => {
  console.log('Polling error:', error);
});

console.log('🤖 Daily Quiz Bot is running...');
console.log('Current quiz date:', getCurrentQuizDate());
console.log('📅 Remember to add new quiz questions daily!');