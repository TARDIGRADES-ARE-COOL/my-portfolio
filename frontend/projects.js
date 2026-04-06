const container = document.getElementById("all-repos");
const searchInput = document.getElementById("project-search");
const countEl = document.getElementById("project-count");
const USERNAME = "TARDIGRADES-ARE-COOL";
const API_BASE = (window.PORTFOLIO_API_BASE || "").trim();
const USE_BACKEND = Boolean(API_BASE);
const fallbackRepos = [
  { name: "DSA-More", description: "Exploring leetcode algorithms questions and more", language: "Python", stargazers_count: 0 },
  { name: "Machine-Learning-Exploration", description: "Machine learning experiments and model studies", language: "Python", stargazers_count: 0 },
  { name: "Facial-Expression-Detection", description: "Expression classification and computer vision experimentation", language: "Python", stargazers_count: 0 },
  { name: "ASCENDA-Hotel-Booking-Website", description: "Hotel-booking web app built with React and Node.js/Express", language: "JavaScript", stargazers_count: 0 },
  { name: "DHKE", description: "Coursework repository focused on systems/security tasks", language: "Jupyter Notebook", stargazers_count: 0 },
  { name: "unix_shell", description: "Unix-like custom shell built in C", language: "C", stargazers_count: 0 },
  { name: "FPGA_GAME", description: "Hardware-focused game implementation on FPGA", language: "C++", stargazers_count: 0 },
];

let reposCache = [];

const langColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  C: "#555555",
  "C++": "#f34b7d",
  Rust: "#dea584",
  Go: "#00ADD8",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Java: "#b07219",
};

function renderRepos(repos) {
  container.innerHTML = "";
  countEl.textContent = `${repos.length} repositories`;

  if (!repos.length) {
    container.innerHTML =
      '<p style="color:var(--muted)">No matching projects found.</p>';
    return;
  }

  repos.forEach((repo) => {
    const lang = repo.language || "";
    const dotColor = langColors[lang] || "#8892b0";

    const card = document.createElement("a");
    card.className = "repo-card";
    card.href = `project.html?repo=${encodeURIComponent(repo.name)}`;
    card.innerHTML = `
      <div class="repo-name">${repo.name}</div>
      <div class="repo-desc">${repo.description || "No description"}</div>
      <div class="repo-meta">
        ${lang ? `<span class="repo-lang"><span class="repo-lang-dot" style="background:${dotColor}"></span>${lang}</span>` : ""}
        <span class="repo-stars">&#9733; ${repo.stargazers_count || 0}</span>
      </div>
      <div class="repo-detail-link">Open project page &rarr;</div>
    `;

    container.appendChild(card);
  });
}

async function loadRepos() {
  try {
    const url = USE_BACKEND
      ? `${API_BASE}/api/repos?sort=updated&per_page=100`
      : `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`;
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Invalid GitHub response");

    reposCache = data;
    renderRepos(reposCache);
  } catch {
    reposCache = fallbackRepos;
    renderRepos(reposCache);
  }
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = reposCache.filter((repo) => {
    const name = repo.name?.toLowerCase() || "";
    const desc = repo.description?.toLowerCase() || "";
    const lang = repo.language?.toLowerCase() || "";
    return name.includes(q) || desc.includes(q) || lang.includes(q);
  });
  renderRepos(filtered);
});

loadRepos();
