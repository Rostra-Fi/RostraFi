const Battleship = require('../models/Battleship');
const User = require('../models/walletUserModel');
const { ErrorResponse } = require('../utils/errorHandler');
const mongoose = require('mongoose');

// Initialize a new Battleship game for a user
const initializeGame = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    // Check if user exists
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return next(
        new ErrorResponse(`User not found with id ${walletAddress}`, 404),
      );
    }

    // Check if game already exists for user
    let game = await Battleship.findOne({ walletAddress });

    if (!game) {
      // Create new game
      game = await Battleship.create({ walletAddress });

      // Add game reference to user
      user.games.push({
        gameType: 'battleship',
        gameId: game._id,
      });

      await user.save();
    }

    res.status(201).json({
      success: true,
      data: game,
    });
  } catch (error) {
    next(error);
  }
};

// Record game result
const recordGameResult = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const { difficulty, won, movesUsed } = req.body;

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return next(new ErrorResponse('Invalid difficulty level', 400));
    }

    // Find the game for the user
    const game = await Battleship.findOne({ walletAddress });

    if (!game) {
      return next(
        new ErrorResponse(
          `Battleship game not found for user ${walletAddress}`,
          404,
        ),
      );
    }

    // Calculate points based on difficulty and win status
    let pointsEarned = 0;
    if (won) {
      switch (difficulty) {
        case 'easy':
          pointsEarned = 100;
          break;
        case 'medium':
          pointsEarned = 150;
          break;
        case 'hard':
          pointsEarned = 200;
          break;
      }

      // Bonus points for using fewer moves
      // if (movesUsed) {
      //   // Assuming average moves is around 50
      //   const moveEfficiency = Math.max(0, 50 - movesUsed);
      //   pointsEarned += moveEfficiency * 5;
      // }
    }

    // Add game to history
    game.gameHistory.push({
      difficulty,
      won,
      pointsEarned,
      movesUsed: movesUsed || 0,
      playedAt: Date.now(),
    });

    // Update game stats
    game.totalGames += 1;
    if (won) {
      game.gamesWon += 1;
      game.totalPoints += pointsEarned;

      // Update user's total points
      const user = await User.findOne({ walletAddress });
      if (user) {
        user.points += pointsEarned;
        await user.save();
      }
    }

    await game.save();

    res.status(200).json({
      success: true,
      data: game,
      pointsEarned,
    });
  } catch (error) {
    next(error);
  }
};

// Get game statistics
const getGameStats = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    const game = await Battleship.findOne({ walletAddress });

    if (!game) {
      return next(
        new ErrorResponse(
          `Battleship game not found for user ${walletAddress}`,
          404,
        ),
      );
    }

    res.status(200).json({
      success: true,
      data: game,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initializeGame,
  recordGameResult,
  getGameStats,
};
