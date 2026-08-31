let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  try {
    mongoose = require('../../../web/node_modules/mongoose');
  } catch (err) {
    mongoose = require('mongoose');
  }
}

const scheduleSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Ngày biểu diễn không được để trống (định dạng YYYY-MM-DD)'],
      trim: true,
    },
    time: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Địa điểm biểu diễn không được để trống'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Mô tả hoặc tên chương trình không được để trống'],
      trim: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm theo ngày nhanh chóng
scheduleSchema.index({ date: 1 });

module.exports = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
