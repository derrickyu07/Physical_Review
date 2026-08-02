import api from '../../services/axios';

const createGoal = async (goalData) => {
  const response = await api.post('/goal/', goalData);

  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const editGoal = async (id, goalData) => {
  const response = await api.put(`/goal/${id}`, goalData);
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const getGoal = async (id, goalData) => {
  const response = await api.get(`/goal/${id}`, goalData);
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const getGoals = async () => {
  const response = await api.get('/goal/');
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

export default { createGoal, editGoal, getGoal, getGoals };
