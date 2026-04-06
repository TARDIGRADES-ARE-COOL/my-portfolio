const roles = ["Embedded Engineer", "AI Builder", "Systems Developer"];
const USERNAME = "TARDIGRADES-ARE-COOL";
const API_BASE = (window.PORTFOLIO_API_BASE || "").trim();
const USE_BACKEND = Boolean(API_BASE);
const fallbackRepos = [
  { name: "DSA-More", description: "Exploring leetcode algorithms questions and more", language: "Python", stargazers_count: 0 },
  { name: "Machine-Learning-Exploration", description: "Machine learning experiments and model studies", language: "Python", stargazers_count: 0 },
  { name: "Facial-Expression-Detection", description: "Expression classification and computer vision experimentation", language: "Python", stargazers_count: 0 },
  { name: "ASCENDA-Hotel-Booking-Website", description: "Hotel-booking web app built with React and Node.js/Express", language: "JavaScript", stargazers_count: 0 },
  { name: "unix_shell", description: "Unix-like custom shell built in C", language: "C", stargazers_count: 0 },
  { name: "FPGA_GAME", description: "Hardware-focused game implementation on FPGA", language: "C++", stargazers_count: 0 },
];
let i = 0,
  j = 0,
  del = false;
const el = document.getElementById("typing");

function type() {
  const cur = roles[i];

  if (!del) {
    el.textContent = cur.slice(0, j++);
    if (j > cur.length) {
      del = true;
      setTimeout(type, 1200);
      return;
    }
  } else {
    el.textContent = cur.slice(0, j--);
    if (j === 0) {
      del = false;
      i = (i + 1) % roles.length;
    }
  }

  setTimeout(type, del ? 35 : 70);
}
type();

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

async function loadRepos() {
  const container = document.getElementById("repos");
  const totalReposEl = document.getElementById("total-repos");
  const totalStarsEl = document.getElementById("total-stars");
  const topLanguageEl = document.getElementById("top-language");
  const lastUpdatedEl = document.getElementById("last-updated");

  try {
    const url = USE_BACKEND
      ? `${API_BASE}/api/repos?sort=updated&per_page=100`
      : `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`;
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid GitHub response");
    }

    const totalStars = data.reduce(
      (sum, repo) => sum + (repo.stargazers_count || 0),
      0,
    );
    const languageCounts = data.reduce((acc, repo) => {
      if (!repo.language) return acc;
      acc[repo.language] = (acc[repo.language] || 0) + 1;
      return acc;
    }, {});
    const topLanguage =
      Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A";
    const latestRepo = data[0];
    const lastUpdated = latestRepo?.updated_at
      ? new Date(latestRepo.updated_at).toLocaleDateString()
      : "N/A";

    if (totalReposEl) totalReposEl.textContent = String(data.length);
    if (totalStarsEl) totalStarsEl.textContent = String(totalStars);
    if (topLanguageEl) topLanguageEl.textContent = topLanguage;
    if (lastUpdatedEl) lastUpdatedEl.textContent = lastUpdated;

    container.innerHTML = "";

    data.slice(0, 6).forEach((repo) => {
      const card = document.createElement("a");
      card.className = "repo-card";
      card.href = `project.html?repo=${encodeURIComponent(repo.name)}`;

      const lang = repo.language || "";
      const dotColor = langColors[lang] || "#8892b0";

      card.innerHTML = `
        <div class="repo-name">${repo.name}</div>
        <div class="repo-desc">${repo.description || "No description"}</div>
        <div class="repo-meta">
          ${lang ? `<span class="repo-lang"><span class="repo-lang-dot" style="background:${dotColor}"></span>${lang}</span>` : ""}
          ${repo.stargazers_count > 0 ? `<span class="repo-stars">&#9733; ${repo.stargazers_count}</span>` : ""}
        </div>
        <div class="repo-detail-link">Open project page &rarr;</div>
      `;
      container.appendChild(card);
    });
  } catch {
    container.innerHTML = "";
    if (totalReposEl) totalReposEl.textContent = String(fallbackRepos.length);
    if (totalStarsEl) totalStarsEl.textContent = "0";
    if (topLanguageEl) topLanguageEl.textContent = "Python";
    if (lastUpdatedEl) lastUpdatedEl.textContent = "Recent";

    fallbackRepos.slice(0, 6).forEach((repo) => {
      const card = document.createElement("a");
      card.className = "repo-card";
      card.href = `project.html?repo=${encodeURIComponent(repo.name)}`;

      const lang = repo.language || "";
      const dotColor = langColors[lang] || "#8892b0";
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
}
loadRepos();
