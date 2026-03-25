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

// Email Send API with Better Configuration
app.post('/send', async (req, res) => {
    const { senderName, gmail, apppass, subject, message, to } = req.body;

    if (!gmail || !apppass || !to) {
        return res.json({ success: false, msg: "Please fill all required fields." });
    }

    const recipients = to.split(/[,\n]/).map(e => e.trim()).filter(e => e);

    if (recipients.length > 25) {
        return res.json({ success: false, msg: "Limit Error: Max 25 recipients allowed." });
    }

    // UPDATED: Explicit SMTP Settings for Gmail (More Reliable)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: gmail,
            pass: apppass
        },
        connectionTimeout: 10000, // 10 seconds timeout
        socketTimeout: 10000
    });

    const mailOptions = {
        from: `"${senderName}" <${gmail}>`,
        to: recipients, // Email 'Recipients' box walo ko jayegi
        subject: subject,
        text: message
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.json({ success: true, sent: recipients.length });
    } catch (error) {
        console.error("Full Error:", error);
        // User friendly message
        let errorMsg = error.message;
        if(error.code === 'ESOCKET') errorMsg = "Connection failed. Hosting might block SMTP ports.";
        if(error.code === 'EAUTH') errorMsg = "Invalid Gmail or App Password.";
        
        res.json({ success: false, msg: errorMsg });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
