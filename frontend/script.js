// Hàm bật Loading (Dùng khi gọi API hoặc chuyển trang)
function showLoading() {
  const overlay = document.getElementById("PageTransitionOverlay");
  if (overlay) overlay.classList.add("is-active");
}

// Hàm tắt Loading (Dùng khi API trả về kết quả)
function hideLoading() {
  const overlay = document.getElementById("PageTransitionOverlay");
  if (overlay) {
    // Delay nhẹ 500ms để người dùng kịp nhìn thấy hiệu ứng (tránh chớp tắt quá nhanh)
    setTimeout(() => {
      overlay.classList.remove("is-active");
    }, 500);
  }
}

// Thiết lập tự động Loading khi bấm Link chuyển trang
function setupPageTransitions() {
  // Chỉ target các link nội bộ (có đuôi .html) và nút trong menu
  const internalLinks = document.querySelectorAll(
    'a[href$=".html"], .sidenav a'
  );

  internalLinks.forEach((link) => {
    // Tránh gắn sự kiện trùng lặp
    if (link.dataset.transitionSetup) return;
    link.dataset.transitionSetup = "true";

    link.addEventListener("click", function (e) {
      const targetUrl = this.href;

      // Kiểm tra logic: Phải là link thật, không phải #, không phải trang hiện tại
      if (
        targetUrl &&
        targetUrl !== "javascript:void(0)" &&
        !targetUrl.includes("#") &&
        !targetUrl.includes(window.location.pathname.split("/").pop())
      ) {
        e.preventDefault(); // Chặn chuyển trang ngay lập tức

        showLoading(); // Bật loading lên

        // Chờ 500ms cho đẹp rồi mới chuyển trang thật
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 500);
      }
    });
  });
}

// LOGIC CHÍNH (CHẠY KHI WEB TẢI XONG)

document.addEventListener("DOMContentLoaded", () => {
  hideLoading();
  // Khởi chạy hiệu ứng chuyển trang
  setupPageTransitions();

  // Lấy thông tin chung từ LocalStorage
  const username = localStorage.getItem("username");
  const roleDisplayValue = localStorage.getItem("roleDisplay");
  const token = localStorage.getItem("token");

  // XỬ LÝ MENU TRƯỢT

  const openBtn = document.getElementById("OpenNavBtn");
  const closeBtn = document.getElementById("CloseNavBtn");
  const sideNav = document.getElementById("MySideNav");

  if (openBtn) {
    openBtn.addEventListener("click", () => (sideNav.style.width = "260px"));
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => (sideNav.style.width = "0"));
  }
  // Click ra ngoài để đóng menu
  document.addEventListener("click", (e) => {
    if (sideNav && openBtn && sideNav.style.width === "260px") {
      if (!sideNav.contains(e.target) && !openBtn.contains(e.target)) {
        sideNav.style.width = "0";
      }
    }
  });

  // HIỂN THỊ USER & KIỂM TRA ĐĂNG NHẬP

  const navUser = document.getElementById("SideNavUsername");
  const navRole = document.getElementById("SideNavRole");
  const headerUser = document.getElementById("UsernameDisplay");

  if (username && token) {
    if (navUser) navUser.textContent = username;
    if (navRole) navRole.textContent = roleDisplayValue || "Sinh viên";
    if (headerUser) headerUser.textContent = username;
  } else {
    // Bảo vệ trang nội bộ (nếu không phải trang login/register thì đá về login)
    const currentPage = window.location.pathname.split("/").pop();
    if (
      currentPage &&
      currentPage !== "index.html" &&
      currentPage !== "register.html"
    ) {
      window.location.href = "index.html";
    }
  }

  // ĐĂNG XUẤT & XÓA TÀI KHOẢN

  const sideLogout = document.getElementById("SideNavLogout");
  if (sideLogout) {
    sideLogout.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear(); // Xóa sạch session
      window.location.href = "index.html";
    });
  }

  const sideDelete = document.getElementById("SideNavDelete");
  if (sideDelete) {
    sideDelete.addEventListener("click", async (e) => {
      e.preventDefault();
      const u = localStorage.getItem("username");
      const r = localStorage.getItem("role");

      if (u === "admin") return alert("⚠️ Không thể xóa Admin!");

      if (confirm("⚠️ CẢNH BÁO: Bạn có chắc muốn xóa tài khoản vĩnh viễn?")) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/auth/delete/${u}?role=${r}&requester=${u}`,
            { method: "DELETE" }
          );
          const data = await res.json();
          if (res.ok) {
            alert("✅ " + data.message);
            localStorage.clear();
            window.location.href = "index.html";
          } else {
            alert("❌ " + data.message);
          }
        } catch (err) {
          alert("⚠️ Lỗi kết nối Server Backend!");
        }
      }
    });
  }

  // TÍNH NĂNG ĐỔI MẬT KHẨU

  const changePassBtn = document.getElementById("SideNavChangePass");
  const changePassModal = document.getElementById("ChangePassModal");
  const closeChangePass = document.querySelector(".close-modal");
  const changePassForm = document.getElementById("ChangePassForm");

  // Mở Modal
  if (changePassBtn && changePassModal) {
    changePassBtn.addEventListener("click", (e) => {
      e.preventDefault();
      changePassModal.style.display = "block";
      if (sideNav) sideNav.style.width = "0"; // Đóng menu
    });
  }

  // Đóng Modal (nút X)
  if (closeChangePass && changePassModal) {
    closeChangePass.addEventListener("click", () => {
      changePassModal.style.display = "none";
    });
  }

  // Đóng Modal (click ra ngoài)
  window.addEventListener("click", (e) => {
    if (e.target == changePassModal) {
      changePassModal.style.display = "none";
    }
  });

  // Xử lý Submit Form Đổi mật khẩu
  if (changePassForm) {
    changePassForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const oldPassword = document.getElementById("OldPass").value.trim();
      const newPassword = document.getElementById("NewPass").value.trim();

      try {
        const res = await fetch(
          "http://localhost:5000/api/auth/change-password",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, oldPassword, newPassword }),
          }
        );

        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          changePassModal.style.display = "none";
          changePassForm.reset();
        } else {
          alert("❌ " + data.message);
        }
      } catch (err) {
        alert("⚠️ Lỗi kết nối Server!");
      }
    });
  }

  // XỬ LÝ FORM ĐĂNG NHẬP

  const loginForm = document.getElementById("LoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById("username").value.trim();
      const passwordInput = document.getElementById("password").value.trim();
      const msg = document.getElementById("LoginMessage");

      showLoading();

      msg.textContent = "⏳ Đang kết nối...";
      msg.style.color = "gray";

      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: usernameInput,
            password: passwordInput,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          msg.textContent = "✅ Thành công!";
          msg.style.color = "green";
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("role", data.user.role);
          localStorage.setItem(
            "roleDisplay",
            data.user.role === "admin" ? "👑 Admin" : "Sinh viên"
          );
          setTimeout(() => (window.location.href = "main.html"), 1000);
        } else {
          hideLoading();

          msg.textContent = "❌ " + (data.message || "Lỗi đăng nhập");
          msg.style.color = "red";
        }
      } catch (err) {
        hideLoading();

        msg.textContent = "⚠️ Lỗi Server (Backend chưa chạy?)";
        msg.style.color = "red";
      }
    });
  }

  // TIỆN ÍCH (ẨN/HIỆN MẬT KHẨU)

  document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        toggle.textContent = "🔒";
        toggle.style.color = "#dc3545";
      } else {
        input.type = "password";
        toggle.textContent = "👁";
        toggle.style.color = "#666";
      }
    });
  });
});
