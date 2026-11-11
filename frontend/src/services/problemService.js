import api from './api';

export const problemService = {
  async getProblems(params = {}) {
    const res = await api.get('/problems', { params });
    return res.data;
  },

  async getProblemBySlug(slug) {
    const res = await api.get(`/problems/${slug}`);
    return res.data;
  },

  async runCode(slug, { code, language, customInput }) {
    const res = await api.post(`/problems/${slug}/run`, {
      code,
      language,
      customInput
    });
    return res.data;
  },

  async submitCode(slug, { code, language }) {
    const res = await api.post(`/problems/${slug}/submit`, {
      code,
      language
    });
    return res.data;
  }
};

