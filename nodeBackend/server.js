const mongoose = require('mongoose');
const TournamentWinnerService = require('./services/tournamentWinningServices');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!  Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const {
  scheduleTournamentDeactivation,
} = require('./utils/deactivateTournament');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB, {}).then(() => {
  console.log('DB connection successful');

  // Initialize the TournamentWinnerService here
  TournamentWinnerService.initialize();
  scheduleTournamentDeactivation();
});

const port = process.env.PORT || 3000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000', // Next.js default port
      'https://your-production-frontend-domain.com',
    ],
    methods: ['GET', 'POST'],
    // allowedHeaders: ['Authorization'],
    credentials: true,
  },
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected');

  // User joins their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal notification room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Attach io to the app for global access
app.set('io', io);

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!!  Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Export io for use in other files if needed
module.exports = { io };
