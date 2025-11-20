# 🎓 Student Care Portal - Hệ thống Hỗ trợ Sinh viên

N24DCCN017 - Trần Ngọc Đức

Đây là dự án web application giúp kết nối Sinh viên và Nhà trường, hỗ trợ tra cứu tài liệu, xem thông báo và chat trực tuyến với Admin.

## 🚀 Tính năng nổi bật

- **Dashboard Quản trị:** Thống kê số liệu trực quan với biểu đồ (Chart.js).
- **Hệ thống Tài khoản:** Đăng ký, Đăng nhập, Đổi mật khẩu, Phân quyền (Admin/Student).
- **Kho Tài liệu thông minh:**
  - Upload file vật lý (Ảnh, PDF, Video...) lưu trữ trực tiếp trên Server.
  - **Smart Preview:** Xem trước video Youtube, file PDF, Video MP4 ngay trên web.
  - Đánh giá (Rating) và Bình luận tài liệu.
- **Live Chat Support:**
  - Chat 1-1 giữa Sinh viên và Admin.
  - Gửi tin nhắn kèm tệp đính kèm đa phương tiện.
- **Trải nghiệm người dùng (UX):** Giao diện Responsive, hiệu ứng Loading mượt mà.

## 🛠️ Công nghệ sử dụng

- **Frontend:** HTML5, CSS3, Vanilla JavaScript.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Cloud Atlas).
- **Libraries:** Mongoose, Multer (Upload file), BCrypt (Hash pass), Chart.js.

---

## ⚙️ Hướng dẫn Cài đặt & Chạy dự án

Để chạy dự án này trên máy của bạn, vui lòng làm theo các bước sau:

### 1. Cài đặt Backend (Server)

Cần cài đặt [Node.js](https://nodejs.org/) trước.

```bash
# clone repo
git clone

# Di chuyển vào thư mục backend
cd backend

# Cài đặt các thư viện cần thiết (như trong package.json)
npm install

# Khởi động Server
npm run dev
```
