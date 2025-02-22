const UserTeam = require('../models/userTeamModel');
const Section = require('../models/section');
const AppError = require('../utils/appError');
const logger = require('../config/logger');
const { MAX_TEAMS_PER_SECTION } = require('../utils/constants');

exports.createUserTeam = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, teamName, section } = req.body;

    // Check existing team name for user
    const existingTeam = await UserTeam.findOne({
      userId,
      teamName,
      isActive: true,
    }).session(session);

    if (existingTeam) {
      next(new AppError('Team name already exists for this user', 400));
    }

    // Validate section with populated teams
    const existingSection = await Section.findById(section.sectionId)
      .populate('teams')
      .session(session);

    if (!existingSection) {
      next(new AppError('Section not found', 400));
    }

    if (existingSection.name !== section.name) {
      next(new AppError('Section name does not match', 400));
    }

    // Validate selected teams exist in section
    const validTeamIds = new Set(
      existingSection.teams.map((team) => team._id.toString()),
    );
    const invalidTeams = section.selectedTeams.filter(
      (teamId) => !validTeamIds.has(teamId.toString()),
    );

    if (invalidTeams.length > 0) {
      next(
        new AppError('Some selected teams do not belong to this section', 400),
      );
    }

    // Create user team
    const userTeam = new UserTeam({
      userId,
      teamName,
      section: {
        name: existingSection.name,
        sectionId: existingSection._id,
        selectedTeams: section.selectedTeams,
      },
    });

    await userTeam.save({ session });

    // Populate and prepare response
    const populatedTeam = await UserTeam.findById(userTeam._id)
      .populate('section.sectionId')
      .populate('section.selectedTeams')
      .session(session);

    await session.commitTransaction();

    logger.info('User team created successfully', {
      userId,
      teamId: userTeam._id,
      sectionId: section.sectionId,
    });

    res.status(201).json({
      status: 'success',
      data: populatedTeam,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.getUserTeams = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'section.sectionId' },
        { path: 'section.selectedTeams' },
      ],
    };

    const query = {
      userId,
      isActive: true,
    };

    const teams = await UserTeam.paginate(query, options);

    if (teams.docs.length === 0) {
      throw new ApiError(404, 'No teams found for this user');
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
