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

// --- EMAIL SEND API (FAST PARALLEL LOGIC) ---
app.post('/send', async (req, res) => {
    const { senderName, gmail, apppass, subject, message, to } = req.body;

    if (!gmail || !apppass || !to) {
        return res.json({ success: false, msg: "Please fill all required fields." });
    }

    const recipients = to.split(/[,\n]/).map(e => e.trim()).filter(e => e);
    if (recipients.length > 25) return res.json({ success: false, msg: "Limit: Max 25 emails." });

    // OPTIMIZED TRANSPORTER FOR SPEED
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmail, pass: apppass },
        pool: true,          // Connection reuse karega
        maxConnections: 5,   // 5 connections ek saath kholega
        rateLimit: 10        // 10 emails per second (optional safety)
    });

    let sentCount = 0;

    // PARALLEL SENDING: Sabko ek saath bhejo
    // Pehle ye function define karo jo promise return karega
    const sendEmail = async (email) => {
        try {
            await transporter.sendMail({
                from: `"${senderName}" <${gmail}>`,
                to: email,
                subject: subject,
                text: message
            });
            return 1; // Success
        } catch (e) {
            console.log("Error sending to: " + email);
            return 0; // Fail
        }
    };

    // Promise.all se sabko parallel mein chalao
    const results = await Promise.all(recipients.map(sendEmail));
    
    // Count calculate karo
    sentCount = results.reduce((a, b) => a + b, 0);

    res.json({ success: true, sent: sentCount });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
