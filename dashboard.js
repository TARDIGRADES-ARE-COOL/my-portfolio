const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

let data = Array(60).fill(0);

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width - 40;
  canvas.height = 180;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function formatUptime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hours}h ${mins}m ${secs}s`;
}

function renderSystem(metrics) {
  const cpu = metrics.cpuPercent;
  const mem = metrics.memoryPercent;
  document.getElementById("cpu").textContent = cpu + "%";
  document.getElementById("mem").textContent = mem + "%";
  document.getElementById("uptime").textContent = formatUptime(metrics.uptimeSeconds);
  document.getElementById("requests").textContent = String(metrics.totalRequests);
  document.getElementById("rate").textContent = `${metrics.requestRate} req/s`;

  const cpuBar = document.getElementById("cpu-bar");
  const memBar = document.getElementById("mem-bar");
  if (cpuBar) cpuBar.style.width = cpu + "%";
  if (memBar) memBar.style.width = mem + "%";

  data.push(cpu);
  data.shift();

  drawGraph();
}

async function updateSystem() {
  try {
    const res = await fetch("/metrics");
    if (!res.ok) throw new Error("Metrics unavailable");
    const metrics = await res.json();
    renderSystem(metrics);
  } catch {
    document.getElementById("cpu").textContent = "--";
    document.getElementById("mem").textContent = "--";
    document.getElementById("uptime").textContent = "--";
    document.getElementById("requests").textContent = "--";
    document.getElementById("rate").textContent = "Metrics offline";
  }
}

function drawGraph() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(123, 92, 255, 0.28)");
  grad.addColorStop(1, "rgba(123, 92, 255, 0)");

  ctx.beginPath();
  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (val / 100) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (val / 100) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = "#7b5cff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#7b5cff";
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

updateSystem();
setInterval(updateSystem, 2000);
