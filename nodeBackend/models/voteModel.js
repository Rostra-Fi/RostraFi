const mongoose = require('mongoose');
const { Schema } = mongoose;

const VoteTypeEnum = {
  YES: 'yes',
  NO: 'no',
};

const voteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'UserWallet',
      required: true,
      index: true,
    },
    content: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
      index: true,
    },
    voteType: {
      type: String,
      enum: Object.values(VoteTypeEnum),
      required: true,
    },
    pointsSpent: {
      type: Number,
      required: true,
      min: 1,
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
  },
);

// Compound index to ensure a user can only vote once per content
voteSchema.index({ user: 1, content: 1 }, { unique: true });

// Export the enum for use in controllers
voteSchema.statics.VoteTypeEnum = VoteTypeEnum;

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;
