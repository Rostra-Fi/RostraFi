const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');

router.get('/user/:walletAddress', badgeController.getUserBadges);
router.get('/user/:walletAddress/new', badgeController.getNewBadges);
router.put(
  '/user/:walletAddress/mark-viewed',
  badgeController.markBadgesViewed,
);
router.post('/admin/initialize-badge', badgeController.initializeBadges);

module.exports = router;
