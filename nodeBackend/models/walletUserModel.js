const mongoose = require('mongoose');
const { Schema } = mongoose;

// Create a schema for tournament points
const tournamentPointSchema = new Schema({
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

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
    // Track tournament-specific points
    tournamentPoints: [tournamentPointSchema],
    // Add tournaments array to track participated tournaments
    tournaments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tournament',
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

// Method to add tournament-specific points
userWalletSchema.methods.addTournamentPoints = function (
  tournamentId,
  pointsToAdd,
  session = null,
) {
  if (pointsToAdd <= 0)
    throw new Error('Points to add must be greater than zero');
  console.log(tournamentId);

  // Check if tournament points already exist
  const existingPointIndex = this.tournamentPoints.findIndex(
    (tp) => tp.tournamentId === tournamentId.toString(),
  );

  if (existingPointIndex >= 0) {
    this.tournamentPoints[existingPointIndex].points += pointsToAdd;
  } else {
    // Add new tournament points entry
    this.tournamentPoints.push({
      tournamentId,
      points: pointsToAdd,
    });
  }

  // Also update total points
  this.points += pointsToAdd;
  this.lastActivity = Date.now();

  // If session is provided, use it for saving
  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
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

// Method to get tournament points
userWalletSchema.methods.getTournamentPoints = function (tournamentId) {
  const tournamentPoint = this.tournamentPoints.find(
    (tp) => tp.tournamentId.toString() === tournamentId.toString(),
  );

  return tournamentPoint ? tournamentPoint.points : 0;
};

// Method to reset tournament points
userWalletSchema.methods.resetTournamentPoints = function (tournamentId) {
  const tournamentPoint = this.tournamentPoints.find(
    (tp) => tp.tournamentId.toString() === tournamentId.toString(),
  );

  if (tournamentPoint) {
    // Deduct points from total
    this.points -= tournamentPoint.points;
    if (this.points < 0) this.points = 0;

    // Reset tournament points to zero
    tournamentPoint.points = 0;
    this.lastActivity = Date.now();
  }

  return this.save();
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

  if (!wallet) {
    wallet = await this.create({ walletAddress });
  }

  return wallet;
};

const WalletUser = mongoose.model('WalletUser', userWalletSchema);

module.exports = WalletUser;
