import api from '../../services/axios';


const createHealthLog = async(data)=>{
  const response = await api.post('/health-logs/create-healthLog', data);
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

export default{createHealthLog};