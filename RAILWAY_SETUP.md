# Railway Volume Setup Guide

## ✅ Your bot is now optimized for SQLite + Railway Volume

### What was changed:

1. **SQLite Optimizations Added**
   - WAL mode (Write-Ahead Logging) for better concurrency
   - Prepared statements for faster queries
   - Proper pragma settings for production use

2. **Database Path Configuration**
   - Uses `DATABASE_PATH` environment variable
   - Falls back to `./quiz.db` for local development

3. **Leaderboard Auto-Restore**
   - Automatically restores your leaderboard on first run
   - Data: Shubham (7/8, 72s), Ys (7/8, 94s), Dhiraj (7/8, 180s), Ashish (5/8, 115s)

---

## 🚀 Railway Setup Steps

### Step 1: Create a Volume

1. Go to your Railway project dashboard
2. Click on your **telegram-quiz-bot** service
3. Click the **"Settings"** tab
4. Scroll down to find **"Volumes"** section
5. Click **"+ New Volume"**
6. Configure:
   - **Mount Path**: `/data`
   - **Size**: 1 GB (more than enough)
7. Click **"Add"**

### Step 2: Set Environment Variable

1. Still in your service, click the **"Variables"** tab
2. Click **"+ New Variable"**
3. Add:
   - **Variable**: `DATABASE_PATH`
   - **Value**: `/data/quiz.db`
4. Click **"Add"**

### Step 3: Deploy

1. Commit and push your code:
   ```bash
   git add .
   git commit -m "Add SQLite optimizations and Railway volume support"
   git push
   ```

2. Railway will automatically redeploy

3. Check logs to verify:
   - ✅ "Database path: /data/quiz.db"
   - ✅ "SQLite optimizations applied"
   - ✅ "Leaderboard data restored!" (first time only)

---

## 📊 What This Achieves

### ✅ Data Persistence
- Database survives restarts
- Database survives redeployments
- Database survives crashes

### ✅ Performance
- Prepared statements = faster queries
- WAL mode = better concurrency
- Optimized for single-writer workload

### ✅ Reliability
- Auto-restore leaderboard on first run
- Graceful error handling
- Proper shutdown handling

---

## 🔍 Verify It's Working

### Check the logs after deployment:

```
📁 Database path: /data/quiz.db
✅ SQLite optimizations applied
🤖 Daily Quiz Bot is running...
```

### Test persistence:

1. Take a quiz and check leaderboard
2. Trigger a redeploy (push a small change)
3. Check leaderboard again - data should still be there!

---

## 🛠️ Local Development

For local testing, the bot uses `./quiz.db` automatically.

To test with the same path as production:
```bash
export DATABASE_PATH=/data/quiz.db
mkdir -p /data
npm start
```

---

## 📝 Notes

- Volume is persistent storage - data won't be lost
- SQLite is perfect for your use case (single bot, daily quiz)
- WAL mode creates `.db-shm` and `.db-wal` files (normal behavior)
- These are already in `.gitignore`

---

## 🆘 Troubleshooting

### "Cannot open database"
- Check that volume is mounted at `/data`
- Check that `DATABASE_PATH` variable is set correctly

### "Permission denied"
- Railway volumes have correct permissions by default
- If issue persists, check Railway logs

### Data not persisting
- Verify volume is created and mounted
- Check `DATABASE_PATH` points to volume mount path
- Ensure you're not using ephemeral storage path

---

## ✨ You're All Set!

Your bot now has:
- ✅ Persistent database storage
- ✅ Optimized SQLite performance
- ✅ Auto-restore leaderboard
- ✅ Production-ready setup

No more data loss on deployments! 🎉
