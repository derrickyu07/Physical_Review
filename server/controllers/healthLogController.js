const { logHealthEntry } = require('../services/healthLogService');
const {
  generateAndSaveWeeklyReport,
} = require('../services/weeklyReportService');

const testRollUpHealthLog = async (req, res) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const result = await logHealthEntry(req.user._id, date);
    res.status(200).json(result);
  } catch (err) {
    console.error('Test rollup failed:', err);
    res.status(500).json({ error: err.message });
  }
};

const generateWeeklyReport = async (req, res) => {
  try {
    const userName = req.user.name;
    const report = await generateAndSaveWeeklyReport(req.user._id, userName);
    res.status(200).json(report);
  } catch (err) {
    console.error('Test weekly report generation failed:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { testRollUpHealthLog, generateWeeklyReport };
