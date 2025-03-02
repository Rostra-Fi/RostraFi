const mongoose = require('mongoose');
const TournamentWinnerService = require('./services/tournamentWinningServices');

const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!  Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
// we require the app.js here after we config the whole process in above code
const app = require('./app');
const {
  scheduleTournamentDeactivation,
} = require('./utils/deactivateTournament');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB, {}).then(() => {
  console.log('DB connection succesfull');

  // Initialize the TournamentWinnerService here
  TournamentWinnerService.initialize();
  scheduleTournamentDeactivation();
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!!  Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

//we need to put this code at the very top of the file as if any error happened before this it will not we able to catch it
// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION!!  Shutting down...');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
