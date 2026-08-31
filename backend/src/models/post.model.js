const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Địa chỉ ảnh không được để trống'],
      trim: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
      trim: true,
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
