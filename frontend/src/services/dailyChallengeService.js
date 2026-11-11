import api from './api';

export const dailyChallengeService = {
  async getTodayChallenge() {
    const res = await api.get('/daily-challenge/today');
    return res.data;
  },

  async submitDailyChallenge(data) {
    const res = await api.post('/daily-challenge/submit', data);
    return res.data;
  }
};

