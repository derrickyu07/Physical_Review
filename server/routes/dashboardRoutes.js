const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const { getCalorieSummary } = require("../controllers/dashboardController");

router.get("/", protect, getCalorieSummary);

module.exports = router;
