import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

const PORT = process.env.PORT || 5000;
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const server = http.createServer(app);

// Setup Realtime socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join_order_room', (orderId) => {
    socket.join(orderId);
    logger.info(`Client joined room: ${orderId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Attach socket io reference globally to request object
app.set('io', io);

server.listen(PORT, () => {
  logger.info(`Server CropNet is listening on port ${PORT}`);
});
