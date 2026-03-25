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
        if (isOccupied) {
            return res.json({ success: false, msg: "User Limit Reached! Another user is already logged in." });
        }
        isOccupied = true;
        return res.json({ success: true });
    } else {
        return res.json({ success: false, msg: "Invalid Username or Password" });
    }
});

app.post('/logout', (req, res) => {
    isOccupied = false;
    res.json({ success: true });
});

// Email Send API
app.post('/send', async (req, res) => {
    const { senderName, gmail, apppass, subject, message, to } = req.body;

    if (!gmail || !apppass || !to) {
        return res.json({ success: false, msg: "Please fill all required fields." });
    }

    const recipients = to.split(/[,\n]/).map(e => e.trim()).filter(e => e);

    if (recipients.length > 25) {
        return res.json({ success: false, msg: "Limit Error: Max 25 recipients allowed." });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmail, pass: apppass }
    });

    const mailOptions = {
        from: `"${senderName}" <${gmail}>`,
        to: recipients,
        subject: subject,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, sent: recipients.length });
    } catch (error) {
        console.error(error);
        res.json({ success: false, msg: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
