import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import GoalPage from './pages/GoalPage/GoalPage';
import UserInformationPage from './pages/UserInformationPage/UserInformationPage';
import ReportPage from './pages/ReportPage/ReportPage';
import MealPage from './pages/MealPage/MealPage';
import ActivityPage from './pages/ActivityPage/ActivityPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/goals" element={<GoalPage />} />
      <Route path="/userInformation" element={<UserInformationPage />} />
      <Route path="/reports" element={<ReportPage />} />
      <Route path="/meals" element={<MealPage />} />
      <Route path="/activities" element={<ActivityPage />} />
    </Routes>
  )
}

export default App;