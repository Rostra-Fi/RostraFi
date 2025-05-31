const mongoose = require('mongoose');
const { Schema } = mongoose;
const Badge = require('../models/badge');
const UserBadge = require('../models/userBadge');

const userWalletSchema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    visitedTournaments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tournament',
      },
    ],
    tournaments: [
      {
        tournamentId: {
          type: Schema.Types.ObjectId,
          ref: 'Tournament',
        },
        rank: {
          type: Number,
          default: null,
        },
        prize: {
          type: Number,
          default: 0,
        },
      },
    ],
    badges: [
      {
        type: Schema.Types.ObjectId,
        ref: 'UserBadge',
      },
    ],

    games: [
      {
        gameType: {
          type: String,
          enum: ['candycrush', 'battleship', 'spaceinvaders', 'platformer'],
        },
        gameId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'games.gameType',
        },
      },
    ],

    totalBadges: {
      type: Number,
      default: 0,
    },
    lastBadgeEarned: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userWalletSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

userWalletSchema.methods.addPoints = function (pointsToAdd) {
  if (pointsToAdd <= 0)
    throw new Error('Points to add must be greater than zero');
  this.points += pointsToAdd;
  this.lastActivity = Date.now();
  return this.save();
};

userWalletSchema.methods.addPointsForTournamentVisit = function (
  tournamentId,
  pointsToAdd,
  session = null,
) {
  if (pointsToAdd <= 0)
    throw new Error('Points to add must be greater than zero');

  if (this.visitedTournaments.length === 0) {
    this.points += pointsToAdd;
    this.visitedTournaments.push(tournamentId);
    this.lastActivity = Date.now();
  } else if (this.visitedTournaments.length === 1) {
  }

  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
};

userWalletSchema.methods.hasVisitedAnyTournament = function () {
  return this.visitedTournaments.length > 0;
};

userWalletSchema.methods.addTournament = function (
  tournamentId,
  session = null,
) {
  const alreadyParticipated = this.tournaments.some(
    (id) => id.toString() === tournamentId.toString(),
  );

  if (!alreadyParticipated) {
    this.tournaments.push({
      tournamentId: tournamentId,
      rank: null,
      prize: 0,
    });
    this.lastActivity = Date.now();
  }

  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
};

userWalletSchema.methods.hasParticipatedInTournament = function (tournamentId) {
  return this.tournaments.some(
    (id) => id.toString() === tournamentId.toString(),
  );
};

userWalletSchema.methods.addTournamentPoints = function (
  tournamentId,
  pointsToAdd,
  rank = null,
  prize = 0,
  session = null,
) {
  if (pointsToAdd <= 0)
    throw new Error('Points to add must be greater than zero');

  this.points += pointsToAdd;
  console.log('working');

  console.log(this.tournaments);
  const existingTournamentIndex = this.tournaments.findIndex(
    (t) => t._id.toString() === tournamentId.toString(),
  );
  console.log('something');

  if (existingTournamentIndex !== -1) {
    this.tournaments[existingTournamentIndex].rank = rank;
    this.tournaments[existingTournamentIndex].prize = prize;
  } else {
    this.tournaments.push({
      tournamentId,
      rank,
      prize,
    });
  }

  this.lastActivity = Date.now();

  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
};

userWalletSchema.methods.deductPoints = function (pointsToDeduct) {
  if (pointsToDeduct <= 0)
    throw new Error('Points to deduct must be greater than zero');
  if (this.points < pointsToDeduct)
    throw new Error('Insufficient points balance');
  this.points -= pointsToDeduct;
  this.lastActivity = Date.now();
  return this.save();
};

// Static method to find or create wallet by address
userWalletSchema.statics.findOrCreateWallet = async function (walletAddress) {
  if (!walletAddress) throw new Error('Wallet address is required');

  let wallet = await this.findOne({ walletAddress });
  let isNewWallet = false;

  if (!wallet) {
    wallet = await this.create({ walletAddress });
    isNewWallet = true;
  }

  return { wallet, isNewWallet };
};

userWalletSchema.methods.checkAndAwardBadges = async function (session = null) {
  // Get the current tournament count (this will include the newly added tournament)
  const tournamentCount = this.tournaments.length;

  console.log(
    `Checking badges for user ${this._id} with ${tournamentCount} tournaments`,
  );

  const badges = await Badge.find({
    type: 'tournament_participation',
    isActive: true,
  }).sort({ requirement: 1 });

  console.log(`Found ${badges.length} tournament participation badges`);

  const newlyEarnedBadges = [];

  for (const badge of badges) {
    console.log(
      `Checking badge: ${badge.name}, requirement: ${badge.requirement}, user tournaments: ${tournamentCount}`,
    );

    if (tournamentCount >= badge.requirement) {
      console.log(`User qualifies for badge: ${badge.name}`);

      try {
        // Check if user already has this badge
        const existingUserBadge = await UserBadge.findOne({
          userId: this._id,
          badgeId: badge._id,
        }).session(session);

        if (existingUserBadge) {
          console.log(`User already has badge: ${badge.name}`);
          continue; // Skip if already earned
        }

        const userBadge = new UserBadge({
          userId: this._id,
          badgeId: badge._id,
          isNewlyEarned: true,
          isViewed: false,
        });

        const saveOptions = session ? { session } : {};
        await userBadge.save(saveOptions);

        // Add to user's badges array
        this.badges.push(userBadge._id);
        this.totalBadges += 1;
        this.lastBadgeEarned = new Date();

        newlyEarnedBadges.push({
          badge,
          userBadge,
          isNew: true,
        });

        console.log(`Successfully awarded badge: ${badge.name}`);
      } catch (error) {
        console.error(`Error awarding badge ${badge.name}:`, error);
        // Badge already exists (duplicate key error), skip
        if (error.code !== 11000) {
          throw error;
        }
      }
    }
  }

  if (newlyEarnedBadges.length > 0) {
    const saveOptions = session ? { session } : {};
    await this.save(saveOptions);
    console.log(`Saved user with ${newlyEarnedBadges.length} new badges`);
  }

  return newlyEarnedBadges;
};

userWalletSchema.methods.getNewBadges = async function () {
  return await UserBadge.find({
    userId: this._id,
    isNewlyEarned: true,
    isViewed: false,
  }).populate('badgeId');
};

userWalletSchema.methods.markBadgesAsViewed = async function (badgeIds = null) {
  const query = { userId: this._id, isViewed: false };

  if (badgeIds && badgeIds.length > 0) {
    query._id = { $in: badgeIds };
  }

  await UserBadge.updateMany(query, {
    isViewed: true,
    isNewlyEarned: false,
  });
};

const WalletUser = mongoose.model('WalletUser', userWalletSchema);

module.exports = WalletUser;
