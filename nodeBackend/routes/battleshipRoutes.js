const express = require('express');
const {
  initializeGame,
  recordGameResult,
  getGameStats,
} = require('../controllers/battleshipController');
const router = express.Router();

router.route('/').post(initializeGame);
router.route('/:walletAddress').get(getGameStats);
router.route('/:walletAddress/result').post(recordGameResult);

module.exports = router;
