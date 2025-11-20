# 🎓 Student Care Portal - Hệ thống Hỗ trợ Sinh viên

Trần Ngọc Đức - N24DCCN017

## 🌐 Live Demo (Dùng thử ngay)

Dự án đã được deploy trực tuyến tại Render. Server được tối ưu để phản hồi nhanh chóng.
👉 **Link Web:** [https://studentsupport-glo4.onrender.com/]

## 📖 Giới thiệu

**Student Care Portal** là ứng dụng web giúp kết nối Sinh viên và Nhà trường. Hệ thống cung cấp công cụ quản trị trực quan, kho tài liệu học tập thông minh và kênh hỗ trợ trực tuyến thời gian thực.

## 🚀 Tính năng nổi bật (Highlights)

1.  **📊 Dashboard Quản trị (Admin):**

    - Thống kê tổng quan hệ thống.
    - Biểu đồ động (Visual Charts) phân tích dữ liệu người dùng và tài liệu.

2.  **📂 Kho Tài liệu & Thông báo:**

    - **Upload File vật lý:** Hỗ trợ tải file ảnh, PDF, Video, Word... lưu trữ trực tiếp trên Server.
    - **Smart Preview:** Tự động nhận diện và cho phép xem trước video Youtube, file PDF, Video MP4 ngay trên trình duyệt mà không cần tải về.
    - Tương tác: Đánh giá (Rating 5 sao) và Bình luận.

3.  **💬 Hỗ trợ trực tuyến (Live Chat):**

    - Chat 1-1 giữa Sinh viên và Admin.
    - Gửi tin nhắn kèm tệp đính kèm (Ảnh/Video/File).

4.  **🔐 Hệ thống Tài khoản & Bảo mật:**

    - Phân quyền Admin / Sinh viên.
    - Mã hóa mật khẩu (Bcrypt), Đăng nhập/Đăng ký an toàn.
    - Tính năng Đổi mật khẩu & Reset mật khẩu (cho Admin).

5.  **✨ Trải nghiệm người dùng (UX):**
    - Giao diện Responsive (Mobile/Desktop).
    - Hiệu ứng Loading chuyển trang mượt mà.

---

## ⚠️ Lưu ý quan trọng (Về dữ liệu File/Ảnh)

> ⚠️ **LƯU Ý VỀ DỮ LIỆU (FILE/ẢNH):**
> Do sử dụng gói **Render Free Tier** (Ephemeral Storage), dữ liệu hình ảnh/tài liệu upload sẽ **tự động bị xóa** khi server khởi động lại hoặc bảo trì (định kỳ).
> * **Hiện tượng:** Ảnh cũ có thể bị lỗi hiển thị.
> * **Giải pháp:** Vui lòng **thử upload ảnh/tài liệu mới**. Tính năng sẽ hoạt động bình thường ngay lập tức!

---

## ⚙️ Hướng dẫn Cài đặt & Chạy

### Yêu cầu

- Đã cài đặt **Node.js**.
- Nếu chưa có cần cài đặt [Node.js](https://nodejs.org/) trước.

### Bước 1: Khởi động Backend (Server)

1.  di chuyển đến hoặc mở thư mục tại `backend`.
    ```bash
    cd backend
    ```
2.  Cài đặt thư viện:
    ```bash
    npm install
    ```
3.  Chạy Server:
    ```bash
    npm run dev
    ```
    
### Bước 2: Chạy Frontend (Giao diện)

1.  Vào thư mục `frontend`.
2.  Mở file `index.html` trực tiếp bằng trình duyệt (Chrome/Edge).
    - _(Khuyên dùng Extension "Live Server" trên VS Code để có trải nghiệm tốt nhất)._

---

## 🔐 Tài khoản Demo

Hệ thống đã có sẵn dữ liệu mẫu để trải nghiệm ngay:

| Vai trò                | Username         | Password |
| :--------------------- | :--------------- | :------- |
| **Admin** (Toàn quyền) | `admin`          | `123456` |
| **Sinh viên**          | `có thể tạo mới` | `tùy ý`  |

---

## 🛠️ Tech Stack (Công nghệ)

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+), Chart.js.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (Cloud).
- **Libraries:** Mongoose, Multer (Upload), BcryptJS, Cors, Dotenv.
