const {
  searchFoods,
  getFoodDetails,
  extractBasicNutrition,
  extractSearchResults,
} = require('../services/nutritionLookUpService');

const searchFood = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'query is required' });
    }
    const data = await searchFoods(query, 10);
    const { totalHits, results } = extractSearchResults(data);
    res.status(200).json({ success: true, totalHits, data: results });
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ message: error.message });
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
