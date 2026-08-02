const express = require("express");
const router = express.Router();

const validation = require("../middleware/validationMiddleware");
const protect = require("../middleware/authMiddleware");
const {
  createPhysicalActivityValidation,
  updatePhysicalActivityValidation,
} = require("../validators/physicalActivityEntryValidator");

const {
  createPhysicalActivityEntry,
  updatePhysicalActivityEntry,
  getPhysicalActivityEntry,
  deletePhysicalActivityEntry,
  getAllPhysicalActivites,
  // getPhysicalActivityEntryCaloriesBurned,
} = require("../controllers/physicalActivityController");

router.post(
  "/",
  protect,
  createPhysicalActivityValidation,
  validation,
  createPhysicalActivityEntry,
);

router.put(
  "/:id",
  protect,
  updatePhysicalActivityValidation,
  validation,
  updatePhysicalActivityEntry,
);

router.get("/", protect, getAllPhysicalActivites);

router.get("/:id", protect, getPhysicalActivityEntry);

router.delete("/:id", protect, deletePhysicalActivityEntry);

module.exports = router;
