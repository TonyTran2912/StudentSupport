document.addEventListener("DOMContentLoaded", function () {
  const role = localStorage.getItem("role");
  const noticeList = document.getElementById("NoticeList");
  const adminForm = document.getElementById("AdminNoticeForm");

  const API_URL = "http://localhost:5000/api/content/notices";

  // Hiển thị Form Admin nếu là Admin
  if (role === "admin" && adminForm) {
    adminForm.style.display = "block";
  } else if (adminForm) {
    adminForm.style.display = "none";
  }

  // Hàm lấy dữ liệu từ Server
  async function fetchNotices() {
    noticeList.innerHTML = "<p>⏳ Đang tải dữ liệu...</p>";
    try {
      const res = await fetch(API_URL);
      const notices = await res.json();
      renderNotices(notices);
    } catch (err) {
      noticeList.innerHTML = "<p style='color:red'>❌ Lỗi kết nối Server!</p>";
    }
  }

  // Hàm Render ra màn hình
  function renderNotices(notices) {
    noticeList.innerHTML = "";
    if (notices.length === 0) {
      noticeList.innerHTML = "<p>Hiện chưa có thông báo nào.</p>";
      return;
    }

    notices.forEach((n) => {
      const div = document.createElement("div");
      div.classList.add("notice-item");

      // Format ngày tháng đẹp
      const dateStr = new Date(n.date).toLocaleString("vi-VN");

      let deleteBtnHtml = "";
      if (role === "admin") {
        deleteBtnHtml = `<button class="delete-btn" data-id="${n._id}">🗑️ Xóa</button>`;
      }
      let imageHtml = "";
      if (n.image) {
        imageHtml = `<img src="${n.image}" style="max-width:100%; height:auto; margin-top:10px; border-radius:6px;">`;
      }
      div.innerHTML = `
        <div class="notice-content-wrapper"> <h4>📢 ${n.title}</h4>
          <p>${n.content}</p>
          <small>🕒 ${dateStr}</small>
        </div>
        ${deleteBtnHtml}
      `;

      // Gắn sự kiện xóa
      if (role === "admin") {
        div.querySelector(".delete-btn").addEventListener("click", async () => {
          if (confirm("Bạn chắc chắn muốn xóa?")) {
            await deleteNotice(n._id);
          }
        });
      }

      noticeList.appendChild(div);
    });
  }

  // Hàm Xóa
  async function deleteNotice(id) {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchNotices(); // Tải lại danh sách
    } catch (err) {
      alert("Lỗi khi xóa!");
    }
  }

  // Hàm Thêm mới (Submit Form)
  const addForm = document.getElementById("AddNoticeForm");
  if (addForm) {
    addForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const title = document.getElementById("NoticeTitle").value.trim();
      const content = document.getElementById("NoticeContent").value.trim();
      const fileInput = document.getElementById("NoticeFile");

      if (!title || !content) return;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (fileInput.files[0]) {
        formData.append("file", fileInput.files[0]);
      }

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          alert("✅ Đã đăng thông báo!");
          addForm.reset();
          fetchNotices();
        } else {
          alert("❌ Lỗi khi đăng bài");
        }
      } catch (err) {
        alert("❌ Lỗi Server");
      }
    });
  }

  // Chạy lần đầu
  fetchNotices();
});
