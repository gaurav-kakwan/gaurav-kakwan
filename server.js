const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// --- SINGLE LOGIN LOGIC ---
let isOccupied = false;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "gaurav" && password === "kakwan") {
        if (isOccupied) return res.json({ success: false, msg: "User Limit Reached!" });
        isOccupied = true;
        return res.json({ success: true });
    }
    return res.json({ success: false, msg: "Invalid Credentials" });
});

app.post('/logout', (req, res) => {
    isOccupied = false;
    res.json({ success: true });
});

// --- EMAIL SEND API (INDIVIDUAL) ---
app.post('/send', async (req, res) => {
    const { senderName, gmail, apppass, subject, message, to } = req.body;

    if (!gmail || !apppass || !to) {
        return res.json({ success: false, msg: "Please fill all required fields." });
    }

    const recipients = to.split(/[,\n]/).map(e => e.trim()).filter(e => e);
    if (recipients.length > 25) return res.json({ success: false, msg: "Limit: Max 25 emails." });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmail, pass: apppass }
    });

    let sentCount = 0;

    // Ek ek karke bhejo
    for (const email of recipients) {
        try {
            await transporter.sendMail({
                from: `"${senderName}" <${gmail}>`,
                to: email, // Sirf ek receiver
                subject: subject,
                text: message
            });
            sentCount++;
        } catch (e) {
            console.log("Error sending to: " + email);
        }
    }

    res.json({ success: true, sent: sentCount });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
