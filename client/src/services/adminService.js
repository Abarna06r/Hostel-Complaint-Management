import api from './api';

export const adminService = {
  // Get admin dashboard stats, category counts, hostel counts, recent & critical complaints
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get all complaints with filters, search, pagination
  getAllComplaints: async (params = {}) => {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },

  // Update complaint status & admin remarks
  updateComplaintStatus: async (id, data) => {
    const response = await api.put(`/admin/complaints/${id}/status`, data);
    return response.data;
  },

  // Assign complaint to admin or maintenance staff
  assignComplaint: async (id, data) => {
    const response = await api.put(`/admin/complaints/${id}/assign`, data);
    return response.data;
  },

  // Resolve complaint with resolution notes
  resolveComplaint: async (id, data) => {
    const response = await api.put(`/admin/complaints/${id}/resolve`, data);
    return response.data;
  },

  // Reject complaint with reason
  rejectComplaint: async (id, data) => {
    const response = await api.put(`/admin/complaints/${id}/reject`, data);
    return response.data;
  },

  // Get list of all students with complaint counts
  getAllStudents: async (params = {}) => {
    const response = await api.get('/admin/students', { params });
    return response.data;
  },

  // Get student details and their complaints
  getStudentDetails: async (id) => {
    const response = await api.get(`/admin/students/${id}`);
    return response.data;
  },
};

export default adminService;
