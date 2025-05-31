const express = require('express');
const walletUserController = require('../controllers/userWalletController');

const router = express.Router();

router.get('/:address', walletUserController.getWallet);

router.post('/', walletUserController.registerOrRetrieveWallet);

router.get('/:address/tournaments', walletUserController.getUserTournaments);

router.post('/points/add', walletUserController.addPoints);

router.post('/points/deduct', walletUserController.deductPoints);

router.get('/:address/points', walletUserController.getWalletPoints);

router.put('/:walletAddress/points', walletUserController.updateWalletPoints);

router.route('/:walletAddress/games').get(walletUserController.getUserGames);

module.exports = router;
