require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

const defaultUsers = [
  {
    name: 'Quản trị viên',
    username: 'admin',
    password: 'adminPassword123',
    role: 'admin',
    birthYear: 1995,
    location: 'Hà Nội',
    bio: 'Tài khoản quản trị viên hệ thống Lục Gia Đường',
  },
  {
    name: 'Người dùng thử nghiệm',
    username: 'user1',
    password: 'userPassword123',
    role: 'user',
    birthYear: 2000,
    location: 'TP. Hồ Chí Minh',
    bio: 'Thành viên cộng đồng Lục Gia Đường',
  },
];

async function seedUsers() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Không tìm thấy MONGODB_URI trong file .env');
    process.exit(1);
  }

  try {
    console.log('⏳ Đang kết nối tới MongoDB Atlas...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Đã kết nối MongoDB Atlas thành công!');

    for (const userData of defaultUsers) {
      const existing = await User.findOne({ username: userData.username });
      if (existing) {
        console.log(`ℹ️  Tài khoản "${userData.username}" (${existing.role}) đã tồn tại trong cơ sở dữ liệu.`);
      } else {
        const created = await User.create(userData);
        console.log(`🎉 Đã tạo thành công tài khoản [${created.role.toUpperCase()}]: "${created.username}"`);
      }
    }

    console.log('\n--- TỔNG KẾT TÀI KHOẢN ---');
    const allUsers = await User.find({}, 'name username role birthYear location');
    console.table(allUsers.map(u => ({
      ID: u._id.toString(),
      'Tên hiển thị': u.name,
      'Username': u.username,
      'Role': u.role,
      'Khu vực': u.location
    })));

  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo tài khoản:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Đã đóng kết nối cơ sở dữ liệu.');
  }
}

seedUsers();
