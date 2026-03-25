const express = require("express");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

let isOccupied = false;

// ===== Gmail API Credentials =====
const CLIENT_ID = "PASTE_CLIENT_ID";
const CLIENT_SECRET = "PASTE_CLIENT_SECRET";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

// ===== LOGIN =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "gaurav" && password === "kakwan") {
    if (isOccupied) {
      return res.json({ success: false, msg: "User Limit Reached" });
    }

    isOccupied = true;
    return res.json({ success: true });
  }

  res.json({ success: false, msg: "Invalid Login" });
});

app.post("/logout", (req, res) => {
  isOccupied = false;
  res.json({ success: true });
});

// ===== SEND MAIL =====
app.post("/send", async (req, res) => {
  const { senderName, gmail, apppass, subject, message, to } = req.body;

  if (!gmail || !apppass || !to) {
    return res.json({ success: false, msg: "Missing fields" });
  }

  const recipients = to
    .split(/[\n,]/)
    .map(e => e.trim())
    .filter(e => e);

  if (recipients.length > 25) {
    return res.json({ success: false, msg: "Max 25 recipients allowed" });
  }

  try {

    const REFRESH_TOKEN = apppass;

    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    oAuth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN
    });

    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: gmail,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });

    let sent = 0;

    for (const email of recipients) {

      await transporter.sendMail({
        from: `"${senderName}" <${gmail}>`,
        to: email,
        subject: subject,
        text: message
      });

      sent++;

      await new Promise(r => setTimeout(r, 1000));
    }

    res.json({
      success: true,
      sent: sent
    });

  } catch (error) {

    console.log("MAIL ERROR:", error);

    res.json({
      success: false,
      msg: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
