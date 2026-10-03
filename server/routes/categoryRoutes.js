const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Allow public/student viewing of active categories, admin can view all
router.get('/', (req, res, next) => {
  // If authorization header exists, verify it, otherwise pass through
  if (req.headers.authorization) {
    return protect(req, res, () => getCategories(req, res, next));
  }
  getCategories(req, res, next);
});

router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
