import api from '../../services/axios';

const createWeeklyHealthReport = async (data) => {
  const response = await api.post('/reports/create-report', data);
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const getReports = async () => {
  const response = await api.get('/reports/get-user-reports');
  if (!response.data) {
    throw new Error('No data returned from server');
  }
  return response.data;
};

const deleteReport = async(data)=>{
  const response = await api.delete(`/reports/${data}`);
  if(!response.data){
    throw new Error('No data return from server');
  }
  return response.data;
}

export default { createWeeklyHealthReport, getReports,deleteReport };
