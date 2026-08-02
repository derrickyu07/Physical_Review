const axios = require('axios');

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

const searchFoods = async (query, pageSize = 10) => {
  const response = await axios.get(`${USDA_BASE_URL}/foods/search`, {
    params: {
      api_key: process.env.USDA_API_KEY,
      query,
      pageSize,
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

const extractBasicNutrition = (food) => {
  const nutrients = food.foodNutrients || [];

  const findNutrient = (names) => {
    const nutrient = nutrients.find((n) => {
      const name = n.nutrientName || n.nutrient?.name || '';
      return names.includes(name.toLowerCase());
    });
    return nutrient?.value ?? nutrient?.amount ?? null;
  };
  return {
    fdcId: food.fdcId,
    description: food.description,
    calories: findNutrient(['energy']),
    protein: findNutrient(['protein']),
    carbs: findNutrient(['carbohydrate, by difference']),
    fat: findNutrient(['total lipid (fat)']),
    sugars: findNutrient(['total sugars']),
    fiber: findNutrient(['fiber, total dietary']),
    calcium: findNutrient(['calcium, ca']),
    iron: findNutrient(['iron, fe']),
    sodium: findNutrient(['sodium, na']),
    vitaminA: findNutrient(['vitamin a, iu']),
    vitaminC: findNutrient(['vitamin c, total ascorbic acid']),
    cholesterol: findNutrient(['cholesterol']),
    transFat: findNutrient(['fatty acids, total trans']),
    saturatedFat: findNutrient(['fatty acids, total saturated']),
  };
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
  extractBasicNutrition,
  extractSearchResults,
};
