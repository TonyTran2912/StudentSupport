import express from "express";
import multer from "multer";
import path from "path";
import Message from "../models/Message.js";

const router = express.Router();
// CẤU HÌNH MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Gửi tin nhắn
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    let attachmentPath = "";

    if (req.file) {
      attachmentPath = `/uploads/${req.file.filename}`;
    }

    // Nếu không có chữ cũng không có file thì lỗi
    if (!text && !attachmentPath) {
      return res.status(400).json({ message: "Tin nhắn rỗng" });
    }

    const msg = new Message({
      sender,
      receiver,
      text: text || "",
      attachment: attachmentPath,
    });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi gửi tin nhắn" });
  }
});

// Lấy lịch sử tin nhắn giữa 2 người
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ time: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy tin nhắn" });
  }
});

export default router;
