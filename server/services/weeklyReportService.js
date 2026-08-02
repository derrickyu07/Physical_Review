const {
  s3,
  PutObjectCommand,
  BUCKET,
  DeleteObjectCommand,
} = require('../config/s3');
const Report = require('../models/Report');
const { getGoalsForReport } = require('./goalsService');
const { getWeekRecords } = require('./healthLogService');
const { generateWeeklyReport } = require('./healthReportClient');
const { uploadThumbnail } = require('./thumbnailService');

// services/weeklyReportService.js
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

module.exports = { deleteWeeklyReport, generateAndSaveWeeklyReport };
