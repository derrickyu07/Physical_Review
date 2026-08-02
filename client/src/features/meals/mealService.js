import api from '../../services/axios';

const createMeal = async (mealData) => {
  const response = await api.post('/meals', mealData);

  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const editMeal = async (id, mealData) => {
  const response = await api.put(`/meals/${id}`, mealData);

  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const getMeal = async (id) => {
  const response = await api.get(`/meals/${id}`);

  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const getMeals = async () => {
  const response = await api.get('/meals/');
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const deleteMeal = async (id) => {
  const response = await api.delete(`/meals/${id}`);
  if (!response) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

export default { createMeal, editMeal, getMeal, getMeals, deleteMeal };
