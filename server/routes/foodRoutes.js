const express = require("express");
const router = express.Router();

const {
  searchFood,
  getUsdaFoodById,
} = require("../controllers/foodController");

router.get("/search", searchFood);
router.get("/:fdcId", getUsdaFoodById);

module.exports = router;
