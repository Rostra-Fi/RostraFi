const express = require('express');
const tournamentController = require('../controllers/tournamentController');

const router = express.Router();

// Tournament CRUD routes
router.post('/tournaments', tournamentController.createTournament);
router.get('/tournaments', tournamentController.getAllTournaments);
router.get('/tournaments/:id', tournamentController.getTournamentById);
router.put('/tournaments/:id', tournamentController.updateTournament);
router.get(
  '/tournaments/:tournamentId/points',
  tournamentController.getUserTournamentPoints,
);

// Tournament interaction routes
router.post(
  '/tournaments/:tournamentId/visit',
  tournamentController.visitTournament,
);
router.post(
  '/tournaments/:tournamentId/participate',
  tournamentController.participateInTournament,
);
router.post(
  '/tournaments/:tournamentId/leave',
  tournamentController.leaveFromTournament,
);

// Admin routes
router.post(
  '/tournaments/deactivate-expired',
  tournamentController.deactivateExpiredTournaments,
);

module.exports = router;
