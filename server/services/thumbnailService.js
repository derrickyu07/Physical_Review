const { s3, BUCKET, PutObjectCommand } = require('../config/s3');

const pdfToImg = require('pdf-img-convert');

async function uploadThumbnail(pdfBuffer) {
  const [thumbnailImage] = await pdfToImg.convert(pdfBuffer, {
    width: 300,
    page_numbers: [1],
  });
  const thumbnailKey = `thumbnails/${crypto.randomUUID()}.png`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: thumbnailKey,
      Body: Buffer.from(thumbnailImage),
      ContentType: 'image/png',
    }),
  );
  return thumbnailKey;
}

module.exports = { uploadThumbnail };
