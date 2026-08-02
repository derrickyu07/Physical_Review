import api from '../../services/axios';

const createMetric = async (data) => {
  const response = await api.post('/bodyMetric', data);

  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const updateMetric = async (id,data) => {
  const response = await api.put(`/bodyMetric/${id}`, data);

  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const getMetric = async () => {
  const response = await api.get('/bodyMetric/');

  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

export default { createMetric, updateMetric, getMetric };
