import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { roomHandlers } from './rooms/roomHandlers';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://YOUR-VERCEL-APP.vercel.app',
    ],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[+] connected: ${socket.id}`);
  roomHandlers(io, socket);
  socket.on('disconnect', () => {
    console.log(`[-] disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});