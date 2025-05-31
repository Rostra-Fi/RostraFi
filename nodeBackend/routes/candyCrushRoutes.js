const express = require('express');
const {
  initializeGame,
  updateLevelProgress,
  getGameProgress,
} = require('../controllers/candyCrushController');
const router = express.Router();

router.route('/').post(initializeGame);
router.route('/:walletAddress').get(getGameProgress);
router.route('/:walletAddress/level').put(updateLevelProgress);

module.exports = router;
