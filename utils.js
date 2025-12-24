// Utility functions
const { BOT_USERNAME } = require('./config');

function getShareableLink(quizId) {
  return `https://t.me/${BOT_USERNAME}?start=${quizId}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  getShareableLink,
  sleep
};
