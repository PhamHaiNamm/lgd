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

const { hashPassword, verifyPassword } = require('../utils/security');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Họ và tên không được để trống'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Tên đăng nhập không được để trống'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự'],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu không được để trống'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    birthYear: {
      type: Number,
      min: [1900, 'Năm sinh không hợp lệ'],
      max: [new Date().getFullYear(), 'Năm sinh không hợp lệ'],
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Địa điểm không được vượt quá 200 ký tự'],
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Tiểu sử không được vượt quá 1000 ký tự'],
    },
    nameFrame: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
      maxlength: [20, 'Số điện thoại không hợp lệ'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Tự động mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = hashPassword(this.password);
  next();
});

// Phương thức so sánh mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function (candidatePassword) {
  return verifyPassword(candidatePassword, this.password);
};

// Loại bỏ trường mật khẩu khi trả về JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
