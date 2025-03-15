const socketIo = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('sendMessage', (message) => {
      io.emit('receiveMessage', message); 
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIo };
