import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import createDefaultAdmin from "./seedAdmin.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mở cửa thư mục Uploads (Để xem ảnh)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// KẾT NỐI FRONTEND (QUAN TRỌNG NHẤT)
// Trỏ ra ngoài thư mục backend để lấy file html trong frontend
app.use(express.static(path.join(__dirname, "../frontend")));

connectDB().then(() => {
  createDefaultAdmin();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/content", contentRoutes);

// FALLBACK: Mọi link lạ đều trả về index.html (Trang chủ)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
