const BadgeService = require('../services/badgeService');
const WalletUser = require('../models/walletUserModel');

exports.getUserBadges = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const result = await WalletUser.findOrCreateWallet(walletAddress);
    const user = result.wallet;
    console.log('User-Badge:', user);

    const badges = await BadgeService.getUserBadges(user._id);
    console.log('Badges-:', badges);

    res.status(200).json({
      success: true,
      data: {
        badges,
        totalBadges: user.totalBadges,
        lastBadgeEarned: user.lastBadgeEarned,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getNewBadges = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const result = await WalletUser.findOrCreateWallet(walletAddress);
    const user = result.wallet;

    const newBadges = await user.getNewBadges();
    console.log('New Badges:', newBadges);
    res.status(200).json({
      success: true,
      data: {
        newBadges,
        hasNewBadges: newBadges.length > 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markBadgesViewed = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { badgeIds } = req.body; // Optional: specific badge IDs to mark as viewed

    const result = await WalletUser.findOrCreateWallet(walletAddress);
    const user = result.wallet;

    await user.markBadgesAsViewed(badgeIds);

    res.status(200).json({
      success: true,
      message: 'Badges marked as viewed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.initializeBadges = async (req, res) => {
  try {
    await BadgeService.initializeDefaultBadges();
    res.status(200).json({
      success: true,
      message: 'Default badges initialized successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initializing badges',
      error: error.message,
    });
  }
};
