const {
  generateAndSaveWeeklyReport,
  deleteWeeklyReportService,
  getUploadUrlService,
  updateReportService,
  getReportService,
  getDownloadUrlService,
  getReportsService,
  confirmUploadService,
} = require('../services/weeklyReportService');

const getUploadUrl = async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      return res
        .status(400)
        .json({ message: 'fileName and contentType are required' });
    }

    const { report, uploadUrl, key } = await getUploadUrlService({
      userId: req.user._id,
      fileName,
      contentType,
    });

    res.status(201).json({ reportId: report._id, uploadUrl, key });
  } catch (err) {
    console.error('getUploadUrl error:', err);
    res.status(500).json({ message: 'Failed to generate upload URL' });
  }
};

const confirmUpload = async (req, res) => {
  try {
    const report = await updateReportService(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    await confirmUploadService(report, req.body.size);

    res.status(200).json(report);
  } catch (err) {
    console.error('confirmUpload error:', err);
    res.status(500).json({ message: 'Failed to confirm upload' });
  }
};

const getDownloadUrl = async (req, res) => {
  try {
    const report = await getReportService(req.params.id, req.user._id);

    if (!report || report.status !== 'uploaded') {
      return res.status(404).json({ message: 'Report not found' });
    }

    const downloadUrl = await getDownloadUrlService(report);

    res.status(200).json({ downloadUrl, fileName: report.fileName });
  } catch (err) {
    console.error('getDownloadUrl error:', err);
    res.status(500).json({ message: 'Failed to generate download URL' });
  }
};

const getReports = async (req, res) => {
  try {
    const reportsWithUrls = await getReportsService(req.user._id);

    res.status(200).json(reportsWithUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createWeeklyReport = async (req, res) => {
  try {
    const report = await generateAndSaveWeeklyReport(
      req.user._id,
      req.user.name,
    );
    const downloadUrl = await getDownloadUrlService(report);
    res
      .status(201)
      .json({ reportId: report._id, downloadUrl, fileName: report.fileName });
  } catch (err) {
    console.error('createWeeklyReport error:', err);
    if (err.message === 'No health data logged this week') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to generate weekly report' });
  }
};

const deleteWeeklyReport = async (req, res) => {
  try {
    const report = await deleteWeeklyReportService(req.params.id, req.user._id);
    if (!report) {
      return res.status(404).json({ message: 'The report cound not be found' });
    }
    res.status(200).json({ message: 'Report deleted', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  deleteWeeklyReport,
  getUploadUrl,
  confirmUpload,
  getDownloadUrl,
  getReports,
  createWeeklyReport,
};
