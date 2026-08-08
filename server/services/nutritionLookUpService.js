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

module.exports = {
  extractBasicNutrition,
};
