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

// --- HELPER FUNCTION: DELAY ---
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- EMAIL SEND API (SERIAL + DELAY) ---
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

    // Loop: Ek ek karke bhejenge (Serial)
    for (const email of recipients) {
        try {
            await transporter.sendMail({
                from: `"${senderName}" <${gmail}>`,
                to: email,
                subject: subject,
                text: message
            });
            sentCount++;
            console.log(`Sent to: ${email}`);
            
            // DELAY: 0.2 Second (50ms) wait karo next email se pehle
            // Agar kam karna hai to 2000 ko 1000 (1 sec) kar do
            await wait(100); 

        } catch (e) {
            console.log("Error sending to: " + email);
        }
    }

    res.json({ success: true, sent: sentCount });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
