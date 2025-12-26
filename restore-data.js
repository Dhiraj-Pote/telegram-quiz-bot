// Script to restore leaderboard data
const Database = require('better-sqlite3');
const db = new Database('./quiz.db');

// Ensure tables exist
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

// Restore leaderboard data for 2025-12-25
const quizDate = '2025-12-25';

const leaderboardData = [
  { username: 'ys16108', first_name: 'Ys', score: 7, total_time: 94, user_id: 1001 },
  { username: 'shubham', first_name: 'Shubham', score: 7, total_time: 72, user_id: 1002 },
  { username: 'dhiraj', first_name: 'Dhiraj', score: 7, total_time: 180, user_id: 1003 },
  { username: 'ashish', first_name: 'Ashish', score: 5, total_time: 115, user_id: 1004 }
];

// Clear existing data for this quiz date
db.prepare('DELETE FROM results WHERE quiz_date = ?').run(quizDate);
db.prepare('DELETE FROM users WHERE quiz_date = ?').run(quizDate);

// Insert restored data
const insertResult = db.prepare(
  'INSERT INTO results (user_id, quiz_date, username, first_name, score, total_time, user_answers) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const insertUser = db.prepare(
  'INSERT INTO users (user_id, quiz_date, username, first_name, has_attempted) VALUES (?, ?, ?, ?, 1)'
);

leaderboardData.forEach(entry => {
  // Create dummy user_answers (8 questions)
  const userAnswers = JSON.stringify(Array(8).fill(0));
  
  insertResult.run(
    entry.user_id,
    quizDate,
    entry.username,
    entry.first_name,
    entry.score,
    entry.total_time,
    userAnswers
  );
  
  insertUser.run(
    entry.user_id,
    quizDate,
    entry.username,
    entry.first_name
  );
});

console.log('✅ Leaderboard data restored successfully!');
console.log('\nCurrent leaderboard:');

const leaderboard = db.prepare(
  `SELECT username, first_name, score, total_time 
   FROM results 
   WHERE quiz_date = ?
   ORDER BY score DESC, total_time ASC`
).all(quizDate);

leaderboard.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.first_name} - ${entry.score}/8 (${entry.total_time}s)`);
});

db.close();
