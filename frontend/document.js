document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const docList = document.getElementById("DocumentList");
  const adminForm = document.getElementById("AdminDocumentForm");
  const addForm = document.getElementById("AddDocumentForm");
  const searchInput = document.getElementById("SearchInput");

  const API_URL = "http://localhost:5000/api/content/documents";
  let allDocs = [];

  // --- HIỂN THỊ ---
  if (username && adminForm) {
    adminForm.style.display = "block";
  } else if (adminForm) {
    adminForm.style.display = "none";
  }

  // --- FETCH DỮ LIỆU ---
  async function fetchDocuments() {
    // Không hiện loading text để tránh giật lag khi reload sau khi comment
    try {
      const res = await fetch(API_URL);
      allDocs = await res.json();
      renderDocuments(allDocs);
    } catch (err) {
      docList.innerHTML = "<p style='color:red'>❌ Lỗi kết nối Server!</p>";
    }
  }

  // --- HÀM HỖ TRỢ NHẬN DIỆN LOẠI LINK ---
  function getPreviewHTML(link) {
    // 1. Google Drive
    const driveRegex =
      /(?:drive\.google\.com\/(?:.*\/folders\/|file\/d\/|open\?id=)|drive\.google\.com\/uc\?id=)([a-zA-Z0-9_-]+)/;
    const driveMatch = link.match(driveRegex);
    if (driveMatch) {
      return `
        <div style="margin-top:10px; border:1px solid #ddd; border-radius:4px; overflow:hidden; position:relative; padding-bottom:56.25%; height:0;">
             <iframe src="https://drive.google.com/file/d/${driveMatch[1]}/preview" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="autoplay"></iframe>
        </div>`;
    }

    // 2. Ảnh (JPG, PNG, GIF...)
    if (
      link.match(/\.(jpeg|jpg|gif|png|webp)$/i) ||
      link.includes("imgur.com") ||
      link.includes("ibb.co")
    ) {
      return `
        <div style="margin-top:10px; text-align:center;">
            <img src="${link}" alt="Preview" style="max-width:100%; max-height:300px; border-radius:6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        </div>`;
    }

    // 3. YouTube (Đã nâng cấp Regex để bắt cả Link thường & Shorts)
    // Regex này bắt được: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = link.match(youtubeRegex);
    if (ytMatch) {
      return `
        <div style="margin-top:10px; position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:6px;">
            <iframe 
                style="position:absolute; top:0; left:0; width:100%; height:100%;" 
                src="https://www.youtube.com/embed/${ytMatch[1]}?rel=0" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>
        </div>`;
    }

    // 4. Mặc định
    return `<div style="margin-top:10px; background:#f0f0f0; padding:10px; border-radius:4px; font-size:0.9em; color:#555;">
        📎 Link tài liệu ngoài: <a href="${link}" target="_blank" style="color:#004aad;">Mở liên kết</a>
    </div>`;
  }

  // --- RENDER ---
  function renderDocuments(list) {
    docList.innerHTML = "";
    if (list.length === 0) {
      docList.innerHTML =
        "<p style='text-align:center;'>Chưa có tài liệu nào.</p>";
      return;
    }

    // Đảo ngược mảng để tin mới nhất lên đầu
    [...list].reverse().forEach((doc) => {
      const item = document.createElement("div");
      item.classList.add("doc-item");

      // Tính Rating
      const totalVotes = doc.ratings.length;
      const sum = doc.ratings.reduce((s, r) => s + r.value, 0);
      const avg = totalVotes === 0 ? 0 : (sum / totalVotes).toFixed(1);
      const myRating = doc.ratings.find((r) => r.user === username)?.value || 0;

      // Gọi hàm lấy HTML xem trước
      const previewHtml = getPreviewHTML(doc.link);

      // Nút xóa
      let deleteBtnHtml = "";
      if (role === "admin" || doc.author === username) {
        deleteBtnHtml = `<button class="delete-btn" style="margin-left:10px; background:#d9534f; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">🗑️ Xóa</button>`;
      }

      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h4 style="margin:0 0 5px 0; color:#004aad;">${doc.title}</h4>
                <small>👤 ${doc.author} | 🕒 ${new Date(
        doc.date
      ).toLocaleDateString("vi-VN")}</small>
            </div>
            <a href="${
              doc.link
            }" target="_blank" style="color:white; background:#004aad; padding:5px 10px; border-radius:4px; text-decoration:none;">📥 Mở Link</a>
        </div>

        ${previewHtml}

        <div class="rating-wrap" style="margin-top:10px; display:flex; align-items:center; gap:10px;">
            <span style="font-weight:bold; color:#555;">⭐ ${avg} (${totalVotes} lượt)</span>
            <div class="stars">
               ${[1, 2, 3, 4, 5]
                 .map(
                   (val) => `
                  <span data-val="${val}" style="font-size:24px; cursor:pointer; color:${
                     val <= myRating ? "gold" : "#ccc"
                   }">★</span>
               `
                 )
                 .join("")}
            </div>
            ${deleteBtnHtml}
        </div>

        <div class="comment-section-doc" style="margin-top:15px; background:#f7f7f7; padding:10px; border-radius:6px;">
            <h5 style="margin:0 0 10px 0;">💬 Bình luận (${
              doc.comments.length
            })</h5>
            <div class="comment-list-doc" style="max-height:150px; overflow-y:auto; margin-bottom:10px;">
                ${doc.comments
                  .map(
                    (c) => `
                    <div style="border-bottom:1px dashed #ddd; padding:5px 0; font-size:14px;">
                        <strong>${c.user}:</strong> ${c.text} 
                        <small style="color:gray; float:right;">${new Date(
                          c.date
                        ).toLocaleDateString("vi-VN")}</small>
                    </div>
                `
                  )
                  .join("")}
            </div>
            <form class="comment-form-doc" style="display:flex; gap:5px;">
                <input type="text" placeholder="Viết bình luận..." required style="flex:1; padding:5px;">
                <button type="submit" style="background:#004aad; color:white; border:none; padding:5px 15px; cursor:pointer;">Gửi</button>
            </form>
        </div>
      `;

      // --- GẮN SỰ KIỆN  ---
      // 1. Xóa
      const delBtn = item.querySelector(".delete-btn");
      if (delBtn) {
        delBtn.addEventListener("click", async () => {
          if (confirm("Xóa tài liệu này?")) {
            await fetch(
              `http://localhost:5000/api/content/documents/${doc._id}`,
              { method: "DELETE" }
            );
            fetchDocuments();
          }
        });
      }

      // 2. Comment
      const commentForm = item.querySelector(".comment-form-doc");
      commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!username) return alert("Vui lòng đăng nhập!");
        const text = commentForm.querySelector("input").value.trim();
        if (!text) return;
        try {
          await fetch(
            `http://localhost:5000/api/content/documents/${doc._id}/comment`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user: username, text }),
            }
          );
          fetchDocuments();
        } catch (err) {
          console.error(err);
        }
      });

      // 3. Rating
      const stars = item.querySelectorAll(".stars span");
      stars.forEach((star) => {
        star.addEventListener("click", async () => {
          if (!username) return alert("Vui lòng đăng nhập!");
          const value = parseInt(star.getAttribute("data-val"));
          try {
            await fetch(
              `http://localhost:5000/api/content/documents/${doc._id}/rating`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: username, value }),
              }
            );
            fetchDocuments();
          } catch (err) {
            console.error(err);
          }
        });
      });

      docList.appendChild(item);
    });
  }

  // --- ĐĂNG BÀI MỚI ---
  if (addForm) {
    addForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const title = document.getElementById("DocTitle").value.trim();
      const fileInput = document.getElementById("DocFile");
      const file = fileInput.files[0]; // Lấy file user chọn

      if (!title || !file) return alert("Vui lòng nhập tiêu đề và chọn file!");

      // Tạo đối tượng FormData để chứa file
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file); // 'file' phải trùng tên với upload.single('file') ở Backend
      formData.append("author", username || "Ẩn danh");

      try {
        // Lưu ý: Khi gửi FormData, KHÔNG cần set Header 'Content-Type': 'application/json'
        const res = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          addForm.reset();
          alert("✅ Upload tài liệu thành công!");
          fetchDocuments();
        } else {
          alert("❌ Lỗi khi upload!");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Lỗi Server");
      }
    });
  }

  // Search
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const keyword = this.value.toLowerCase().trim();
      const filtered = allDocs.filter((doc) =>
        doc.title.toLowerCase().includes(keyword)
      );
      renderDocuments(filtered);
    });
  }

  // Chạy lần đầu
  fetchDocuments();
});
