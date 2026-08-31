const express = require('express');
const upload = require('../middlewares/upload.middleware');
const {
  getAllPosts,
  createPost,
  toggleLikePost,
  deletePost,
} = require('../controllers/post.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Lấy danh sách bài đăng (Công khai)
router.get('/', getAllPosts);

// Đăng bài viết mới (Cần đăng nhập, hỗ trợ upload 1 file ảnh qua key 'image')
router.post(
  '/',
  verifyToken,
  upload ? upload.single('image') : (req, res, next) => next(),
  createPost
);

// Thả tim bài viết (Cần đăng nhập)
router.post('/:id/like', verifyToken, toggleLikePost);

// Xóa bài viết (Chủ bài viết hoặc Admin)
router.delete('/:id', verifyToken, deletePost);

module.exports = router;
