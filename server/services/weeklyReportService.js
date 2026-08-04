const {
  s3,
  PutObjectCommand,
  BUCKET,
  DeleteObjectCommand,
  getSignedUrl,
  GetObjectCommand,
} = require('../config/s3');
const Report = require('../models/Report');
const { getGoalsForReport } = require('./goalsService');
const { getWeekRecords } = require('./healthLogService');
const { generateWeeklyReport } = require('./healthReportClient');
const { uploadThumbnail } = require('./thumbnailService');
const crypto = require('crypto');

async function generateAndSaveWeeklyReport(userId, userName) {
  const records = await getWeekRecords(userId);
  if (records.length === 0) {
    throw new Error('No health data logged this week');
  }

  const goals = await getGoalsForReport(userId);

  const pdfBuffer = await generateWeeklyReport({
    userName,
    records,
    goals,
    advisor: 'openai',
  });

  const fileName = `weekly-summary-${new Date().toISOString().slice(0, 10)}.pdf`;
  const key = `reports/${crypto.randomUUID()}-${fileName}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    }),
  );

  let thumbnailKey = null;
  try {
    thumbnailKey = await uploadThumbnail(pdfBuffer);
  } catch (thumbErr) {
    console.warn(
      'Thumbnail generation failed, continuing without one:',
      thumbErr.message,
    );
  }

  return Report.create({
    userId,
    fileName,
    contentType: 'application/pdf',
    s3Key: key,
    thumbnailKey,
    size: pdfBuffer.length,
    status: 'uploaded',
  });
}

async function getWeeklyReport(_id, userId) {
  const report = await Report.findOne({
    _id: _id,
    userId: userId,
  });
  return report;
}

async function deleteWeeklyReport(_id, userId) {
  const report = await getWeeklyReport(_id, userId);
  if (!report) {
    return null;
  }
  if (report.s3Key) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: report.s3Key,
      }),
    );
  }

  await report.deleteOne();
  return report;
}

async function getUploadUrlService({ userId, fileName, contentType }) {
  const key = `reports/${crypto.randomUUID()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  const report = await Report.create({
    userId: userId,
    fileName,
    contentType,
    s3Key: key,
    status: 'pending',
  });
  return { report, uploadUrl, key };
}

async function updateReportService(id) {
  const report = await Report.findByIdAndUpdate(id);
  return report;
}

async function confirmUploadService(report, size) {
  const getResult = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: report.s3Key }),
  );
  const pdfBuffer = Buffer.from(await getResult.Body.transformToByteArray());

  const thumbnailKey = await uploadThumbnail(pdfBuffer);

  report.status = 'uploaded';
  report.size = size;
  report.thumbnailKey = thumbnailKey;
  await report.save();
}

async function getReportService(id, userId) {
  const report = await Report.findById({ _id: id, userId });
  return report;
}

async function getDownloadUrlService(report) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: report.s3Key });
  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  return downloadUrl;
}

async function getReportsService(userId) {
  const reports = await Report.find({
    userId,
    status: 'uploaded',
  })
    .select('fileName s3Key thumbnailKey createdAt size')
    .sort({ createdAt: -1 });
  const reportsWithUrls = await Promise.all(
    reports.map(async (report) => {
      const downloadUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: report.s3Key }),
        { expiresIn: 1800 },
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
  return reportsWithUrls;
}

async function deleteWeeklyReportService(id, userId) {
  const report = await getWeeklyReport(id, userId);
  if (!report) {
    return null;
  }
  if (report.s3Key) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: report.s3Key,
      }),
    );
  }

  await report.deleteOne();
  return report;
}

module.exports = {
  deleteWeeklyReport,
  generateAndSaveWeeklyReport,
  getUploadUrlService,
  updateReportService,
  confirmUploadService,
  getReportService,
  getDownloadUrlService,
  getReportsService,
  deleteWeeklyReportService,
};
