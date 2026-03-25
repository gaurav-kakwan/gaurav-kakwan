// Security Check
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

// --- NAYA FEATURE: DATA LOAD KARNA ---
// Jab page khole toh pehle se saved data aa jaye
window.onload = function() {
    senderName.value = localStorage.getItem('save_senderName') || '';
    gmail.value = localStorage.getItem('save_gmail') || '';
    apppass.value = localStorage.getItem('save_apppass') || '';
    subject.value = localStorage.getItem('save_subject') || '';
    message.value = localStorage.getItem('save_message') || '';
    to.value = localStorage.getItem('save_to') || '';
};

// --- NAYA FEATURE: DATA SAVE KARNA ---
// Jab user kisi bhi box se bahar click kare (blur), data save ho jaye
function saveData() {
    localStorage.setItem('save_senderName', senderName.value);
    localStorage.setItem('save_gmail', gmail.value);
    localStorage.setItem('save_apppass', apppass.value);
    localStorage.setItem('save_subject', subject.value);
    localStorage.setItem('save_message', message.value);
    localStorage.setItem('save_to', to.value);
}

// Sab inputs par save function lagao
[senderName, gmail, apppass, subject, message, to].forEach(input => {
    input.addEventListener('blur', saveData);
});

// --- BUTTON LOGIC ---

sendBtn.onclick = () => { if (!sending) sendMail(); };

// Logout Logic
logoutBtn.ondblclick = async () => {
  if (!sending) {
    try {
        await fetch("/logout", { method: "POST" });
    } catch(e){ console.log(e); }
    
    // Note: Logout par Data Clear Nahi hoga, taki next time use kar sako
    // Agar data clear karna chahte ho toh niche wali line ka comment hatao:
    // localStorage.clear(); 
    
    sessionStorage.clear();
    location.href = "/login.html";
  }
};

// --- EMAIL SEND LOGIC ---

async function sendMail() {
  const recipientsList = to.value.split(/[,\n]/).map(e => e.trim()).filter(e => e);
  
  if (recipientsList.length > 25) {
    alert("Error: Maximum 25 recipients allowed.");
    return;
  }

  sending = true;
  sendBtn.disabled = true;
  sendBtn.innerText = "Sending…";

  // Save data before sending just in case
  saveData();

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
