const express = require('express');
const walletUserController = require('../controllers/userWalletController');

const router = express.Router();

// Get wallet by address
router.get('/:address', walletUserController.getWallet);

// Register or retrieve wallet
router.post('/', walletUserController.registerOrRetrieveWallet);

// Add points to wallet
router.post('/points/add', walletUserController.addPoints);

// Deduct points from wallet
router.post('/points/deduct', walletUserController.deductPoints);

// Get wallet points
router.get('/:address/points', walletUserController.getWalletPoints);

module.exports = router;
