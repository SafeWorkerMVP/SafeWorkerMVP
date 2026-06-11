const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth.routes');
const sensorRoutes = require('./routes/sensor.routes');
const alarmRoutes = require('./routes/alarm.routes');
const deviceRoutes = require('./routes/device.routes');
const shiftRoutes = require('./routes/shift.routes');
const zoneRoutes = require('./routes/zone.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const swaggerSpec = require('./docs/swagger');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SafeWorker backend is running'
  });
});

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/sensor-data', sensorRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/emergency', emergencyRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;