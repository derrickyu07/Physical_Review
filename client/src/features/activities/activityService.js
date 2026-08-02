import api from '../../services/axios';

const createActivity = async (activityData) => {
  const response = await api.post('/activities', activityData);
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const editActivity = async (id, activityData) => {
  const response = await api.put(`/activities/${id}`, activityData);
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const getActivity = async (id) => {
  const response = await api.get(`/activities/${id}`);
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const getActivities = async () => {
  const response = await api.get('/activities');
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const deleteActivity = async (id) => {
  const response = await api.delete(`/activities/${id}`);
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

export default {
  createActivity,
  editActivity,
  getActivity,
  getActivities,
  deleteActivity,
};
