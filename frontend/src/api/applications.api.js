import api from './axios';

export const getApplications = (params) => api.get('/applications', { params });
export const getApplication = (id) => api.get(`/applications/${id}`);
export const applyToJob = (formData) =>
  api.post('/applications/apply', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateApplicationStatus = (id, status) =>
  api.put(`/applications/${id}/status`, { status });
