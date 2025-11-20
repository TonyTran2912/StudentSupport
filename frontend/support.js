document.addEventListener("DOMContentLoaded", async function () {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  if (!username) {
    window.location.href = "index.html";
    return;
  }

  // Khai báo các element
  const userListEl = document.getElementById("UserList");
  const chatMessages = document.getElementById("ChatMessages");
  const chatForm = document.getElementById("ChatForm");
  const chatInput = document.getElementById("ChatInput");
  const chatHeader = document.getElementById("ChatHeader");
  const fileInput = document.getElementById("ChatFile");
  const filePreview = document.getElementById("FileNamePreview");

  let currentChatUser = role === "student" ? "admin" : null;
  let pollingInterval;

  // --- HÀM TẢI TIN NHẮN ---
  async function fetchMessages() {
    if (!currentChatUser) return;
    try {
      const user1 = username;
      const user2 = currentChatUser;
      const res = await fetch(`/api/chat/${user1}/${user2}`);
      const messages = await res.json();
      renderMessages(messages);
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    }
  }

  // --- HÀM BIẾN URL THÀNH LINK ---
  function linkify(text) {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" style="color: #007bff; text-decoration: underline; font-weight: 500;">🔗 Link</a>`;
    });
  }

  // ---  HÀM HIỂN THỊ TIN NHẮN  ---
  function renderMessages(messages) {
    chatMessages.innerHTML = "";

    if (messages.length === 0) {
      chatMessages.innerHTML =
        "<p style='text-align:center; color:gray;'>Bắt đầu cuộc trò chuyện...</p>";
      return;
    }

    messages.forEach((msg) => {
      const div = document.createElement("div");
      const isMe = msg.sender === username;

      div.classList.add("message");
      div.style.alignSelf = isMe ? "flex-end" : "flex-start";
      div.style.textAlign = isMe ? "right" : "left";
      div.style.backgroundColor = isMe ? "#c8e6c9" : "#e1f5fe";
      div.style.maxWidth = "80%";

      const senderName = msg.sender === "admin" ? "👑 Admin" : msg.sender;

      // --- XỬ LÝ FILE ĐÍNH KÈM (ẢNH / VIDEO / PDF) ---
      let attachmentHtml = "";
      if (msg.attachment) {
        const url = msg.attachment;
        const ext = url.split(".").pop().toLowerCase(); // Lấy đuôi file

        // 1. Nếu là ẢNH
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
          attachmentHtml = `
                <div style="margin-top:5px;">
                    <a href="${url}" target="_blank">
                        <img src="${url}" style="max-width:200px; border-radius:8px; cursor:pointer;">
                    </a>
                </div>`;
        }
        // 2. Nếu là VIDEO (mp4, webm...)
        else if (["mp4", "webm", "ogg", "mov"].includes(ext)) {
          attachmentHtml = `
                <div style="margin-top:5px;">
                    <video controls style="max-width:100%; border-radius:8px;">
                        <source src="${url}" type="video/${
            ext === "mov" ? "mp4" : ext
          }">
                        Trình duyệt không hỗ trợ video.
                    </video>
                </div>`;
        }
        // 3. Nếu là PDF (Hiện khung xem trước)
        else if (ext === "pdf") {
          attachmentHtml = `
                <div style="margin-top:5px; height: 300px; width: 100%; min-width:200px; border: 1px solid #ccc; overflow: hidden; border-radius: 8px;">
                    <iframe src="${url}" style="width:100%; height:100%; border:none;"></iframe>
                </div>
                <div style="text-align:right; font-size:0.8em;">
                    <a href="${url}" target="_blank" style="text-decoration:underline;">Mở toàn màn hình ↗</a>
                </div>`;
        }
        // File khác (Word, Excel, Zip...) -> Chỉ hiện link tải
        else {
          attachmentHtml = `
                <div style="margin-top:5px; background: rgba(0,0,0,0.05); padding: 5px 10px; border-radius: 5px; display:inline-block;">
                    <a href="${url}" target="_blank" style="text-decoration:none; color:#0056b3; display:flex; align-items:center; gap:5px;">
                        📄 <span>Tải tệp tin (${ext.toUpperCase()})</span>
                    </a>
                </div>`;
        }
      }

      div.innerHTML = `
        <strong style="font-size: 0.9em; color: ${
          isMe ? "#004aad" : "#d9534f"
        };">
            ${isMe ? "Bạn" : senderName}
        </strong>
        
        <p style="margin: 2px 0; word-break: break-word;">
            ${linkify(msg.text)} 
        </p>
        
        ${attachmentHtml} 
        
        <small style="font-size: 0.7em; color: #666; display: block; margin-top: 2px;">
            ${new Date(msg.time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </small>
      `;
      chatMessages.appendChild(div);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function startPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(fetchMessages, 3000);
  }

  // --- LOGIC ADMIN ---
  if (role === "admin") {
    try {
      const res = await fetch("/api/auth/all");
      const users = await res.json();

      userListEl.innerHTML = "<h4>📋 Chọn sinh viên:</h4>";

      users.forEach((u) => {
        if (u.username !== username) {
          const div = document.createElement("div");
          div.classList.add("user-item");
          div.textContent = `👤 ${u.username}`;

          div.onclick = () => {
            currentChatUser = u.username;
            chatHeader.textContent = `💬 Trò chuyện với: ${u.username}`;
            chatForm.style.display = "flex";

            fetchMessages();
            startPolling();

            document
              .querySelectorAll(".user-item")
              .forEach((el) => (el.style.background = ""));
            div.style.background = "#d0e7ff";
          };
          userListEl.appendChild(div);
        }
      });
    } catch (err) {
      userListEl.innerHTML = "<p>Lỗi: Không tải được danh sách user.</p>";
    }
  } else {
    // Student view
    if (userListEl) userListEl.style.display = "none";
    if (chatHeader)
      chatHeader.textContent = "💬 Hỗ trợ kỹ thuật (Chat với Admin)";
    if (chatForm) chatForm.style.display = "flex";

    fetchMessages();
    startPolling();
  }

  // --- GỬI TIN NHẮN  ---
  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      const file = fileInput ? fileInput.files[0] : null;

      if ((!text && !file) || !currentChatUser) return;

      const formData = new FormData();
      formData.append("sender", username);
      formData.append("receiver", currentChatUser);
      formData.append("text", text);
      if (file) {
        formData.append("file", file);
      }

      try {
        await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });

        chatInput.value = "";
        if (fileInput) fileInput.value = "";
        if (filePreview) filePreview.style.display = "none";

        fetchMessages();
      } catch (err) {
        alert("Lỗi gửi tin nhắn!");
        console.error(err);
      }
    });
  }

  // Preview tên file khi chọn
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        filePreview.textContent = `Đang chọn: ${fileInput.files[0].name}`;
        filePreview.style.display = "block";
      } else {
        filePreview.style.display = "none";
      }
    });
  }
});
