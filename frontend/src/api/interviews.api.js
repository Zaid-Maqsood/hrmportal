import api from './axios';

export const getInterviews = () => api.get('/interviews');
export const createInterview = (data) => api.post('/interviews', data);
export const updateInterview = (id, data) => api.put(`/interviews/${id}`, data);
export const deleteInterview = (id) => api.delete(`/interviews/${id}`);
