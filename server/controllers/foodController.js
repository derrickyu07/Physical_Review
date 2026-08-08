const { extractBasicNutrition } = require('../services/nutritionLookUpService');
const {
  searchFoods,
  getFoodDetails,
  extractSearchResults,
} = require('../services/foodLookUpService');

const searchFood = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 3) {
      return res
        .status(400)
        .json({ message: 'query must be at least 3 characters' });
    }
    const data = await searchFoods(query, 10);
    const { totalHits, results } = extractSearchResults(data);
    res.status(200).json({ success: true, totalHits, data: results });
  } catch (error) {
    const status = error.response?.status || 500;
    console.error('USDA FDC error:', error.response?.data || error.message);
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ message });
  }
};

const getUsdaFoodById = async (req, res) => {
  try {
    const { fdcId } = req.params;
    if (!fdcId) {
      return res.status(400).json({ message: 'fdcId is required' });
    }
    const food = await getFoodDetails(fdcId);
    const nutrition = extractBasicNutrition(food);
    res.status(200).json({
      success: true,
      data: nutrition,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      status === 404 ? 'Food not found for that fdcId' : error.message;
    res.status(status).json({ message });
  }
};

module.exports = { searchFood, getUsdaFoodById };
