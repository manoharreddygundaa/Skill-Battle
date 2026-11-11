import api from './api';

export const battleService = {
  async createBattleRoom(data) {
    const res = await api.post('/battles/create', data);
    return res.data;
  },

  async getBattleRoom(roomCode) {
    const res = await api.get(`/battles/${roomCode}`);
    return res.data;
  },

  async getUserBattleHistory(params = {}) {
    const res = await api.get('/battles/history/user', { params });
    return res.data;
  },

  async getLeaderboard() {
    const res = await api.get('/battles/leaderboard');
    return res.data;
  }
};

