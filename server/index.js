const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./middleware/loggerMiddleware');

dotenv.config();

//middleware

//routes
const userRoutes = require('./routes/userRoutes');
const goalRoutes = require('./routes/goalRoutes');
const metricRoutes = require('./routes/bodyMetricRoutes');
const mealRoutes = require('./routes/mealEntryRoutes');
const physicalActivityRoutes = require('./routes/physicalActivityEntryRoutes');
const foodRoutes = require('./routes/foodRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const healthLogRoutes = require('./routes/healthLogRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/user', userRoutes);
app.use('/api/goal', goalRoutes);
app.use('/api/bodyMetric', metricRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/activities', physicalActivityRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/health-logs', healthLogRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
