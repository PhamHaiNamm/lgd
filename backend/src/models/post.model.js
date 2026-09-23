const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    videoType: {
      type: String,
      enum: ['', 'youtube', 'facebook'],
      default: '',
    },
    caption: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Nội dung bài viết không được vượt quá 2000 ký tự'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
