const cron = require('node-cron');
const Tournament = require('../models/tournamentModel');

// Schedule task to run every hour
// Format: second minute hour day-of-month month day-of-week
const scheduleTournamentDeactivation = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running scheduled task: Deactivating expired tournaments');

      const result = await Tournament.deactivateExpiredTournaments();

      console.log(
        `Successfully deactivated ${result.modifiedCount} expired tournaments`,
      );
    } catch (error) {
      console.error('Error in tournament deactivation task:', error);
    }
  });
};

module.exports = scheduleTournamentDeactivation;
