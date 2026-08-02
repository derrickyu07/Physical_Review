const cron = require('node-cron');
const User = require('../models/User');
const { logHealthEntry } = require('../services/healthLogService');

cron.schedule('0 5 * * *', async () => {
  const users = await User.find({});
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  for (const user of users) {
    try {
      await logHealthEntry(user._id, date);
    } catch (error) {
      console.error(
        `Generation of health log failed for user ${user._id}:`,
        error.message,
      );
    }
  }
});
