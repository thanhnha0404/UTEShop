# UTEShop - Hệ thống quản lý cửa hàng đồ uống

## Giới thiệu
UTEShop là một hệ thống quản lý cửa hàng đồ uống trực tuyến được phát triển bởi sinh viên Đại học Sư phạm Kỹ thuật TP.HCM. Hệ thống bao gồm ứng dụng web cho khách hàng và giao diện quản trị cho admin với đầy đủ các chức năng từ đăng ký, đăng nhập, mua sắm đến quản lý đơn hàng và thống kê.

## Thành viên nhóm
- **Phương Thiện Nhân** - 22110387
- **Trần Thanh Nhã** - 22110386  
- **Nguyễn Đức Công Anh** - 22110281
- **Nguyễn Thị Ngọc Trâm** - 22110439

## Công nghệ sử dụng

### Backend
- **Node.js** với Express.js
- **MySQL** database
- **Sequelize** ORM
- **JWT** authentication
- **Multer** file upload
- **Nodemailer** email service
- **Socket.io** real-time notifications

### Frontend
- **React.js** với React Router
- **Tailwind CSS** styling
- **Axios** HTTP client
- **Swiper.js** image carousel
- **Lucide React** icons

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản 16 trở lên)
- MySQL (phiên bản 8.0 trở lên)
- Git

### Cài đặt Backend

1. **Clone repository và di chuyển vào thư mục backend**
```bash
cd UTEShop_backend
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình database**
Tạo file `.env` trong thư mục `UTEShop_backend`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_NAME=uteshop
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
PORT=8080
```

4. **Khởi tạo database**
```bash
npm run sync-db
```

5. **Chạy server**
```bash
npm start
```

Backend sẽ chạy trên `http://localhost:8080`

### Cài đặt Frontend

1. **Di chuyển vào thư mục frontend**
```bash
cd UTEShop_frontend
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy ứng dụng**
```bash
npm start
```

Frontend sẽ chạy trên `http://localhost:3000`

## Chức năng chính

### Dành cho khách hàng
- **Đăng ký/Đăng nhập** với xác thực email OTP
- **Quên mật khẩu** với OTP qua email
- **Duyệt sản phẩm** theo danh mục và tìm kiếm
- **Chi tiết sản phẩm** với gallery ảnh và đánh giá
- **Giỏ hàng** với tính năng upsize và ghi chú
- **Thanh toán** COD với voucher và điểm thưởng
- **Theo dõi đơn hàng** với trạng thái real-time
- **Yêu thích sản phẩm** và quản lý danh sách
- **Thông báo** real-time về đơn hàng
- **Hệ thống điểm thưởng** và ví loyalty

### Dành cho admin
- **Quản lý sản phẩm** thêm, sửa, xóa đồ uống
- **Quản lý danh mục** phân loại sản phẩm
- **Quản lý đơn hàng** xử lý và cập nhật trạng thái
- **Quản lý người dùng** và phân quyền
- **Thống kê doanh thu** và báo cáo chi tiết
- **Quản lý voucher** và khuyến mãi
- **Quản lý kho** và tồn trữ

## Cấu trúc dự án

```
UTEShop/
├── UTEShop_backend/          # Backend API
│   ├── controllers/          # Xử lý logic nghiệp vụ
│   ├── models/              # Định nghĩa database models
│   ├── routes/              # Định nghĩa API routes
│   ├── middlewares/         # Middleware xử lý
│   ├── services/            # Business logic services
│   └── uploads/             # Thư mục lưu ảnh upload
├── UTEShop_frontend/         # Frontend React
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Các trang ứng dụng
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── public/              # Static files
└── README.md
```

## API Endpoints chính

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Products
- `GET /api/drinks` - Lấy danh sách sản phẩm
- `GET /api/drinks/:id` - Chi tiết sản phẩm
- `GET /api/categories` - Danh mục sản phẩm

### Cart & Orders
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/add` - Thêm vào giỏ hàng
- `PUT /api/cart/update` - Cập nhật giỏ hàng
- `POST /api/checkout/cod` - Thanh toán COD

### Admin
- `GET /api/admin/statistics` - Thống kê tổng quan
- `GET /api/admin/orders` - Quản lý đơn hàng
- `POST /api/admin/drinks` - Thêm sản phẩm mới

## Tính năng nổi bật

### Hệ thống thanh toán
- Thanh toán khi nhận hàng (COD)
- Áp dụng voucher giảm giá
- Sử dụng điểm thưởng để giảm giá
- Tính phí upsize tự động

### Quản lý đơn hàng thông minh
- Theo dõi trạng thái real-time
- Thông báo tự động qua email
- Cho phép hủy đơn trong 5 phút đầu
- Gửi yêu cầu hủy đơn cho admin

### Hệ thống đánh giá
- Đánh giá sản phẩm sau khi nhận hàng
- Hiển thị rating trung bình
- Quản lý review và phản hồi

### Thống kê và báo cáo
- Dashboard tổng quan doanh thu
- Biểu đồ xu hướng bán hàng
- Top sản phẩm bán chạy
- Thống kê khách hàng và đơn hàng

## Cấu hình Email

Để sử dụng chức năng gửi email OTP:

1. Bật 2-Factor Authentication cho Gmail
2. Tạo App Password
3. Cập nhật `SMTP_USER` và `SMTP_PASS` trong file `.env`

## Database Schema

Hệ thống sử dụng MySQL với các bảng chính:
- `users` - Thông tin người dùng
- `drinks` - Sản phẩm đồ uống
- `categories` - Danh mục sản phẩm
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng
- `cart_items` - Giỏ hàng
- `reviews` - Đánh giá sản phẩm
- `vouchers` - Mã giảm giá
- `notifications` - Thông báo

## Triển khai

### Development
```bash
# Backend
cd UTEShop_backend
npm run dev

# Frontend  
cd UTEShop_frontend
npm start
```

### Production
```bash
# Build frontend
cd UTEShop_frontend
npm run build

# Start backend
cd UTEShop_backend
npm start
```

## Liên hệ

Dự án được phát triển bởi nhóm sinh viên Khoa Công nghệ Thông tin, Đại học Sư phạm Kỹ thuật TP.HCM.

Mọi thắc mắc và đóng góp vui lòng liên hệ qua email hoặc tạo issue trên repository.