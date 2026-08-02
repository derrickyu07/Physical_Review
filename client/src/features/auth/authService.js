import api from '../../services/axios';

const registerUser = async (userData) => {
  const response = await api.post('/user/register', userData);
  return response.data;
};

const login = async (userData) => {
  const response = await api.post('/user/login', userData);
  return response.data;
};

const updateUser = async (userData) => {
  const response = await api.put('/user/updateUser', userData);
  return response.data;
};

const authService = {
  registerUser,
  login,
  updateUser,
};
export default authService;
