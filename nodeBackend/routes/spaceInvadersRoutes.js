const express = require('express');
const {
  initializeGame,
  recordGameSession,
  getGameStats,
} = require('../controllers/spaceInvadersController');
const router = express.Router();

router.route('/').post(initializeGame);
router.route('/:walletAddress/session').post(recordGameSession);
router.route('/:walletAddress').get(getGameStats);

module.exports = router;
