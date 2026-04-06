const params = new URLSearchParams(window.location.search);
const repoName = params.get("repo");

const nameEl = document.getElementById("project-name");
const descEl = document.getElementById("project-description");
const langEl = document.getElementById("project-language");
const repoUrlEl = document.getElementById("repo-url");
const homeUrlEl = document.getElementById("repo-homepage");
const starsEl = document.getElementById("metric-stars");
const forksEl = document.getElementById("metric-forks");
const issuesEl = document.getElementById("metric-issues");
const pushedEl = document.getElementById("metric-pushed");
const readmeEl = document.getElementById("readme-content");

function setFallback(message) {
  nameEl.textContent = "Project not found";
  descEl.textContent = message;
  langEl.textContent = "UNAVAILABLE";
  readmeEl.textContent = "No README available.";
  homeUrlEl.style.display = "none";
}

function decodeBase64Unicode(str) {
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(""),
    );
  } catch {
    return atob(str);
  }
}

async function loadProject() {
  if (!repoName) {
    setFallback("Missing repository name in URL.");
    return;
  }

  try {
    const repoRes = await fetch(`/api/repos/${encodeURIComponent(repoName)}`);
    if (!repoRes.ok) throw new Error("Repo not found");
    const repo = await repoRes.json();

    nameEl.textContent = repo.name;
    descEl.textContent =
      repo.description || "No description provided for this project.";
    langEl.textContent = repo.language
      ? `PRIMARY LANGUAGE: ${repo.language.toUpperCase()}`
      : "PRIMARY LANGUAGE: N/A";

    repoUrlEl.href = repo.html_url;
    if (repo.homepage) {
      homeUrlEl.href = repo.homepage;
      homeUrlEl.style.display = "inline-flex";
    } else {
      homeUrlEl.style.display = "none";
    }

    starsEl.textContent = String(repo.stargazers_count || 0);
    forksEl.textContent = String(repo.forks_count || 0);
    issuesEl.textContent = String(repo.open_issues_count || 0);
    pushedEl.textContent = new Date(repo.pushed_at).toLocaleDateString();

    const readmeRes = await fetch(
      `/api/repos/${encodeURIComponent(repoName)}/readme`,
    );

    if (!readmeRes.ok) {
      readmeEl.textContent = "No README found for this repository.";
      return;
    }

    const readmeData = await readmeRes.json();
    const decoded = decodeBase64Unicode(readmeData.content || "");
    readmeEl.textContent = decoded.slice(0, 5000) || "README is empty.";
  } catch {
    setFallback("Could not load this repository from GitHub.");
  }
}

loadProject();
