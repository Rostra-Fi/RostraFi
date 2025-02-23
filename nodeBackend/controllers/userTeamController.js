const UserTeam = require('../models/userTeamModel');
const Section = require('../models/section');
const AppError = require('../utils/appError');
const logger = require('../config/logger');
const { MAX_TEAMS_PER_SECTION } = require('../utils/constants');
const { mongoose } = require('mongoose');

exports.createUserTeam = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, teamName, sections } = req.body;
    console.log(sections);

    // Check existing team name for user
    const existingTeam = await UserTeam.findOne({
      userId,
      teamName,
      isActive: true,
    }).session(session);

    if (existingTeam) {
      throw new AppError('Team name already exists for this user', 400);
    }

    // Validate all sections and their teams
    const validatedSections = await Promise.all(
      sections.map(async (section) => {
        const existingSection = await Section.findById(section.sectionId)
          .populate('teams')
          .session(session);

        if (!existingSection) {
          throw new AppError(`Section not found: ${section.sectionId}`, 400);
        }

        if (existingSection.name !== section.name) {
          throw new AppError(
            `Section name does not match for: ${section.sectionId}`,
            400,
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
      userId,
      teamName,
      sections: validatedSections,
    });

    await userTeam.save({ session });

    // Populate and prepare response
    const populatedTeam = await UserTeam.findById(userTeam._id)
      .populate('sections.sectionId')
      .populate('sections.selectedTeams')
      .session(session);

    await session.commitTransaction();

    logger.info('User team created successfully', {
      userId,
      teamId: userTeam._id,
      sections: validatedSections.map((s) => s.sectionId),
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
    const { userId } = req.params;

    const teams = await UserTeam.find({
      userId,
      isActive: true,
    }).populate([
      {
        path: 'sections.sectionId',
        select: ' _id ',
      },
      {
        path: 'sections.selectedTeams',
      },
    ]);

    if (!teams.length) {
      throw new AppError('No teams found for this user', 404);
    }

    res.status(200).json({
      status: 'success',
      data: teams,
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
    const { selectedTeams } = req.body;

    const userTeam = await UserTeam.findOne({
      _id: teamId,
      userId: req.body.userId,
      isActive: true,
    }).session(session);

    if (!userTeam) {
      next(new AppError('Team not found or unauthorized', 404));
    }

    // Validate selected teams
    const section = await Section.findById(userTeam.section.sectionId)
      .populate('teams')
      .session(session);

    const validTeamIds = new Set(
      section.teams.map((team) => team._id.toString()),
    );
    const invalidTeams = selectedTeams.filter(
      (teamId) => !validTeamIds.has(teamId.toString()),
    );

    if (invalidTeams.length > 0) {
      next(
        new AppError('Some selected teams do not belong to this section', 400),
      );
    }

    userTeam.section.selectedTeams = selectedTeams;
    await userTeam.save({ session });

    const updatedTeam = await UserTeam.findById(teamId)
      .populate('section.sectionId')
      .populate('section.selectedTeams')
      .session(session);

    await session.commitTransaction();

    logger.info('User team updated successfully', {
      userId: req.body.userId,
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
    const { userId, teamId } = req.params;

    // Soft delete
    const deletedTeam = await UserTeam.findOneAndUpdate(
      { _id: teamId, userId, isActive: true },
      { isActive: false },
      { new: true },
    );

    if (!deletedTeam) {
      next(new AppError('Team not found or unauthorized', 404));
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
