const log = document.getElementById("chat-log");
const input = document.getElementById("chat-input");
const chatEl = document.getElementById("chatbot");
const toggleBtn = document.getElementById("chat-toggle");
const closeBtn = document.getElementById("chat-close");
const sendBtn = document.getElementById("chat-send");

toggleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  chatEl.classList.toggle("chatbot-hidden");
  if (!chatEl.classList.contains("chatbot-hidden")) {
    input.focus();
  }
});

closeBtn.addEventListener("click", () => {
  chatEl.classList.add("chatbot-hidden");
});

function appendMsg(text, sender) {
  const div = document.createElement("div");
  div.className = `chat-msg ${sender}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

async function sendMessage(msg) {
  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Chat request failed");
  }
  return data.reply;
}

async function botReply(topic) {
  chatEl.classList.remove("chatbot-hidden");
  appendMsg(`Tell me about ${topic}...`, "user");
  try {
    const reply = await sendMessage(`Tell me about ${topic}`);
    appendMsg(reply, "bot");
  } catch (err) {
    appendMsg(err.message || "Couldn't reach the AI.", "bot");
  }
}

async function handleSend() {
  const msg = input.value.trim();
  if (!msg) return;

  appendMsg(msg, "user");
  input.value = "";

  try {
    const reply = await sendMessage(msg);
    appendMsg(reply, "bot");
  } catch (err) {
    appendMsg(err.message || "Couldn't reach the AI.", "bot");
  }
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSend();
});

sendBtn.addEventListener("click", handleSend);

export { botReply };
