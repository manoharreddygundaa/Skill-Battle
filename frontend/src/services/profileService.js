import api from './api';

export const profileService = {
  async getStudentProfile(username) {
    const res = await api.get(`/profile/${username}`);
    return res.data;
  }
};

