import api from './api';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async toggleUserStatus(userId) {
    const res = await api.patch(`/admin/users/${userId}/toggle-status`);
    return res.data;
  },

  async getProblems(params = {}) {
    const res = await api.get('/admin/problems', { params });
    return res.data;
  },

  async createProblem(data) {
    const res = await api.post('/admin/problems', data);
    return res.data;
  },

  async updateProblem(id, data) {
    const res = await api.put(`/admin/problems/${id}`, data);
    return res.data;
  },

  async deleteProblem(id) {
    const res = await api.delete(`/admin/problems/${id}`);
    return res.data;
  },

  async setDailyChallenge(data) {
    const res = await api.post('/admin/daily-challenge', data);
    return res.data;
  }
};

