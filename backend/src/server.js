const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const { setSocketInstance } = require('./services/socket.service');

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true
  }
});

setSocketInstance(io);

io.on('connection', (socket) => {
  socket.emit('socket:connected', {
    message: 'Connected to SafeWorker realtime service'
  });
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`SafeWorker backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  });

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});
