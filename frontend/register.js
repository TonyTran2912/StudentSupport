document
  .getElementById("RegisterForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    //  Lấy giá trị ô xác nhận
    const confirmPassword = document
      .getElementById("confirm-password")
      .value.trim();

    const msg = document.getElementById("RegisterMessage");
    const overlay = document.getElementById("PageTransitionOverlay");

    // --- PHẦN KIỂM TRA ---

    // Kiểm tra độ dài
    if (password.length < 6) {
      msg.textContent = "⚠️ Mật khẩu quá ngắn! Phải từ 6 ký tự trở lên.";
      msg.style.color = "red";
      return; // Dừng lại, không gửi lên server
    }

    // Kiểm tra khớp mật khẩu
    if (password !== confirmPassword) {
      msg.textContent = "⚠️ Mật khẩu xác nhận không khớp!";
      msg.style.color = "red";
      return; // Dừng lại
    }

    // --- NẾU ỔN THÌ GỬI LÊN SERVER ---

    if (overlay) overlay.classList.add("is-active");

    msg.textContent = "⏳ Đang kết nối server...";
    msg.style.color = "gray";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: "student" }),
      });

      const data = await res.json();

      if (res.ok) {
        msg.textContent = "✅ Đăng ký thành công! Đang chuyển hướng...";
        msg.style.color = "green";
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } else {
        if (overlay) overlay.classList.remove("is-active");
        msg.textContent = "❌ " + (data.message || "Lỗi đăng ký");
        msg.style.color = "red";
      }
    } catch (err) {
      if (overlay) overlay.classList.remove("is-active");
      console.error(err);
      msg.textContent = "⚠️ Lỗi: Không kết nối được Server";
      msg.style.color = "red";
    }
  });
