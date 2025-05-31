const Badge = require('../models/badge');
const WalletUser = require('../models/walletUserModel');
const UserBadge = require('../models/userBadge');

class BadgeService {
  static async initializeDefaultBadges() {
    const defaultBadges = [
      {
        name: 'Tournament Rookie',
        description: 'Participated in your first tournament',
        icon: '🥉',
        type: 'tournament_participation',
        tier: 'bronze',
        requirement: 1,
      },
      {
        name: 'Rising Competitor',
        description: 'Participated in 5 tournaments',
        icon: '🥈',
        type: 'tournament_participation',
        tier: 'silver',
        requirement: 5,
      },
      {
        name: 'Tournament Veteran',
        description: 'Participated in 10 tournaments',
        icon: '🥇',
        type: 'tournament_participation',
        tier: 'gold',
        requirement: 10,
      },
      {
        name: 'Tournament Master',
        description: 'Participated in 25 tournaments',
        icon: '💎',
        type: 'tournament_participation',
        tier: 'platinum',
        requirement: 25,
      },
      {
        name: 'Tournament Legend',
        description: 'Participated in 50 tournaments',
        icon: '👑',
        type: 'tournament_participation',
        tier: 'diamond',
        requirement: 50,
      },
    ];

    for (const badgeData of defaultBadges) {
      try {
        await Badge.create(badgeData);
      } catch (error) {
        // Badge already exists, skip
        if (error.code !== 11000) {
          console.error('Error creating badge:', error);
        }
      }
    }
  }

  static async checkUserBadges(userId) {
    const user = await WalletUser.findById(userId);
    if (!user) return [];

    return await user.checkAndAwardBadges();
  }

  static async getUserBadges(userId, onlyNew = false) {
    const query = { userId };
    if (onlyNew) {
      query.isNewlyEarned = true;
      query.isViewed = false;
    }

    return await UserBadge.find(query)
      .populate('badgeId')
      .sort({ earnedAt: -1 });
  }
}

module.exports = BadgeService;
