const UserTeam = require('../models/userTeamModel');
const Section = require('../models/section');
const WalletUser = require('../models/walletUserModel');
const AppError = require('../utils/appError');
const logger = require('../config/logger');
const { MAX_TEAMS_PER_SECTION } = require('../utils/constants');
const mongoose = require('mongoose');

exports.createUserTeam = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, teamName, sections, walletUserId, tournamentId } = req.body;

    // Check if tournament exists
    if (!tournamentId) {
      return next(new AppError('Invalid tournament ID', 400));
    }

    // Check if wallet user exists
    const walletUser = await WalletUser.findById(walletUserId).session(session);
    if (!walletUser) {
      return next(new AppError('Wallet user not found', 404));
    }

    // Check existing team name for user
    const existingTeam = await UserTeam.findOne({
      userId,
      teamName,
      isActive: true,
    }).session(session);

    if (existingTeam) {
      return next(new AppError('Team name already exists for this user', 400));
    }

    // Validate all sections and their teams
    const validatedSections = await Promise.all(
      sections.map(async (section) => {
        const existingSection = await Section.findById(section.sectionId)
          .populate('teams')
          .session(session);

        if (!existingSection) {
          return next(
            new AppError(`Section not found: ${section.sectionId}`, 400),
          );
        }

        if (existingSection.name !== section.name) {
          return next(
            new AppError(
              `Section name does not match for: ${section.sectionId}`,
              400,
            ),
          );
        }

        // Validate selected teams exist in section
        const validTeamIds = new Set(
          existingSection.teams.map((team) => team._id.toString()),
        );

        const invalidTeams = section.selectedTeams.filter(
          (teamId) => !validTeamIds.has(teamId.toString()),
        );

        if (invalidTeams.length > 0) {
          throw new AppError(
            `Some selected teams do not belong to section: ${section.sectionId}`,
            400,
          );
        }

        return {
          name: existingSection.name,
          sectionId: existingSection._id,
          selectedTeams: section.selectedTeams,
        };
      }),
    );

    // Create user team with validated sections
    const userTeam = new UserTeam({
      walletUserId,
      userId,
      teamName,
      sections: validatedSections,
      tournamentId, // Associate team with tournament if provided
    });

    await userTeam.save({ session });

    // Reset tournament points if tournament ID is provided
    if (tournamentId) {
      await walletUser.resetTournamentPoints(tournamentId);
    }

    // Populate and prepare response
    const populatedTeam = await UserTeam.findById(userTeam._id)
      .populate('sections.sectionId')
      .populate('sections.selectedTeams')
      .session(session);

    await session.commitTransaction();

    logger.info('User team created successfully', {
      walletUserId,
      userId,
      teamId: userTeam._id,
      sections: validatedSections.map((s) => s.sectionId),
      tournamentId,
    });

    res.status(201).json({
      status: 'success',
      data: populatedTeam,
    });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.getUserTeams = async (req, res, next) => {
  try {
    const { userId, walletUserId } = req.params;

    // Check if wallet user exists
    const walletUser = await WalletUser.findById(walletUserId);
    if (!walletUser) {
      return next(new AppError('Wallet user not found', 404));
    }

    const teams = await UserTeam.find({
      userId,
      isActive: true,
    }).populate([
      {
        path: 'sections.sectionId',
        select: '_id name',
      },
      {
        path: 'sections.selectedTeams',
      },
      {
        path: 'tournamentId',
        select: 'name startDate endDate prizePool image icon platform isActive',
      },
    ]);

    if (!teams.length) {
      return next(new AppError('No teams found for this user', 404));
    }

    // Filter teams to get only those with active tournaments
    const activeTeams = teams.filter(
      (team) => team.tournamentId && team.tournamentId.isActive === true,
    );

    // Check if there are any active tournament teams
    if (!activeTeams.length) {
      return res.status(200).json({
        status: 'success',
        message: 'No active tournaments you are participating in',
        data: [],
      });
    }

    res.status(200).json({
      status: 'success',
      count: activeTeams.length,
      data: activeTeams,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserTeam = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { teamId } = req.params;
    const { userId, sections, walletUserId } = req.body;

    // Check if wallet user exists
    const walletUser = await WalletUser.findById(walletUserId).session(session);
    if (!walletUser) {
      return next(new AppError('Wallet user not found', 404));
    }

    const userTeam = await UserTeam.findOne({
      _id: teamId,
      userId,
      isActive: true,
    }).session(session);

    if (!userTeam) {
      return next(new AppError('Team not found or unauthorized', 404));
    }

    // For each section in the request, validate and update
    if (sections && sections.length > 0) {
      // Validate all sections and their teams
      const validatedSections = await Promise.all(
        sections.map(async (section) => {
          const existingSection = await Section.findById(section.sectionId)
            .populate('teams')
            .session(session);

          if (!existingSection) {
            return next(
              new AppError(`Section not found: ${section.sectionId}`, 400),
            );
          }

          if (existingSection.name !== section.name) {
            return next(
              new AppError(
                `Section name does not match for: ${section.sectionId}`,
                400,
              ),
            );
          }

          // Validate selected teams exist in section
          const validTeamIds = new Set(
            existingSection.teams.map((team) => team._id.toString()),
          );

          const invalidTeams = section.selectedTeams.filter(
            (teamId) => !validTeamIds.has(teamId.toString()),
          );

          if (invalidTeams.length > 0) {
            return next(
              new AppError(
                `Some selected teams do not belong to section: ${section.sectionId}`,
                400,
              ),
            );
          }

          return {
            name: existingSection.name,
            sectionId: existingSection._id,
            selectedTeams: section.selectedTeams,
          };
        }),
      );

      userTeam.sections = validatedSections;
    } else if (req.body.teamName) {
      // If only team name is being updated
      userTeam.teamName = req.body.teamName;
    }

    await userTeam.save({ session });

    const updatedTeam = await UserTeam.findById(teamId)
      .populate('sections.sectionId')
      .populate('sections.selectedTeams')
      .session(session);

    await session.commitTransaction();

    logger.info('User team updated successfully', {
      userId,
      teamId,
    });

    res.status(200).json({
      status: 'success',
      data: updatedTeam,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.deleteUserTeam = async (req, res, next) => {
  try {
    const { userId, teamId, walletUserId } = req.params;

    // Check if wallet user exists
    const walletUser = await WalletUser.findById(walletUserId);
    if (!walletUser) {
      return next(new AppError('Wallet user not found', 404));
    }

    // Soft delete
    const deletedTeam = await UserTeam.findOneAndUpdate(
      { _id: teamId, userId, isActive: true },
      { isActive: false },
      { new: true },
    );

    if (!deletedTeam) {
      return next(new AppError('Team not found or unauthorized', 404));
    }

    logger.info('User team deleted successfully', { userId, teamId });

    res.status(200).json({
      status: 'success',
      message: 'Team deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
