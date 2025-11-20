import express from "express";
import multer from "multer";
import path from "path";
import Notice from "../models/Notice.js";
import Document from "../models/Document.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Lưu vào thư mục uploads
  },
  filename: (req, file, cb) => {
    // Đặt tên file = thời gian hiện tại + tên gốc (để tránh trùng)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
// === PHẦN THÔNG BÁO (NOTICES) ===

// Lấy danh sách thông báo
router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1 }); // Mới nhất lên đầu
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm thông báo mới
router.post("/notices", upload.single("file"), async (req, res) => {
  try {
    const { title, content } = req.body;
    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    const newNotice = new Notice({ title, content, image: imagePath });
    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa thông báo
router.delete("/notices/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa thông báo" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === PHẦN TÀI LIỆU (DOCUMENTS) ===

// Lấy danh sách tài liệu
router.get("/documents", async (req, res) => {
  try {
    const docs = await Document.find().sort({ date: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm tài liệu mới
router.post("/documents", upload.single("file"), async (req, res) => {
  try {
    // Multer đã xử lý file xong, thông tin file nằm trong req.file
    const { title, author } = req.body;

    let fileLink = "";

    if (req.file) {
      // Tạo đường dẫn đầy đủ để frontend truy cập
      fileLink = `/uploads/${req.file.filename}`;
    } else {
      // Fallback: Nếu user không up file mà gửi link text (dự phòng)
      fileLink = req.body.link || "";
    }

    const newDoc = new Document({
      title,
      link: fileLink, // Lưu đường dẫn file vào DB
      author,
    });

    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa tài liệu
router.delete("/documents/:id", async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa tài liệu" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Gửi bình luận vào tài liệu
router.post("/documents/:id/comment", async (req, res) => {
  try {
    const { user, text } = req.body;
    const doc = await Document.findById(req.params.id);

    if (!doc)
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });

    // Đẩy bình luận vào mảng comments
    doc.comments.push({ user, text });
    await doc.save();

    res.json(doc); // Trả về document mới nhất đã có comment
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Gửi đánh giá (Rating)
router.post("/documents/:id/rating", async (req, res) => {
  try {
    const { user, value } = req.body;
    const doc = await Document.findById(req.params.id);

    if (!doc)
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });

    // Kiểm tra xem user này đã đánh giá chưa
    const existingIndex = doc.ratings.findIndex((r) => r.user === user);

    if (existingIndex !== -1) {
      // Nếu đánh giá rồi -> Cập nhật lại điểm số cũ
      doc.ratings[existingIndex].value = value;
    } else {
      // Nếu chưa -> Thêm đánh giá mới
      doc.ratings.push({ user, value });
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
