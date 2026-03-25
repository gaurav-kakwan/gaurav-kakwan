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

// Email Send API - Updated for Port 587
app.post('/send', async (req, res) => {
    const { senderName, gmail, apppass, subject, message, to } = req.body;

    if (!gmail || !apppass || !to) {
        return res.json({ success: false, msg: "Please fill all required fields." });
    }

    const recipients = to.split(/[,\n]/).map(e => e.trim()).filter(e => e);

    if (recipients.length > 25) {
        return res.json({ success: false, msg: "Limit Error: Max 25 recipients allowed." });
    }

    // CHANGE: Using Port 587 and Secure: false (STARTTLS)
    // Ye cloud hosting par zyada reliable hota hai
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // false for 587
        requireTLS: true,
        auth: {
            user: gmail,
            pass: apppass
        },
        connectionTimeout: 20000, // 20 seconds wait
        socketTimeout: 20000
    });

    const mailOptions = {
        from: `"${senderName}" <${gmail}>`,
        to: recipients,
        subject: subject,
        text: message
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.json({ success: true, sent: recipients.length });
    } catch (error) {
        console.error("Error Details:", error);
        
        // Specific error messages
        if(error.code === 'ESOCKET') {
            return res.json({ success: false, msg: "Network Error: Server cannot connect to Gmail." });
        }
        if(error.code === 'EAUTH') {
            return res.json({ success: false, msg: "Invalid Gmail or App Password." });
        }
        
        res.json({ success: false, msg: `Error: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
