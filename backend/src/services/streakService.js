/**
 * Calculates and updates the user's coding streak based on active submission date.
 * @param {Object} user - The mongoose User document
 * @returns {Boolean} - Whether the streak was updated
 */
export const updateUserStreak = async (user) => {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  const lastActive = user.streak?.lastActiveDate;

  if (!lastActive) {
    user.streak = {
      current: 1,
      max: Math.max(user.streak?.max || 0, 1),
      lastActiveDate: today
    };
    await user.save();
    return true;
  }

  if (lastActive === today) {
    // Already active today, streak remains unchanged
    return false;
  }

  // Calculate difference in days
  const todayDate = new Date(today);
  const lastDate = new Date(lastActive);
  const diffTime = Math.abs(todayDate - lastDate);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    const newCurrent = (user.streak.current || 0) + 1;
    user.streak.current = newCurrent;
    user.streak.max = Math.max(user.streak.max || 0, newCurrent);
    user.streak.lastActiveDate = today;
  } else {
    // Streak broken, reset to 1
    user.streak.current = 1;
    user.streak.lastActiveDate = today;
  }

  await user.save();
  return true;
};

