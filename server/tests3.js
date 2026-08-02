/**
 * Standalone S3 integration test.
 *
 * Run this from your project root (wherever your .env with AWS creds lives),
 * or drop it in a scratch folder with its own .env — either works.
 *
 * Setup:
 *   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner dotenv
 *
 * Run:
 *   node test-s3.js
 *
 * What it checks, in order:
 *   1. Credentials + region are valid and the SDK can talk to AWS at all
 *   2. Your IAM user can PutObject directly (bucket name + permissions are right)
 *   3. Your IAM user can GetObject directly (read permission works)
 *   4. The presigned PUT URL flow works (what your browser client will actually do)
 *   5. The presigned GET URL flow works
 *   6. Content round-trips correctly (what you upload is exactly what you get back)
 *
 * If a step fails, the error message tells you which part of the setup is wrong —
 * see the troubleshooting notes at the bottom of this file.
 */

require("dotenv").config();
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

const REQUIRED_ENV = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET",
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing env vars: ${missing.join(", ")}`);
  console.error(
    "   Check your .env file is in this directory and has these keys set.",
  );
  process.exit(1);
}

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET;
const testKey = `reports/test-${crypto.randomUUID()}.txt`;
const testContent = `S3 integration test — ${new Date().toISOString()}`;

async function main() {
  console.log(`Bucket:  ${BUCKET}`);
  console.log(`Region:  ${process.env.AWS_REGION}`);
  console.log(`Test key: ${testKey}\n`);

  // 1 + 2. Direct SDK upload — proves credentials, region, bucket name, and
  // s3:PutObject permission are all correct.
  console.log("[1/5] Uploading test object directly via SDK...");
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: "text/plain",
    }),
  );
  console.log(
    "      ✅ PutObject succeeded (credentials, region, bucket, IAM permissions all OK)\n",
  );

  // 3. Direct SDK read — proves s3:GetObject permission.
  console.log("[2/5] Reading it back directly via SDK...");
  const getResult = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: testKey }),
  );
  const body = await getResult.Body.transformToString();
  if (body !== testContent) throw new Error("Content mismatch on direct read");
  console.log("      ✅ GetObject succeeded, content matches\n");

  // 4. Presigned PUT — this is the actual pattern your app uses. A fresh key
  // so this doesn't just re-test what step 1 already proved.
  console.log("[3/5] Generating presigned PUT URL...");
  const uploadKey = `reports/test-presigned-${crypto.randomUUID()}.txt`;
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET,
    Key: uploadKey,
    ContentType: "text/plain",
  });
  const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 300 });
  console.log("      ✅ URL generated\n");

  console.log(
    "[4/5] Uploading via the presigned URL (simulates the browser)...",
  );
  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: testContent,
  });
  if (!putResponse.ok) {
    throw new Error(
      `Presigned PUT failed: ${putResponse.status} ${await putResponse.text()}`,
    );
  }
  console.log("      ✅ Presigned upload succeeded\n");

  // 5. Presigned GET — full round trip.
  console.log("[5/5] Generating presigned GET URL and fetching it...");
  const getCommand = new GetObjectCommand({ Bucket: BUCKET, Key: uploadKey });
  const downloadUrl = await getSignedUrl(s3, getCommand, { expiresIn: 300 });
  const getResponse = await fetch(downloadUrl);
  if (!getResponse.ok) {
    throw new Error(
      `Presigned GET failed: ${getResponse.status} ${await getResponse.text()}`,
    );
  }
  const downloaded = await getResponse.text();
  if (downloaded !== testContent)
    throw new Error("Content mismatch on presigned round trip");
  console.log("      ✅ Presigned download succeeded, content matches\n");

  console.log("🎉 All checks passed. Your S3 integration is wired correctly.");
  console.log(
    `\nNote: two test objects were left in your bucket under "reports/":`,
  );
  console.log(`  ${testKey}`);
  console.log(`  ${uploadKey}`);
  console.log(
    "Your IAM policy only grants PutObject/GetObject, not Delete, so this script",
  );
  console.log(
    "can't clean them up itself. Delete them manually from the S3 console, or add",
  );
  console.log(
    "s3:DeleteObject to your IAM policy if you want to automate cleanup later.",
  );
}

main().catch((err) => {
  console.error("\n❌ Test failed:", err.message);
  console.error("\nTroubleshooting by error type:");
  console.error(
    '- "The specified bucket does not exist" → check S3_BUCKET matches exactly, and AWS_REGION matches the bucket\'s actual region',
  );
  console.error(
    '- "Access Denied" on Put/Get → check the IAM policy is attached to the right user, and the Resource ARN matches your bucket name exactly (including the /* suffix)',
  );
  console.error(
    '- "The AWS Access Key Id you provided does not exist" → check AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are correct and not truncated when copied',
  );
  console.error(
    "- Presigned PUT/GET fails with a CORS-looking error → this script runs in Node, not a browser, so CORS shouldn't apply here; if step 4/5 fail it's more likely an expired URL (unlikely at 5 min) or a network/firewall issue",
  );
  console.error(
    "- fetch is not defined → you need Node 18+ (run `node -v` to check); on older Node, install node-fetch and require it at the top",
  );
  process.exit(1);
});
