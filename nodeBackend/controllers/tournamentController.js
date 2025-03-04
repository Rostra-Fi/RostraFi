const Tournament = require('../models/tournamentModel');
const WalletUser = require('../models/walletUserModel');
const mongoose = require('mongoose');

// Helper to check if ID is valid
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// exports.createTournament = async (req, res) => {
//   try {
//     const {
//       name,
//       timeLimit,
//       registrationTimeLimit,
//       startDate,
//       pointsForVisit,
//       image,
//       icon,
//       platform,
//       prizePool,
//     } = req.body;

//     // Calculate start date and end date
//     const start = startDate ? new Date(startDate) : new Date();
//     const endDate = new Date(start);
//     endDate.setHours(endDate.getHours() + (timeLimit || 24));

//     // Calculate registration end date
//     const registrationEnd = new Date(start);
//     registrationEnd.setHours(
//       registrationEnd.getHours() - (registrationTimeLimit || 12),
//     );

//     const tournament = new Tournament({
//       name,
//       image,
//       icon,
//       platform,
//       prizePool,
//       timeLimit: timeLimit || 24,
//       registrationTimeLimit: registrationTimeLimit || 12,
//       startDate: start,
//       endDate,
//       registrationEndDate: registrationEnd,
//       pointsForVisit: pointsForVisit || 10,
//     });

//     await tournament.save();

//     res.status(201).json({
//       success: true,
//       message: 'Tournament created successfully',
//       data: tournament,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Get all tournaments

exports.createTournament = async (req, res) => {
  try {
    const {
      name,
      timeLimit,
      registrationTimeLimit,
      startDate,
      pointsForVisit,
      image,
      icon,
      platform,
      prizePool,
    } = req.body;

    // Set the base date (either provided startDate or current date)
    const baseDate = startDate ? new Date(startDate) : new Date();

    // Calculate registration end date
    const registrationEnd = new Date(baseDate);

    // Calculate tournament start date (same as registration end)
    const start = new Date(registrationEnd);

    // Calculate tournament end date
    const endDate = new Date(start);
    endDate.setHours(endDate.getHours() + (timeLimit || 24));

    const tournament = new Tournament({
      name,
      image,
      icon,
      platform,
      prizePool,
      timeLimit: timeLimit || 24,
      registrationTimeLimit: registrationTimeLimit || 12,
      startDate: start,
      endDate,
      registrationEndDate: registrationEnd,
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

exports.getAllTournaments = async (req, res) => {
  try {
    const { active } = req.query;
    let tournaments = [];
    const now = new Date();

    if (active === 'true') {
      // Get active tournaments that have started but registration is closed
      tournaments = await Tournament.find({
        isActive: true,
        startDate: { $lte: now }, // Tournament has started
        registrationEndDate: { $lt: now }, // Registration period is over
      })
        .sort({ startDate: -1 })
        .populate('visited', 'walletAddress points')
        .populate('participated', 'walletAddress points');
    } else if (active === 'false') {
      // Get inactive tournaments
      tournaments = await Tournament.find({ isActive: false })
        .sort({ startDate: -1 })
        .populate('visited', 'walletAddress points')
        .populate('participated', 'walletAddress points');
    } else {
      // Get all tournaments (default)
      tournaments = await Tournament.find({})
        .sort({ startDate: -1 })
        .populate('visited', 'walletAddress points')
        .populate('participated', 'walletAddress points');
    }

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

exports.getTournamentParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    // Find tournament by id and populate the participants array
    const tournament = await Tournament.findById(id).populate({
      path: 'participated',
      select:
        'username email avatar walletAddress lastActivity createdAt isActive', // Select fields you want to return
      model: 'WalletUser',
    });

    // Check if tournament exists
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found',
      });
    }

    // Return the participants array
    return res.status(200).json({
      success: true,
      count: tournament.participated.length,
      data: tournament.participated,
    });
  } catch (error) {
    console.error('Error fetching tournament participants:', error);

    // Handle invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tournament ID format',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching tournament participants',
    });
  }
};

exports.getOpenRegistrationTournaments = async (req, res) => {
  try {
    const now = new Date();

    // Find tournaments where:
    // 1. The tournament is active
    // 2. Current time is before registration end date
    const tournaments = await Tournament.find({
      isActive: true,
      registrationEndDate: { $gte: now },
    })
      .sort({ startDate: 1 })
      .populate('visited', 'walletAddress points')
      .populate('participated', 'walletAddress points');

    console.log(tournaments);

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

// exports.visitTournament = async (req, res) => {
//   let session = null;

//   try {
//     const { tournamentId } = req.params;
//     const { walletAddress, userId } = req.body;

//     console.log(tournamentId, walletAddress, userId);

//     // Input validation
//     if (!walletAddress) {
//       return res.status(400).json({
//         success: false,
//         message: 'Wallet address is required',
//       });
//     }

//     // if (!isValidObjectId(tournamentId)) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: 'Invalid tournament ID',
//     //   });
//     // }

//     // Find the tournament
//     const tournament = await Tournament.findById(tournamentId);
//     if (!tournament) {
//       return res.status(404).json({
//         success: false,
//         message: 'Tournament not found',
//       });
//     }

//     // Check tournament status
//     const now = new Date();
//     if (
//       !tournament.isActive ||
//       // now < tournament.startDate ||
//       now > tournament.registrationEndDate
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'Tournament is not active or not ongoing',
//       });
//     }

//     // Find the user
//     const user = await WalletUser.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found',
//       });
//     }

//     // First check if user has already participated and return early if true
//     if (tournament.hasParticipated(user._id)) {
//       const tournamentPoints = user.getTournamentPoints(tournament._id);
//       return res.status(200).json({
//         success: true,
//         message: 'You have already participated in this tournament',
//         isParticipant: true,
//         tournamentPoints,
//         data: tournament,
//       });
//     }

//     // Check if user already visited - outside of transaction
//     if (tournament.hasVisited(user._id)) {
//       const tournamentPoints = user.getTournamentPoints(tournament._id);
//       return res.status(200).json({
//         success: true,
//         message: 'Already visited this tournament',
//         isFirstVisit: false,
//         tournamentPoints,
//         data: tournament,
//       });
//     }

//     // Start transaction
//     session = await mongoose.startSession();
//     session.startTransaction();

//     // Atomic update to mark visit
//     const updatedTournament = await Tournament.findOneAndUpdate(
//       {
//         _id: tournamentId,
//         visited: { $ne: user._id },
//       },
//       {
//         $addToSet: { visited: user._id },
//       },
//       {
//         session,
//         new: true,
//         runValidators: true,
//       },
//     );

//     // If no document was updated, user already visited (race condition)
//     if (!updatedTournament) {
//       await session.abortTransaction();
//       session.endSession();

//       const tournamentPoints = user.getTournamentPoints(tournament._id);
//       return res.status(200).json({
//         success: true,
//         message: 'Already visited this tournament',
//         isFirstVisit: false,
//         tournamentPoints,
//         data: tournament,
//       });
//     }

//     // Add points in the same transaction
//     console.log(tournament);
//     await user.addTournamentPoints(
//       tournament._id,
//       tournament.pointsForVisit,
//       session,
//     );

//     // Commit transaction
//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       success: true,
//       message: 'First visit recorded! Points awarded!',
//       isFirstVisit: true,
//       pointsAwarded: tournament.pointsForVisit,
//       data: updatedTournament,
//     });
//   } catch (error) {
//     // Only abort if session exists and is active
//     console.log(error);
//     if (session && session.inTransaction()) {
//       try {
//         await session.abortTransaction();
//       } catch (abortError) {
//         console.error('Error aborting transaction:', abortError);
//       } finally {
//         session.endSession();
//       }
//     }

//     return res.status(500).json({
//       success: false,
//       message: `Error: ${error.message}`,
//     });
//   }
// };

exports.visitTournament = async (req, res) => {
  let session = null;

  try {
    const { tournamentId } = req.params;
    const { walletAddress, userId } = req.body;

    console.log(tournamentId, walletAddress, userId);

    // Input validation
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required',
      });
    }

    // Find the tournament
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found',
      });
    }

    // Check tournament status
    const now = new Date();
    if (!tournament.isActive || now > tournament.registrationEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is not active or not ongoing',
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

    // First check if user has already participated and return early if true
    if (tournament.hasParticipated(user._id)) {
      return res.status(200).json({
        success: true,
        message: 'You have already participated in this tournament',
        isParticipant: true,
        data: tournament,
      });
    }

    // Check if user already visited this tournament - outside of transaction
    if (tournament.hasVisited(user._id)) {
      return res.status(200).json({
        success: true,
        message: 'Already visited this tournament',
        isFirstVisit: false,
        data: tournament,
      });
    }

    // Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Atomic update to mark visit
    const updatedTournament = await Tournament.findOneAndUpdate(
      {
        _id: tournamentId,
        visited: { $ne: user._id },
      },
      {
        $addToSet: { visited: user._id },
      },
      {
        session,
        new: true,
        runValidators: true,
      },
    );

    // If no document was updated, user already visited (race condition)
    if (!updatedTournament) {
      await session.abortTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: 'Already visited this tournament',
        isFirstVisit: false,
        data: tournament,
      });
    }

    // Simplified approach: Add points only if this is the first tournament visit ever
    // The method will only store at most one tournament in the visitedTournaments array
    const isFirstTournamentEver = !user.hasVisitedAnyTournament();
    console.log(isFirstTournamentEver);
    await user.addPointsForTournamentVisit(
      tournament._id,
      tournament.pointsForVisit,
      session,
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: isFirstTournamentEver
        ? 'First visit recorded! Points awarded!'
        : 'Tournament visit recorded!',
      isFirstVisit: isFirstTournamentEver,
      pointsAwarded: isFirstTournamentEver ? tournament.pointsForVisit : 0,
      data: updatedTournament,
    });
  } catch (error) {
    // Only abort if session exists and is active
    console.log(error);
    if (session && session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      } finally {
        session.endSession();
      }
    }

    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};
// Register a user as participant in a tournament
// exports.participateInTournament = async (req, res) => {
//   try {
//     const { tournamentId } = req.params;
//     const { walletAddress } = req.body;

//     if (!walletAddress) {
//       return res.status(400).json({
//         success: false,
//         message: 'Wallet address is required',
//       });
//     }

//     if (!isValidObjectId(tournamentId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid tournament ID',
//       });
//     }

//     // Start session for transaction
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // Get the tournament
//       const tournament =
//         await Tournament.findById(tournamentId).session(session);

//       if (!tournament) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(404).json({
//           success: false,
//           message: 'Tournament not found',
//         });
//       }

//       // Check if tournament is active and ongoing
//       if (!tournament.isActive) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({
//           success: false,
//           message: 'Tournament is not active',
//         });
//       }

//       const now = new Date();
//       if (now < tournament.startDate || now > tournament.endDate) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({
//           success: false,
//           message: 'Tournament is not ongoing',
//         });
//       }

//       // Find or create the wallet user
//       const user = await WalletUser.findOrCreateWallet(walletAddress);

//       // Check if user has already participated
//       if (tournament.hasParticipated(user._id)) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(200).json({
//           success: true,
//           message: 'Already participated in this tournament',
//           data: tournament,
//         });
//       }

//       // If not already visited, add as visitor first and give visit points
//       if (!tournament.hasVisited(user._id)) {
//         tournament.addVisitor(user._id);
//         await user.addTournamentPoints(
//           tournament._id,
//           tournament.pointsForVisit,
//         );
//       }

//       // Add user to participated array
//       tournament.addParticipant(user._id);
//       await tournament.save({ session });

//       // Note: We don't add additional points for participation as per your requirement
//       // Points are only awarded once upon first visit

//       await session.commitTransaction();
//       session.endSession();

//       res.status(200).json({
//         success: true,
//         message: 'Successfully participated in tournament!',
//         data: tournament,
//       });
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       throw error;
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

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
      if (now > tournament.registrationEndDate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Tournament is not ongoing',
        });
      }

      // Find or create the wallet user
      // const user = await WalletUser.findOrCreateWallet(walletAddress);
      const result = await WalletUser.findOrCreateWallet(walletAddress);
      const user = result.wallet;

      // Check if user has already participated using the tournament hasParticipated method
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
      }

      // Add user to participated array in tournament
      tournament.addParticipant(user._id);
      await tournament.save({ session });

      // Add tournament to user's participated tournaments array
      await user.addTournament(tournament._id, session);

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
