# 🌍 WebGIS Admin Dashboard (Frontend)

Đây là giao diện quản trị viên (Admin Dashboard) thuộc hệ thống nền tảng WebGIS - Đồ án tốt nghiệp. Hệ thống cung cấp cái nhìn tổng quan về lưu lượng truy cập, quản lý thành viên và thống kê biến động doanh thu theo thời gian thực.

## 🚀 Tính năng nổi bật (Key Features)
- **Thống kê trực quan:** Biểu đồ doanh thu tự động tính toán theo 5 tháng gần nhất (sử dụng Chart.js).
- **Quản lý người dùng:** Phân quyền hệ thống, theo dõi cơ cấu thành viên (VIP/FREE).
- **Xuất báo cáo động (Export Reports):** Cho phép xuất báo cáo danh sách người dùng và doanh thu ra định dạng Excel (`.xlsx`) và PDF trực tiếp từ bảng điều khiển.
- **Bảo mật:** Giao tiếp an toàn với Backend qua JWT Token và xử lý triệt để CORS.

## 🛠️ Công nghệ sử dụng (Tech Stack)
- **Framework:** Vue.js
- **Call API:** Axios
- **Biểu đồ:** Chart.js
- **UI/UX:** Bootstrap / CSS3

## ⚙️ Hướng dẫn chạy dự án (Setup)
Để chạy dự án này trên máy cá nhân, vui lòng thực hiện các lệnh sau trong Terminal:

```bash
# 1. Cài đặt các thư viện cần thiết
npm install

# 2. Khởi chạy server môi trường dev (Mặc định ở Localhost:8080)
npm run serve
