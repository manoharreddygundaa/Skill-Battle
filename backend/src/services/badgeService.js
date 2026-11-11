import { Badge } from '../models/Badge.js';

/**
 * Checks and awards badges to a user based on their updated stats
 * @param {Object} user - The mongoose User document
 * @returns {Array} - Array of newly awarded badges
 */
export const checkAndAwardBadges = async (user) => {
  try {
    const allBadges = await Badge.find({});
    const unlockedBadgeIds = new Set(user.badges.map(b => b.badge.toString()));
    const newlyAwarded = [];

    const solvedCount = user.solvedProblems?.length || 0;
    const currentStreak = user.streak?.current || 0;
    const battleWins = user.battleStats?.wins || 0;

    for (const badge of allBadges) {
      if (unlockedBadgeIds.has(badge._id.toString())) {
        continue;
      }

      let qualifies = false;

      switch (badge.criteriaType) {
        case 'solved_count':
          qualifies = solvedCount >= badge.criteriaThreshold;
          break;
        case 'streak_days':
          qualifies = currentStreak >= badge.criteriaThreshold;
          break;
        case 'battle_wins':
          qualifies = battleWins >= badge.criteriaThreshold;
          break;
        default:
          break;
      }

      if (qualifies) {
        user.badges.push({
          badge: badge._id,
          unlockedAt: new Date()
        });
        newlyAwarded.push(badge);
      }
    }

    if (newlyAwarded.length > 0) {
      await user.save();
    }

    return newlyAwarded;
  } catch (err) {
    console.error('[BadgeService] Error checking badges:', err);
    return [];
  }
};

