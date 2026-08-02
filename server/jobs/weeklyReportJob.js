// jobs/weeklyReportJob.js
const cron = require('node-cron');
const User = require('../models/User');
const {
  generateAndSaveWeeklyReport,
} = require('../services/weeklyReportService');

cron.schedule('0 6 * * 1', async () => {
  // every Monday at 6am
  const users = await User.find({});

  for (const user of users) {
    try {
      await generateAndSaveWeeklyReport(user._id, user.name);
    } catch (err) {
      console.error(`Weekly report failed for user ${user._id}:`, err.message);
      // deliberately no `throw` here -- one user's failure (no data logged,
      // OpenAI hiccup, whatever) shouldn't stop everyone else's report
    }
  }
});
