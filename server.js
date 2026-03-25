const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

// Render automatically PORT deta hai, agar nahi mila toh 3000 use karo
const port = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Default route: Login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// API to send email
app.post('/send', async (req, res) => {
    const { senderName, gmail, apppass, subject, message, to } = req.body;

    // Validation
    if (!gmail || !apppass || !to) {
        return res.json({ success: false, msg: "Please fill all required fields." });
    }

    // Prepare recipients list (comma ya new line se split karo)
    const recipients = to.split(/[,\n]/).map(e => e.trim()).filter(e => e);

    // Nodemailer Transporter Setup
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmail,
            pass: apppass
        }
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
        console.error(error);
        res.json({ success: false, msg: error.message });
    }
});

// Server Start
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});