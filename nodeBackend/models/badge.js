const mongoose = require('mongoose');
const { Schema } = mongoose;

const badgeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['tournament_participation', 'points', 'streak', 'achievement'],
      required: true,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      required: true,
    },
    requirement: {
      type: Number,
      required: true, // Number of tournaments, points, etc.
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;
