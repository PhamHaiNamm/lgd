const Post = require('../models/post.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Lấy danh sách tất cả bài đăng trên mạng xã hội (mới nhất lên đầu)
 */
async function getAllPosts(req, res, next) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    return sendSuccess(res, posts, 'Lấy danh sách bài đăng thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * Đăng bài viết mới (kèm ảnh và caption)
 */
async function createPost(req, res, next) {
  try {
    const user = req.user;
    const { caption } = req.body;
    let imageUrl = req.body.imageUrl;
    let publicId = req.body.publicId || '';

    // Nếu người dùng upload file ảnh qua form-data
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'luc_gia_duong/posts',
        originalname: req.file.originalname,
      });
      imageUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    if (!imageUrl) {
      return sendError(res, 'Vui lòng chọn 1 ảnh để đăng bài.', 400);
    }

    const newPost = await Post.create({
      imageUrl,
      publicId,
      caption: caption || '',
      author: user._id,
      authorName: user.name,
      authorAvatar: user.avatar,
      likes: [],
    });

    return sendSuccess(res, newPost, 'Đăng bài viết thành công!', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Thả tim / Bỏ thả tim bài viết
 */
async function toggleLikePost(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 'Không tìm thấy bài viết.', 404);
    }

    const likeIndex = post.likes.findIndex((uid) => uid.toString() === userId.toString());
    let isLiked = false;

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
      isLiked = false;
    } else {
      post.likes.push(userId);
      isLiked = true;
    }

    await post.save();

    return sendSuccess(
      res,
      {
        postId: post._id,
        likesCount: post.likes.length,
        isLiked,
      },
      isLiked ? 'Đã thích bài viết.' : 'Đã bỏ thích bài viết.'
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Xóa bài đăng (Người đăng hoặc Admin đều có quyền xóa)
 */
async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 'Không tìm thấy bài viết cần xóa.', 404);
    }

    // Kiểm tra quyền: Phải là tác giả của bài viết HOẶC là Admin
    const isAuthor = post.author.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return sendError(res, 'Bạn không có quyền xóa bài viết này.', 403);
    }

    // Xóa ảnh trên Cloudinary/local nếu có publicId
    if (post.publicId) {
      try {
        await deleteFromCloudinary(post.publicId);
      } catch (err) {
        console.warn('Lỗi khi xóa ảnh:', err.message);
      }
    }

    await Post.findByIdAndDelete(id);

    return sendSuccess(res, { deletedId: id }, 'Đã xóa bài viết thành công.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPosts,
  createPost,
  toggleLikePost,
  deletePost,
};
