// Telegram Quiz Bot - Daily Quiz with 2-Day Validity (Webhook Version)
// File: bot-webhook.js

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const Database = require('better-sqlite3');

// ============= CONFIGURATION =============
const BOT_TOKEN = '8590540828:AAFDdhQzqP3_LQLcTLPNZbtOe8s2Mb8A3DU';
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook/${BOT_TOKEN}`
  : null;

const db = new Database('./quiz.db');
const ADMIN_USERNAME = 'ys16108';

// Use webhook if URL is available, otherwise use polling
const bot = WEBHOOK_URL 
  ? new TelegramBot(BOT_TOKEN)
  : new TelegramBot(BOT_TOKEN, { 
      polling: {
        interval: 300,
        autoStart: true,
        params: { timeout: 10 }
      }
    });

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Webhook endpoint
if (WEBHOOK_URL) {
  app.post(`/webhook/${BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  // Set webhook
  bot.setWebHook(WEBHOOK_URL).then(() => {
    console.log('✅ Webhook set to:', WEBHOOK_URL);
  }).catch((error) => {
    console.error('❌ Failed to set webhook:', error.message);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Mode: ${WEBHOOK_URL ? 'Webhook' : 'Polling'}`);
});

// ... rest of your bot code stays the same ...
