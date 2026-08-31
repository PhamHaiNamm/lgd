require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

const memberList = [
  { name: 'Hải Nam', username: 'hainam', password: '123', role: 'admin', birthYear: 2004, location: 'Quảng Ninh', avatar: '/images/thành_viên/pham-hai-nam.jpg', bio: 'Trưởng đoàn / Quản trị viên Lục Gia Đường' },
  { name: 'Thị Tâm', username: 'thitam', password: '123', role: 'user', birthYear: 2008, location: 'Quảng Ninh', avatar: '/images/thành_viên/nguyen-thi-tam.jpg', bio: 'Ban Truyền Thông' },
  { name: 'Lê Hiếu (cứt)', username: 'lehieu_cut', password: '123', role: 'user', birthYear: 2008, location: 'Quảng Ninh', avatar: '/images/thành_viên/le-minh-hieu.jpg', bio: 'Thành viên đoàn' },
  { name: 'Hồ Nam', username: 'honam', password: '123', role: 'user', birthYear: 2006, location: 'Quảng Ninh', avatar: '/images/thành_viên/ho-nam.jpg', bio: 'Thành viên đoàn' },
  { name: 'Nguyễn Long', username: 'nguyenlong', password: '123', role: 'user', birthYear: 2008, location: 'Quảng Ninh', avatar: '/images/thành_viên/nguyen-bao-long.jpg', bio: 'Đuôi Lân' },
  { name: 'Bảo Nguyên', username: 'baonguyen', password: '123', role: 'user', birthYear: 2013, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Phạm Tài', username: 'phamtai', password: '123', role: 'user', birthYear: 2010, location: 'Quảng Ninh', avatar: '/images/thành_viên/pham-tai.jpg', bio: 'Thành viên đoàn' },
  { name: 'Tuấn sữa', username: 'tuansua', password: '123', role: 'user', birthYear: 2009, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Tiến Mạnh', username: 'tienmanh', password: '123', role: 'user', birthYear: 2010, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Gia Hưng', username: 'giahung', password: '123', role: 'user', birthYear: 2010, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Lưu Thịnh', username: 'luuthinh', password: '123', role: 'user', birthYear: 2009, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Trần Dũng', username: 'trandung', password: '123', role: 'user', birthYear: 2010, location: 'Quảng Ninh', avatar: '/images/thành_viên/tran-dung.jpg', bio: 'Thành viên đoàn' },
  { name: 'Nguyễn Huy', username: 'nguyenhuy', password: '123', role: 'user', birthYear: 2009, location: 'Quảng Ninh', avatar: '/images/thành_viên/nguyen-duc-huy.jpg', bio: 'Thành viên đoàn' },
  { name: 'Gia Huy', username: 'giahuy', password: '123', role: 'user', birthYear: 2010, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Danh Đức', username: 'danhduc', password: '123', role: 'user', birthYear: 2012, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Sơn Đậu', username: 'sondau', password: '123', role: 'user', birthYear: 2010, location: 'Quảng Ninh', avatar: '/images/thành_viên/du-giang-son.jpg', bio: 'Thành viên đoàn' },
  { name: 'Lê Nhung', username: 'lenhung', password: '123', role: 'user', birthYear: 2009, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Gia Minh', username: 'giaminh', password: '123', role: 'user', birthYear: 2008, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Lê Hiếu', username: 'lehieu', password: '123', role: 'user', birthYear: 2008, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Quốc Trường', username: 'quoctruong', password: '123', role: 'user', birthYear: 2010, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Duy Hưng', username: 'duyhung', password: '123', role: 'user', birthYear: 2009, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Tiến Dũng', username: 'tiendung', password: '123', role: 'user', birthYear: 2009, location: 'Quảng Ninh', avatar: '/images/thành_viên/nguyen-tien-dung.jpg', bio: 'Thành viên đoàn' },
  { name: 'Duy Mạnh', username: 'duymanh', password: '123', role: 'user', birthYear: 2010, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Xuân Hiếu', username: 'xuanhieu', password: '123', role: 'user', birthYear: 2010, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
  { name: 'Lò vôi', username: 'lovoi', password: '123', role: 'user', birthYear: 2009, location: 'Quảng Ninh', avatar: '/images/thành_viên/ngo-trung-hieu-lo-voi.jpg', bio: 'Đuôi Lân' },
  { name: 'Tuấn Minh', username: 'tuanminh', password: '123', role: 'user', birthYear: 2009, location: 'Quảng Ninh', avatar: 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png', bio: 'Thành viên đoàn' },
];

async function seedBatch() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Không tìm thấy MONGODB_URI');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Đã kết nối MongoDB Atlas.');

    let createdCount = 0;
    let updatedCount = 0;

    for (const mem of memberList) {
      const existing = await User.findOne({ username: mem.username });
      if (existing) {
        existing.name = mem.name;
        existing.birthYear = mem.birthYear;
        existing.location = mem.location;
        existing.bio = mem.bio;
        existing.password = mem.password; // Sẽ được băm lại
        if (mem.avatar) existing.avatar = mem.avatar;
        await existing.save();
        updatedCount++;
      } else {
        await User.create(mem);
        createdCount++;
      }
    }

    console.log(`🎉 Hoàn tất: Tạo mới ${createdCount} tài khoản, cập nhật ${updatedCount} tài khoản.`);

    const allUsers = await User.find({}, 'name username role birthYear location');
    console.table(allUsers.map((u, i) => ({
      STT: i + 1,
      'Họ và tên': u.name,
      'Username': u.username,
      'Password': '123',
      'Role': u.role,
      'Năm sinh': u.birthYear
    })));

  } catch (err) {
    console.error('Lỗi khởi tạo tài khoản hàng loạt:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Đã đóng kết nối.');
  }
}

seedBatch();
