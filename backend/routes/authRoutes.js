import Message from "../models/Message.js";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Thiếu username hoặc password" });

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role });
    await user.save();

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Thiếu username hoặc password" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Sai tài khoản" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Xem tất cả người dùng (chỉ dùng thử, không an toàn cho production)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}); // loại bỏ mật khẩu
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Xóa tài khoản
router.delete("/delete/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const requesterRole = req.query.role;
    const requesterUsername = req.query.requester;

    if (username === "admin") {
      return res
        .status(403)
        .json({ message: "Không thể xóa tài khoản admin mặc định!" });
    }

    if (requesterRole !== "admin" && requesterUsername !== username) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa tài khoản này" });
    }

    const deleted = await User.findOneAndDelete({ username });
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    await Message.deleteMany({
      $or: [{ sender: username }, { receiver: username }],
    });

    res.json({ message: `Đã xóa tài khoản ${username}` });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// API Reset mật khẩu (Dành cho Admin)
router.put("/reset-password/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Tìm user
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Mã hóa mật khẩu mặc định
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Cập nhật vào DB
    user.password = hashedPassword;
    await user.save();

    res.json({ message: `Đã reset mật khẩu của ${username} về 123456` });
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server", error: err.message });
  }
});

// API Đổi mật khẩu (User tự đổi)
router.put("/change-password", async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
    }

    // Tìm user trong DB
    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "Tài khoản không tồn tại" });

    // Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác!" });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Lưu vào DB
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "✅ Đổi mật khẩu thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server", error: err.message });
  }
});

export default router;
