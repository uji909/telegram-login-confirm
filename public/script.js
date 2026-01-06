async function send() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;

  const res = await fetch("/confirm-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email })
  });

  document.getElementById("msg").innerText =
    res.ok ? "⏳ Waiting for approval" : "❌ Error";
}
