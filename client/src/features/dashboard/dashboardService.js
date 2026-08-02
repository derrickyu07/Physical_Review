import api from '../../services/axios';

const getCalorieSummary = async (startDate, endDate) => {
  const response = await api.get('/dashboard/', {
    params: { startDate, endDate },
  });
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

export default { getCalorieSummary };
