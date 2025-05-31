const mongoose = require('mongoose');
const { Schema } = mongoose;

const userBadgeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'WalletUser',
      required: true,
    },
    badgeId: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    isNewlyEarned: {
      type: Boolean,
      default: true, // Flag to show badge dialog
    },
    isViewed: {
      type: Boolean,
      default: false, // Track if user has seen the badge notification
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate badges
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);
module.exports = UserBadge;
