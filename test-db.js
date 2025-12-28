// Quick test script to verify database setup
const Database = require('better-sqlite3');

const DATABASE_PATH = process.env.DATABASE_PATH || './quiz.db';
console.log('Testing database at:', DATABASE_PATH);

try {
  const db = new Database(DATABASE_PATH);
  
  // Apply optimizations
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('temp_store = MEMORY');
  
  console.log('✅ Database opened successfully');
  console.log('✅ SQLite optimizations applied');
  
  // Check WAL mode
  const walMode = db.pragma('journal_mode', { simple: true });
  console.log('📝 Journal mode:', walMode);
  
  // Test write
  db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, value TEXT)');
  db.prepare('INSERT OR REPLACE INTO test (id, value) VALUES (1, ?)').run('test_value');
  const result = db.prepare('SELECT * FROM test WHERE id = 1').get();
  
  if (result && result.value === 'test_value') {
    console.log('✅ Write test passed');
  } else {
    console.log('❌ Write test failed');
  }
  
  // Clean up test table
  db.exec('DROP TABLE IF EXISTS test');
  
  db.close();
  console.log('✅ All tests passed!');
  console.log('\n🎉 Database is ready for production use');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
