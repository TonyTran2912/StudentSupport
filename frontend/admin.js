document.addEventListener("DOMContentLoaded", async () => {
  const role = localStorage.getItem("role");
  const adminSection = document.getElementById("AccountManagementSection");

  // Chỉ Admin mới được thấy và chạy code này
  if (role !== "admin" || !adminSection) {
    if (adminSection) adminSection.style.display = "none";
    return;
  }

  adminSection.style.display = "block";

  // --- LOAD DỮ LIỆU BẢNG USER ---
  const tableBody = document.querySelector("#UserTable tbody");
  let usersData = [];

  try {
    const res = await fetch("/api/auth/all");
    usersData = await res.json();
    renderUserTable(usersData);
  } catch (err) {
    console.error(err);
  }

  // --- VẼ BIỂU ĐỒ  ---
  loadDashboardStats(usersData);

  // TẢI DỮ LIỆU THỐNG KÊ & VẼ BIỂU ĐỒ

  async function loadDashboardStats(users) {
    try {
      // 1. Gọi API lấy số lượng Thông báo & Tài liệu
      const [resNotices, resDocs] = await Promise.all([
        fetch("/api/content/notices"),
        fetch("/api/content/documents"),
      ]);

      const notices = await resNotices.json();
      const docs = await resDocs.json();

      // Cập nhật số liệu text
      document.getElementById("TotalUsers").textContent = users.length;
      document.getElementById("TotalNotices").textContent = notices.length;
      document.getElementById("TotalDocs").textContent = docs.length;

      // Tính toán data cho biểu đồ tròn
      const adminCount = users.filter((u) => u.role === "admin").length;
      const studentCount = users.length - adminCount;

      // VẼ BIỂU ĐỒ CỘT
      const ctx1 = document.getElementById("ActivityChart").getContext("2d");
      new Chart(ctx1, {
        type: "bar",
        data: {
          labels: ["Người dùng", "Thông báo", "Tài liệu"],
          datasets: [
            {
              label: "Số lượng",
              data: [users.length, notices.length, docs.length],
              backgroundColor: [
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
              ],
              borderColor: [
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Tương quan dữ liệu hệ thống" },
          },
        },
      });

      // VẼ BIỂU ĐỒ TRÒN
      const ctx2 = document.getElementById("RoleChart").getContext("2d");
      new Chart(ctx2, {
        type: "doughnut",
        data: {
          labels: ["Admin", "Sinh viên"],
          datasets: [
            {
              data: [adminCount, studentCount],
              backgroundColor: ["#ff6384", "#36a2eb"],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: "Cơ cấu thành viên" },
            legend: { position: "bottom" },
          },
        },
      });
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    }
  }

  // RENDER BẢNG USER

  function renderUserTable(users) {
    tableBody.innerHTML = "";
    if (users.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="5" style="text-align: center;">Chưa có user.</td></tr>';
      return;
    }

    users.forEach((user, index) => {
      const row = tableBody.insertRow();
      row.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#fff";

      row.insertCell().textContent = index + 1;
      row.insertCell().textContent = user.username;
      row.insertCell().textContent =
        user.role === "admin" ? "👑 Admin" : "Student";

      // Reset Password Button
      const resetCell = row.insertCell();
      if (user.username !== "admin") {
        const resetBtn = document.createElement("button");
        resetBtn.textContent = "🔄 Reset";
        resetBtn.style.cssText =
          "background:#ffc107; color:black; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;";

        resetBtn.onclick = async () => {
          if (confirm(`Reset pass của ${user.username} về 123456?`)) {
            try {
              const r = await fetch(
                `/api/auth/reset-password/${user.username}`,
                { method: "PUT" }
              );
              const d = await r.json();
              alert(d.message);
            } catch (e) {
              alert("Lỗi!");
            }
          }
        };
        resetCell.appendChild(resetBtn);
      } else {
        resetCell.textContent = "-";
      }

      // Delete Button
      const actionCell = row.insertCell();
      if (user.username !== "admin") {
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️ Xóa";
        delBtn.style.cssText =
          "background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;";

        delBtn.onclick = () => handleDeleteUser(user.username);
        actionCell.appendChild(delBtn);
      } else {
        actionCell.textContent = "-";
      }
    });
  }

  async function handleDeleteUser(usernameToDelete) {
    if (!confirm(`Xóa ${usernameToDelete}?`)) return;
    try {
      const res = await fetch(
        `/api/auth/delete/${usernameToDelete}?role=${role}&requester=${localStorage.getItem(
          "username"
        )}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        alert("Đã xóa!");
        location.reload();
      } else alert("Lỗi xóa!");
    } catch (err) {
      alert("Lỗi server!");
    }
  }
});
