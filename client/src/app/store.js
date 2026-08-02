import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import goalReducer from '../features/goals/goalSlice';
import mealReducer from '../features/meals/mealSlice';
import activityReducer from '../features/activities/activitySlice';
import metricReducer from '../features/metrics/metricsSlice';
import reportReducer from '../features/report/reportSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goal: goalReducer,
    meal: mealReducer,
    activity: activityReducer,
    metric: metricReducer,
    report: reportReducer,
    dashboard: dashboardReducer,
  },
});
