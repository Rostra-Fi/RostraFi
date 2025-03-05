const mongoose = require('mongoose');
const { Schema } = mongoose;

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
    // Track visited tournaments (just first visit)
    visitedTournaments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tournament',
      },
    ],
    // Track participated tournaments with additional details
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

// Pre-save middleware to update the 'updatedAt' field
userWalletSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add points to wallet
userWalletSchema.methods.addPoints = function (pointsToAdd) {
  if (pointsToAdd <= 0)
    throw new Error('Points to add must be greater than zero');
  this.points += pointsToAdd;
  this.lastActivity = Date.now();
  return this.save();
};

// Method to add points for tournament visit if not already visited
userWalletSchema.methods.addPointsForTournamentVisit = function (
  tournamentId,
  pointsToAdd,
  session = null,
) {
  if (pointsToAdd <= 0)
    throw new Error('Points to add must be greater than zero');

  // Check if user has already visited any tournament
  if (this.visitedTournaments.length === 0) {
    // First tournament visit ever, add points
    this.points += pointsToAdd;
    this.visitedTournaments.push(tournamentId);
    this.lastActivity = Date.now();
  } else if (this.visitedTournaments.length === 1) {
    // User already has one visit - no need to add to the array
    // This keeps the visitedTournaments array with only one entry maximum
    // We don't add points as this is not the first visit
  }

  // If session is provided, use it for saving
  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
};

// Method to check if user has visited any tournament
userWalletSchema.methods.hasVisitedAnyTournament = function () {
  return this.visitedTournaments.length > 0;
};

// Method to add a tournament to user's participated tournaments
userWalletSchema.methods.addTournament = function (
  tournamentId,
  session = null,
) {
  // Check if user has already participated in this tournament
  const alreadyParticipated = this.tournaments.some(
    (id) => id.toString() === tournamentId.toString(),
  );

  if (!alreadyParticipated) {
    this.tournaments.push(tournamentId);
    this.lastActivity = Date.now();
  }

  // If session is provided, use it for saving
  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
};

// Method to check if user has participated in a tournament
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

  // Add points to total wallet points
  this.points += pointsToAdd;
  console.log('working');

  // Check if tournament already exists in the tournaments array
  console.log(this.tournaments);
  const existingTournamentIndex = this.tournaments.findIndex(
    (t) => t._id.toString() === tournamentId.toString(),
  );
  console.log('something');

  if (existingTournamentIndex !== -1) {
    // Update existing tournament entry
    this.tournaments[existingTournamentIndex].rank = rank;
    this.tournaments[existingTournamentIndex].prize = prize;
  } else {
    // Add new tournament entry
    this.tournaments.push({
      tournamentId,
      rank,
      prize,
    });
  }

  this.lastActivity = Date.now();

  // If session is provided, use it for saving
  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
};

// Method to deduct points from wallet
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

const WalletUser = mongoose.model('WalletUser', userWalletSchema);

module.exports = WalletUser;
