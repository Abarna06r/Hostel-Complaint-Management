import api from './api';

export const notificationService = {
  // Get logged-in user notifications
  getMyNotifications: async (limit = 25) => {
    const response = await api.get('/notifications', { params: { limit } });
    return response.data;
  },

  // Get count of unread notifications
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
