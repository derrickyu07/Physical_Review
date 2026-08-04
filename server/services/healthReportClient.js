/**
 * Example client for calling the Python health-report microservice
 * (app.py, run via `uvicorn app:app --port 8000`) from a Node.js server.
 *
 * Requires Node 18+ (built-in `fetch`). No extra npm dependencies.
 */

const fs = require('fs');

const HEALTH_REPORT_SERVICE_URL =
  process.env.HEALTH_REPORT_SERVICE_URL || 'http://localhost:8000';

async function generateWeeklyReport({
  userName,
  records,
  advisor = 'rule_based',
  goals,
}) {
  const response = await fetch(`${HEALTH_REPORT_SERVICE_URL}/reports/weekly`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_name: userName, records, advisor, goals }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Health report service returned ${response.status}: ${errorBody}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// (commented-out Express route example)

async function saveReportToDisk(args, outputPath) {
  const pdfBuffer = await generateWeeklyReport(args);
  fs.writeFileSync(outputPath, pdfBuffer);
  return outputPath;
}

module.exports = { generateWeeklyReport, saveReportToDisk };
