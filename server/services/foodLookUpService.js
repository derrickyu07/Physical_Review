const axios = require('axios');

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

const DEFAULT_DATA_TYPES = ['Foundation', 'SR Legacy', 'Branded'];

const searchFoods = async (query, pageSize = 25) => {
  const response = await axios.get(`${USDA_BASE_URL}/foods/search`, {
    params: {
      api_key: process.env.USDA_API_KEY,
      query,
      pageSize,
      dataType: DEFAULT_DATA_TYPES.join(','),
    },
  });
  return response.data;
};

const getFoodDetails = async (fdcId) => {
  const response = await axios.get(`${USDA_BASE_URL}/food/${fdcId}`, {
    params: {
      api_key: process.env.USDA_API_KEY,
    },
  });
  return response.data;
};

const extractSearchResults = (data) => {
  const results = (data.foods || []).map((food) => ({
    fdcId: food.fdcId,
    description: food.description,
    brandName: food.brandName || null,
    dataType: food.dataType || null,
  }));
  return { totalHits: data.totalHits || results.length, results };
};

module.exports = {
  searchFoods,
  getFoodDetails,
  extractSearchResults,
};
