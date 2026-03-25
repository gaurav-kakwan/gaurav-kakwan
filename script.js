// Security Check: Agar login nahi hai to wapas bhejo
if (!sessionStorage.getItem("auth")) {
  location.href = "/login.html";
}

let sending = false;

const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const senderName = document.getElementById("senderName");
const gmail = document.getElementById("gmail");
const apppass = document.getElementById("apppass");
const subject = document.getElementById("subject");
const message = document.getElementById("message");
const to = document.getElementById("to");

// Send Button Logic
sendBtn.onclick = () => { if (!sending) sendMail(); };

// Logout Button Logic (Double Click)
logoutBtn.ondblclick = () => {
  if (!sending) {
    sessionStorage.clear();
    location.href = "/login.html";
  }
};

async function sendMail() {
  sending = true;
  sendBtn.disabled = true;
  sendBtn.innerText = "Sending…";

  try {
    const res = await fetch("/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderName: senderName.value.trim(),
        gmail: gmail.value.trim(),
        apppass: apppass.value.trim(),
        subject: subject.value.trim(),
        message: message.value.trim(),
        to: to.value.trim()
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.msg || "Sending failed ❌");
      return;
    }

    alert(`Success ✅\nEmails Sent: ${data.sent}`);

  } catch (err) {
    alert("Server error ❌");
  } finally {
    sending = false;
    sendBtn.disabled = false;
    sendBtn.innerText = "Send All";
  }
}