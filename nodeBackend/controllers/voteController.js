const Vote = require('../models/voteModel');
const Content = require('../models/contentModel');
const UserWallet = require('../models/walletUserModel');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { VoteTypeEnum } = require('../models/voteModel').schema.statics;

/**
 * Create a new vote or update existing vote
 */
exports.createVote = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, contentId, voteType } = req.body;

    if (!Object.values(VoteTypeEnum).includes(voteType)) {
      await session.abortTransaction();
      session.endSession();
      return next(
        new AppError('Invalid vote type. Must be "yes" or "no".', 400),
      );
    }

    // Find the content
    const content = await Content.findById(contentId).session(session);
    if (!content) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Content not found', 404));
    }

    if (!content.isActive) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Voting is closed for this content', 400));
    }

    // Find the user wallet
    const userWallet = await UserWallet.findById(userId).session(session);
    if (!userWallet) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('User wallet not found', 404));
    }

    // Check if user has enough points
    if (userWallet.points < content.voteCost) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Not enough points to vote', 400));
    }

    // Check if user has already voted on this content
    const existingVote = await Vote.findOne({
      user: userId,
      content: contentId,
    }).session(session);

    if (existingVote) {
      // If the vote type is the same, return error
      if (existingVote.voteType === voteType) {
        await session.abortTransaction();
        session.endSession();
        return next(
          new AppError(
            'You have already voted on this content with the same vote type',
            400,
          ),
        );
      }

      // Change vote type - first remove the old vote count
      if (existingVote.voteType === VoteTypeEnum.YES) {
        content.yesVotes = Math.max(0, content.yesVotes - 1);
      } else {
        content.noVotes = Math.max(0, content.noVotes - 1);
      }

      // Then add the new vote
      if (voteType === VoteTypeEnum.YES) {
        content.yesVotes += 1;
      } else {
        content.noVotes += 1;
      }

      // Update the existing vote
      existingVote.voteType = voteType;
      existingVote.updatedAt = Date.now();
      await existingVote.save({ session });

      // No need to deduct points again since user already paid
    } else {
      // Create a new vote
      const newVote = new Vote({
        user: userId,
        content: contentId,
        voteType,
        pointsSpent: content.voteCost,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update content vote counts
      if (voteType === VoteTypeEnum.YES) {
        content.yesVotes += 1;
      } else {
        content.noVotes += 1;
      }
      content.totalVotes += 1;

      // Deduct points from user wallet
      userWallet.points -= content.voteCost;
      userWallet.lastActivity = Date.now();

      await newVote.save({ session });
      await userWallet.save({ session });
    }

    // Save the updated content
    await content.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(error.message, 500));
  }
});

/**
 * Get all votes by a specific user
 */
exports.getVotesByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const votes = await Vote.find({ user: userId })
    .populate('content', 'id ')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: votes.length,
    data: votes,
  });
});

/**
 * Get all votes for a specific content
 */
exports.getVotesByContent = catchAsync(async (req, res, next) => {
  const { contentId } = req.params;

  const votes = await Vote.find({ content: contentId })
    .populate('user', 'walletAddress')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: votes.length,
    data: votes,
  });
});

/**
 * Get yes votes by a specific user across all content
 */
exports.getYesVotesByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const votes = await Vote.find({
    user: userId,
    voteType: VoteTypeEnum.YES,
  })
    .populate('content', 'title description image')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: votes.length,
    data: votes,
  });
});

/**
 * Get no votes by a specific user across all content
 */
exports.getNoVotesByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const votes = await Vote.find({
    user: userId,
    voteType: VoteTypeEnum.NO,
  })
    .populate('content', 'title description image')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: votes.length,
    data: votes,
  });
});
