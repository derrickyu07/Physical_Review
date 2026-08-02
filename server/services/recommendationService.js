const getRecommendations = (goal, caloriesIn, caloriesOut) => {
  const netCalories = caloriesIn - caloriesOut;

  let recommendations = [];
  if (goal == "weight loss") {
    if (netCalories > 0) {
      recommendations.push(
        "You are in a calorie surplus. Reduce intake or increase activity",
      );
    } else {
      recommendations.push("Good jobs staying in a deficit");
    }
  }
  if (caloriesOut < 300) {
    recommendations.push("Consider adding a workout today.");
  }
  return recommendations;
};

module.exports = { getRecommendations };
