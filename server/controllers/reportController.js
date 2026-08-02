const crypto = require('crypto');
const Report = require('../models/Report');
const {
  s3,
  BUCKET,
  PutObjectCommand,
  GetObjectCommand,
  getSignedUrl,
} = require('../config/s3');
const { uploadThumbnail } = require('../services/thumbnailService');
const {
  generateAndSaveWeeklyReport,
  deleteWeeklyReport: deleteWeeklyReportService,
} = require('../services/weeklyReportService');
const getUploadUrl = async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      return res
        .status(400)
        .json({ message: 'fileName and contentType are required' });
    }

    const key = `reports/${crypto.randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    const report = await Report.create({
      userId: req.user._id,
      fileName,
      contentType,
      s3Key: key,
      status: 'pending',
    });

    res.status(201).json({ reportId: report._id, uploadUrl, key });
  } catch (err) {
    console.error('getUploadUrl error:', err);
    res.status(500).json({ message: 'Failed to generate upload URL' });
  }
};

const confirmUpload = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const getResult = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: report.s3Key }),
    );
    const pdfBuffer = Buffer.from(await getResult.Body.transformToByteArray());

    const thumbnailKey = await uploadThumbnail(pdfBuffer);

    report.status = 'uploaded';
    report.size = req.body.size;
    report.thumbnailKey = thumbnailKey;
    await report.save();

    res.status(200).json(report);
  } catch (err) {
    console.error('confirmUpload error:', err);
    res.status(500).json({ message: 'Failed to confirm upload' });
  }
};

const getDownloadUrl = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report || report.status !== 'uploaded') {
      return res.status(404).json({ message: 'Report not found' });
    }

    const command = new GetObjectCommand({ Bucket: BUCKET, Key: report.s3Key });
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    res.status(200).json({ downloadUrl, fileName: report.fileName });
  } catch (err) {
    console.error('getDownloadUrl error:', err);
    res.status(500).json({ message: 'Failed to generate download URL' });
  }
};

const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({
      userId: req.user._id,
      status: 'uploaded',
    })
      .select('fileName s3Key thumbnailKey createdAt size')
      .sort({ createdAt: -1 });

    const reportsWithUrls = await Promise.all(
      reports.map(async (report) => {
        const downloadUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: BUCKET, Key: report.s3Key }),
          { expiresIn: 1800 }, // 30 min — more forgiving than 5 for a page left open
        );

        const previewUrl = report.thumbnailKey
          ? await getSignedUrl(
              s3,
              new GetObjectCommand({
                Bucket: BUCKET,
                Key: report.thumbnailKey,
              }),
              { expiresIn: 1800 },
            )
          : null;

        return {
          id: report._id,
          fileName: report.fileName,
          date: report.createdAt,
          size: report.size,
          downloadUrl,
          previewUrl,
        };
      }),
    );

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
    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: report.s3Key }),
      { expiresIn: 300 },
    );
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
    const id = req.params.id;
    const userId = req.user._id;
    const report = await deleteWeeklyReportService(id, userId);
    if (!report) {
      res.status(404).json({ message: 'The report cound not be found' });
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
  getUserReports,
  createWeeklyReport,
};
