import api from './api';

export const complaintService = {
  // Create complaint (handles FormData for file attachment or JSON)
  createComplaint: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/complaints', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Get student's complaints with filtering, search, and pagination
  getMyComplaints: async (params = {}) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  // Get single complaint by ID or complaintId
  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Update a pending complaint
  updateComplaint: async (id, data) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },

  // Cancel/delete a pending complaint
  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};

export default complaintService;
