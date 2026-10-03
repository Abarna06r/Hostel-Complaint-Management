import api from './api';

export const categoryService = {
  // Get all active categories (or all if admin)
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Create new category (Admin)
  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Update category (Admin)
  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category (Admin)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
