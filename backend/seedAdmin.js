import User from "./models/User.js";
import bcrypt from "bcryptjs";

const createDefaultAdmin = async () => {
  try {
    const existing = await User.findOne({ username: "admin" });
    if (!existing) {
      const hashed = await bcrypt.hash("123456", 10);
      await User.create({
        username: "admin",
        password: hashed,
        role: "admin",
      });
      console.log("✅ Tạo admin mặc định: admin / 123456");
    } else {
      console.log("👑 Admin mặc định đã tồn tại");
    }
  } catch (err) {
    console.error("❌ Lỗi tạo admin mặc định:", err.message);
  }
};

export default createDefaultAdmin;
