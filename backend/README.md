# Backend NodeJS - Lục Gia Đường

Dự án Backend API được xây dựng với công nghệ **NodeJS** và **Express.js**, tích hợp **MongoDB Atlas** (qua Mongoose) và **Cloudinary** (lưu trữ & tối ưu hình ảnh).

---

## 📁 Cấu trúc thư mục

```
backend/
├── .env                  # Biến môi trường local (Port, MongoDB, Cloudinary)
├── .env.example          # Mẫu biến môi trường
├── .gitignore            # File bỏ qua khi commit Git
├── package.json          # Quản lý dependencies & scripts
├── README.md             # Tài liệu hướng dẫn
└── src/
    ├── app.js            # Khởi tạo Express App & cấu hình Middleware
    ├── server.js         # Entry point chạy Server & kết nối DB
    ├── config/           # Cấu hình môi trường, DB, Cloudinary
    │   ├── cloudinary.js
    │   ├── database.js
    │   └── environment.js
    ├── controllers/      # Điều hướng và xử lý request/response
    │   ├── example.controller.js
    │   ├── health.controller.js
    │   ├── item.controller.js
    │   └── upload.controller.js
    ├── middlewares/      # Middleware bắt lỗi, log, bảo mật, upload
    │   ├── errorHandler.middleware.js
    │   ├── logger.middleware.js
    │   └── upload.middleware.js
    ├── models/           # Mongoose Data Models
    │   └── item.model.js
    ├── routes/           # Định tuyến các API endpoints
    │   ├── example.routes.js
    │   ├── health.routes.js
    │   ├── item.routes.js
    │   ├── upload.routes.js
    │   └── index.js
    ├── services/         # Xử lý logic nghiệp vụ
    │   ├── cloudinary.service.js
    │   └── example.service.js
    └── utils/            # Các hàm trợ giúp dùng chung
        └── responseHandler.js
```

---

## 🚀 Hướng dẫn cài đặt & khởi chạy

### 1. Cài đặt các thư viện cần thiết

Mở terminal tại thư mục `backend`:

```bash
cd backend
npm install
```

### 2. Cấu hình biến môi trường `.env`

Điền thông tin tài khoản Cloudinary của bạn vào file `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Chạy ứng dụng

- **Chế độ phát triển (Development với auto-reload):**
  ```bash
  npm run dev
  ```

- **Chế độ sản xuất (Production):**
  ```bash
  npm start
  ```

---

## 🌐 Danh sách API Endpoints

### 1. Hệ thống & Giám sát
| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/` | Trang thông tin chào mừng |
| `GET` | `/api/v1/health` | Kiểm tra tình trạng server & MongoDB |
| `GET` | `/api/v1/example/info` | API ví dụ trả về thông tin hệ thống |

### 2. Upload hình ảnh (Cloudinary)
| Phương thức | Đường dẫn | Tham số (Form-Data / JSON) | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/upload/single` | Form-data: `image` (file ảnh) | Tải 1 ảnh lên Cloudinary |
| `POST` | `/api/v1/upload/multiple` | Form-data: `images` (nhiều file ảnh) | Tải tối đa 10 ảnh cùng lúc |
| `POST` | `/api/v1/upload/delete` | Body JSON: `{"publicId": "..."}` | Xóa ảnh khỏi Cloudinary |

### 3. Quản lý Items (MongoDB CRUD)
| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/api/v1/items` | Lấy danh sách tất cả items |
| `POST` | `/api/v1/items` | Tạo mới item (`{title, description, status}`) |
| `DELETE` | `/api/v1/items/:id` | Xóa item theo ID |
