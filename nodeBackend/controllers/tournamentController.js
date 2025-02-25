const Tournament = require('../models/tournamentModel');
const WalletUser = require('../models/walletUserModel');
const mongoose = require('mongoose');

// Helper to check if ID is valid
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create a new tournament
exports.createTournament = async (req, res) => {
  try {
    const {
      name,
      timeLimit,
      startDate,
      pointsForVisit,
      image,
      icon,
      platform,
      prizePool,
    } = req.body;

    // Calculate end date
    const start = startDate ? new Date(startDate) : new Date();
    const endDate = new Date(start);
    endDate.setHours(endDate.getHours() + (timeLimit || 24));

    const tournament = new Tournament({
      name,
      image,
      icon,
      platform,
      prizePool,
      timeLimit: timeLimit || 24,
      startDate: start,
      endDate,
      pointsForVisit: pointsForVisit || 10,
    });

    await tournament.save();

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      data: tournament,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all tournaments
exports.getAllTournaments = async (req, res) => {
  try {
    const { active } = req.query;
    let query = {};

    // Filter by active status if specified
    if (active === 'true') {
      const now = new Date();
      query = {
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      };
    } else if (active === 'false') {
      query = { isActive: false };
    }

    const tournaments = await Tournament.find(query)
      .sort({ startDate: -1 })
      .populate('visited', 'walletAddress points')
      .populate('participated', 'walletAddress points');

    res.status(200).json({
      success: true,
      count: tournaments.length,
      data: tournaments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single tournament by ID
exports.getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tournament ID',
      });
    }

    const tournament = await Tournament.findById(id)
      .populate('visited', 'walletAddress points')
      .populate('participated', 'walletAddress points');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found',
      });
    }

    res.status(200).json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Record a user visit to a tournament
exports.visitTournament = async (req, res) => {
  let session = null;

  try {
    const { tournamentId } = req.params;
    const { walletAddress, userId } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required',
      });
    }

    if (!isValidObjectId(tournamentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tournament ID',
      });
    }

    // First check if user already visited tournament without transaction
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found',
      });
    }

    // Check if tournament is active and ongoing
    if (!tournament.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is not active',
      });
    }

    const now = new Date();
    if (now < tournament.startDate || now > tournament.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is not ongoing',
      });
    }

    // Find the user
    const user = await WalletUser.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user has already visited - outside of transaction
    if (tournament.hasVisited(user._id)) {
      // Already visited, no need for transaction
      const tournamentPoints = user.getTournamentPoints(tournament._id);

      return res.status(200).json({
        success: true,
        message: 'Already visited this tournament',
        isFirstVisit: false,
        tournamentPoints,
        data: tournament,
      });
    }

    // Only start a transaction if we need to record a new visit
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Use findOneAndUpdate with filters that ensure atomic operation
      const updatedTournament = await Tournament.findOneAndUpdate(
        {
          _id: tournamentId,
          visited: { $ne: user._id }, // Ensure we only update if user hasn't visited
        },
        {
          $addToSet: { visited: user._id },
        },
        {
          session,
          new: true, // Return updated document
          runValidators: true,
        },
      );

      // If no document was updated, it means someone else already added this user
      if (!updatedTournament) {
        // Release transaction resources
        await session.abortTransaction();
        session.endSession();
        session = null;

        // Check if they already have points for this tournament
        const tournamentPoints = user.getTournamentPoints(tournament._id);

        return res.status(200).json({
          success: true,
          message: 'Already visited this tournament',
          isFirstVisit: false,
          tournamentPoints,
          data: tournament,
        });
      }

      // Add tournament points with retry logic (3 attempts)
      let pointsAdded = false;
      let attempts = 0;
      let error;

      while (!pointsAdded && attempts < 3) {
        try {
          attempts++;
          // Award tournament-specific points for first visit
          await user.addTournamentPoints(
            tournament._id,
            tournament.pointsForVisit,
          );
          pointsAdded = true;
        } catch (e) {
          error = e;
          // Small delay before retry
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (!pointsAdded) {
        // If all attempts failed, abort transaction
        await session.abortTransaction();
        session.endSession();
        session = null;
        throw (
          error ||
          new Error('Failed to add tournament points after multiple attempts')
        );
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      session = null;

      return res.status(200).json({
        success: true,
        message: 'First visit recorded! Points awarded!',
        isFirstVisit: true,
        pointsAwarded: tournament.pointsForVisit,
        data: updatedTournament,
      });
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (sessionError) {
        console.error('Error aborting transaction:', sessionError);
      }
    }

    return res.status(500).json({
      success: false,
      message: `Caused by :: ${error.message}`,
    });
  }
};

// Register a user as participant in a tournament
exports.participateInTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required',
      });
    }

    if (!isValidObjectId(tournamentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tournament ID',
      });
    }

    // Start session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the tournament
      const tournament =
        await Tournament.findById(tournamentId).session(session);

      if (!tournament) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Tournament not found',
        });
      }

      // Check if tournament is active and ongoing
      if (!tournament.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Tournament is not active',
        });
      }

      const now = new Date();
      if (now < tournament.startDate || now > tournament.endDate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Tournament is not ongoing',
        });
      }

      // Find or create the wallet user
      const user = await WalletUser.findOrCreateWallet(walletAddress);

      // Check if user has already participated
      if (tournament.hasParticipated(user._id)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json({
          success: true,
          message: 'Already participated in this tournament',
          data: tournament,
        });
      }

      // If not already visited, add as visitor first and give visit points
      if (!tournament.hasVisited(user._id)) {
        tournament.addVisitor(user._id);
        await user.addTournamentPoints(
          tournament._id,
          tournament.pointsForVisit,
        );
      }

      // Add user to participated array
      tournament.addParticipant(user._id);
      await tournament.save({ session });

      // Note: We don't add additional points for participation as per your requirement
      // Points are only awarded once upon first visit

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Successfully participated in tournament!',
        data: tournament,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove a user from tournament participation
exports.leaveFromTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required',
      });
    }

    if (!isValidObjectId(tournamentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tournament ID',
      });
    }

    // Start session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the tournament
      const tournament =
        await Tournament.findById(tournamentId).session(session);

      if (!tournament) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Tournament not found',
        });
      }

      // Check if tournament is active and ongoing
      if (!tournament.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Tournament is not active',
        });
      }

      const now = new Date();
      if (now > tournament.endDate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Tournament has already ended',
        });
      }

      // Find the wallet user
      const user = await WalletUser.findOne({ walletAddress });

      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user has participated
      if (!tournament.hasParticipated(user._id)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'User has not participated in this tournament',
        });
      }

      // Remove user from participated array
      tournament.removeParticipant(user._id);
      await tournament.save({ session });

      // Reset the tournament points
      await user.resetTournamentPoints(tournament._id);

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Successfully left the tournament',
        data: tournament,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Deactivate expired tournaments (could be run by a scheduler)
exports.deactivateExpiredTournaments = async (req, res) => {
  try {
    const result = await Tournament.deactivateExpiredTournaments();

    res.status(200).json({
      success: true,
      message: 'Expired tournaments deactivated',
      count: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update tournament details
exports.updateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, timeLimit, startDate, endDate, isActive, pointsForVisit } =
      req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tournament ID',
      });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found',
      });
    }

    // Update fields if provided
    if (name) tournament.name = name;
    if (timeLimit) tournament.timeLimit = timeLimit;
    if (startDate) tournament.startDate = new Date(startDate);
    if (endDate) tournament.endDate = new Date(endDate);
    if (isActive !== undefined) tournament.isActive = isActive;
    if (pointsForVisit) tournament.pointsForVisit = pointsForVisit;

    await tournament.save();

    res.status(200).json({
      success: true,
      message: 'Tournament updated successfully',
      data: tournament,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserTournamentPoints = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required',
      });
    }

    if (!isValidObjectId(tournamentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tournament ID',
      });
    }

    const user = await WalletUser.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const tournamentPoints = user.getTournamentPoints(tournamentId);

    res.status(200).json({
      success: true,
      data: {
        walletAddress,
        tournamentId,
        points: tournamentPoints,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
