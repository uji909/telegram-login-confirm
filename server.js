require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static("public"));

let logins = {};

// USER LOGIN → TELEGRAM
app.post("/confirm-login", async (req, res) => {
  const { username, email } = req.body;
  const id = Date.now();

  logins[id] = { username, email, status: "pending" };

  const message = `
🔐 Login Confirmation
👤 ${username}
📧 ${email}
🕒 ${new Date().toLocaleString()}
`;

  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.CHAT_ID,
      text: message,
      reply_markup: {
        inline_keyboard: [[
          { text: "Approve ✅", callback_data: `approve_${id}` },
          { text: "Reject ❌", callback_data: `reject_${id}` }
        ]]
      }
    })
  });

  res.json({ success: true, id });
});

// TELEGRAM BUTTON CLICK
app.post("/telegram-callback", async (req, res) => {
  const q = req.body.callback_query;
  if (!q) return res.sendStatus(200);

  const [action, id] = q.data.split("_");
  logins[id].status = action === "approve" ? "approved" : "rejected";

  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: q.message.chat.id,
      message_id: q.message.message_id,
      text: `👤 ${logins[id].username}\nSTATUS: ${logins[id].status.toUpperCase()}`
    })
  });

  res.sendStatus(200);
});

// STATUS CHECK
app.get("/check-status/:id", (req, res) => {
  res.json(logins[req.params.id] || { status: "not_found" });
});

app.listen(3000, () =>
  console.log("🚀 Server running at http://localhost:3000")
);
