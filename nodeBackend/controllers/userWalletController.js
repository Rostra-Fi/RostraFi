const WalletUser = require('../models/walletUserModel');
const UserTeam = require('../models/userTeamModel');
const { isValidSolanaAddress } = require('../utils/validate');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getWallet = catchAsync(async (req, res) => {
  const { address } = req.params;

  // Validate Solana wallet address
  if (!isValidSolanaAddress(address)) {
    return next(new AppError('Invalid Solana wallet address', 400));
  }

  const wallet = await WalletUser.findOne({ walletAddress: address });

  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }

  res.status(200).json({
    success: true,
    data: wallet,
  });
});

exports.getUserTournaments = catchAsync(async (req, res, next) => {
  const { address } = req.params;

  // Find the wallet and populate the tournaments array with tournament details
  const wallet = await WalletUser.findOne({ walletAddress: address }).populate({
    path: 'tournaments',
    select:
      'name description startDate endDate isActive pointsForVisit pointsForParticipation totalVisitors totalParticipants',
  });

  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }

  // Get all user teams for this wallet user in a single query
  const userTeams = await UserTeam.find({
    walletUserId: wallet._id,
    isActive: true,
  }).populate({
    path: 'sections.selectedTeams',
  });

  // Create a map of tournament ID to user team for quick lookup
  const tournamentTeamMap = {};
  userTeams.forEach((team) => {
    tournamentTeamMap[team.tournamentId.toString()] = team;
  });

  // For each tournament, add the user-specific points and team
  const tournamentsWithDetails = wallet.tournaments.map((tournament) => {
    const tournamentId = tournament._id.toString();
    // const tournamentPoints = wallet.getTournamentPoints(tournament._id);

    // Get the user team for this tournament from our map
    const userTeam = tournamentTeamMap[tournamentId] || null;

    // Convert tournament to plain object if it's a Mongoose document
    const tournamentObj = tournament.toObject
      ? tournament.toObject()
      : tournament;

    return {
      ...tournamentObj,
      userTeam: userTeam,
    };
  });

  res.status(200).json({
    success: true,
    count: tournamentsWithDetails.length,
    data: tournamentsWithDetails,
  });
});

exports.registerOrRetrieveWallet = catchAsync(async (req, res, next) => {
  const { walletAddress } = req.body;

  // Validate request body
  if (!walletAddress) {
    return next(new AppError('Wallet address is required', 400));
  }

  const wallet = await WalletUser.findOrCreateWallet(walletAddress);

  const statusCode =
    wallet.createdAt.getTime() === wallet.updatedAt.getTime() ? 201 : 200;

  res.status(statusCode).json({
    success: true,
    data: wallet,
    message:
      statusCode === 201
        ? 'Wallet created successfully'
        : 'Wallet retrieved successfully',
  });
});

exports.addPoints = catchAsync(async (req, res) => {
  const { walletAddress, points } = req.body;

  // Validate request body
  if (!walletAddress || points === undefined) {
    return next(new AppError('Wallet address and points are required', 400));
  }

  // Validate Solana wallet address
  if (!isValidSolanaAddress(walletAddress)) {
    return next(new AppError('Invalid Solana wallet address', 400));
  }

  // Validate points
  if (typeof points !== 'number' || points <= 0) {
    return next(new AppError('Points must be a positive number', 400));
  }

  // Find wallet
  const wallet = await WalletUser.findOne({ walletAddress });

  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }

  // Add points to wallet
  await wallet.addPoints(points);

  res.status(200).json({
    success: true,
    data: wallet,
    message: `${points} points added successfully`,
  });
});

exports.deductPoints = catchAsync(async (req, res, next) => {
  const { walletAddress, points } = req.body;

  // Validate request body
  if (!walletAddress || points === undefined) {
    return next(new AppError('Wallet address and points are required', 400));
  }

  // Validate Solana wallet address
  if (!isValidSolanaAddress(walletAddress)) {
    return next(new AppError('Invalid Solana wallet address', 400));
  }

  // Validate points
  if (typeof points !== 'number' || points <= 0) {
    return next(new AppError('Points must be a positive number', 400));
  }

  // Find wallet
  const wallet = await WalletUser.findOne({ walletAddress });

  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }

  // Check if wallet has enough points
  if (wallet.points < points) {
    return next(new AppError(400, 'Insufficient points balance'));
  }

  // Deduct points from wallet
  await wallet.deductPoints(points);

  res.status(200).json({
    success: true,
    data: wallet,
    message: `${points} points deducted successfully`,
  });
});

exports.getWalletPoints = catchAsync(async (req, res, next) => {
  const { address } = req.params;

  // Validate Solana wallet address
  if (!isValidSolanaAddress(address)) {
    return next(new AppError(400, 'Invalid Solana wallet address'));
  }

  const wallet = await WalletUser.findOne({ walletAddress: address });

  if (!wallet) {
    return next(new AppError(404, 'Wallet not found'));
  }

  res.status(200).json({
    success: true,
    data: {
      walletAddress: wallet.walletAddress,
      points: wallet.points,
    },
  });
});
