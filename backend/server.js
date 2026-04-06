import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

let totalRequests = 0;
const startTime = Date.now();

app.use((req, _res, next) => {
  totalRequests += 1;
  next();
});

const LLM_PROVIDER = (process.env.LLM_PROVIDER || "openai").toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let openaiClient = null;
if (OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

const GITHUB_USER = "TARDIGRADES-ARE-COOL";
const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "sjg-portfolio",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 5;

async function githubFetch(pathname) {
  const url = `https://api.github.com${pathname}`;
  const cached = cache.get(url);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const response = await fetch(url, { headers: githubHeaders });
  const data = await response.json();

  if (!response.ok) {
    if (cached) return cached.data;
    throw new Error(data?.message || "GitHub request failed");
  }

  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

function stripHtmlTags(value) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function scrapeReposFallback() {
  const response = await fetch(`https://github.com/${GITHUB_USER}?tab=repositories`);
  const html = await response.text();

  const repoRegex = /href="\/TARDIGRADES-ARE-COOL\/([A-Za-z0-9_.-]+)"/g;
  const names = [...new Set([...html.matchAll(repoRegex)].map((m) => m[1]))].slice(
    0,
    100,
  );

  return names.map((name) => ({
    name,
    html_url: `https://github.com/${GITHUB_USER}/${name}`,
    description: "Repository details available on project page.",
    language: "",
    stargazers_count: 0,
    updated_at: new Date().toISOString(),
  }));
}

async function scrapeRepoFallback(repoName) {
  const response = await fetch(`https://github.com/${GITHUB_USER}/${repoName}`);
  if (!response.ok) throw new Error("Repository not found");
  const html = await response.text();

  const descriptionMatch = html.match(
    /property="og:description" content="([^"]*)"/,
  );
  const langMatch = html.match(/itemprop="programmingLanguage">([^<]+)</);

  return {
    name: repoName,
    html_url: `https://github.com/${GITHUB_USER}/${repoName}`,
    homepage: "",
    language: langMatch ? stripHtmlTags(langMatch[1]) : "",
    description: descriptionMatch
      ? stripHtmlTags(descriptionMatch[1])
      : "Project details are available on GitHub.",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    pushed_at: new Date().toISOString(),
  };
}

async function fetchReadmeFallback(repoName) {
  const branches = ["main", "master"];
  const files = ["README.md", "readme.md", "README.MD"];

  for (const branch of branches) {
    for (const file of files) {
      const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/${branch}/${file}`;
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        return { content: Buffer.from(content, "utf8").toString("base64") };
      }
    }
  }

  return {
    content: Buffer.from(
      "README unavailable from API right now. Open the GitHub repository for full details.",
      "utf8",
    ).toString("base64"),
  };
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const systemPrompt = `You are Sarvesh Joaquim Gopu's portfolio assistant.

Your job:
- Answer questions about Sarvesh's profile, skills, projects, education, and experience.
- Sound confident, concise, and professional.
- Keep responses short by default (2-5 sentences) unless user asks for detail.
- If asked irrelevant topics (finance, medicine, politics, etc.), politely redirect back to portfolio/career topics.

Facts you can use:
- Sarvesh is an Embedded Systems and AI Engineer-in-Training.
- He is a Computer Science and Design undergraduate at SUTD (2023-2027), KKH-SUTD Scholarship recipient.
- Previous education: Ngee Ann Polytechnic, Diploma in Automation and Mechatronics Systems Engineering (minor in business).
- Experience includes:
  - Firmware Developer/Testing Intern at WS Audiology (Sep 2025-Jan 2026), using C++, Python, and Azure DevOps.
  - Hotel-booking web app development with Ascenda (May 2025-Aug 2025), using React, Node.js/Express, SQL.
  - Engineering Intern at Turck Banner (Apr 2020-Sep 2020), sensor-related debugging/testing.
- Skills include: Python, C, C++, JavaScript, Java, ML, Node.js, Express, React, TensorFlow, NumPy, Pandas, FPGA/microcontroller programming, Git/GitHub, Azure DevOps.

Style rules:
- Do not claim fake certifications, jobs, or achievements.
- If uncertain, say you don't have that detail and suggest contacting Sarvesh via LinkedIn/email.
- Never present yourself as a finance/investing advisor.
- Be helpful, warm, and specific.`;

    if (LLM_PROVIDER === "gemini") {
      if (!GEMINI_API_KEY) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing in backend/.env",
          code: "missing_gemini_api_key",
        });
      }

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
          GEMINI_API_KEY,
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generationConfig: {
              temperature: 0.4,
            },
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nUser question: ${message}` }],
              },
            ],
          }),
        },
      );

      const geminiData = await geminiRes.json();
      if (!geminiRes.ok) {
        const geminiMsg = geminiData?.error?.message || "Gemini request failed";
        return res.status(geminiRes.status).json({
          error: geminiMsg,
          code: "gemini_error",
        });
      }

      const reply =
        geminiData?.candidates?.[0]?.content?.parts
          ?.map((p) => p?.text || "")
          .join("")
          .trim() || "I could not generate a response right now.";

      return res.json({ reply });
    }

    if (!openaiClient) {
      return res.status(400).json({
        error: "OPENAI_API_KEY is missing in backend/.env",
        code: "missing_openai_api_key",
      });
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: message },
      ],
    });

    return res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    const status = err?.status || 500;
    const code = err?.code || "unknown_error";
    const message =
      status === 401
        ? "OpenAI API key is invalid. Update OPENAI_API_KEY in backend/.env and restart server."
        : status === 429
          ? "OpenAI rate limit or quota reached. Check your OpenAI billing/usage."
          : "LLM request failed. Please try again.";

    console.error("Chat API error:", {
      status,
      code,
      message: err?.message,
    });
    return res.status(status).json({ error: message, code });
  }
});

app.get("/metrics", (_req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryPercent = Math.round((usedMem / totalMem) * 100);

  const cpuCores = os.cpus().length || 1;
  const loadAvg1 = os.loadavg()[0];
  const cpuPercent = Math.min(100, Math.round((loadAvg1 / cpuCores) * 100));

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const requestRate = totalRequests / Math.max(1, uptimeSeconds);

  res.json({
    cpuPercent,
    memoryPercent,
    uptimeSeconds,
    totalRequests,
    requestRate: Number(requestRate.toFixed(2)),
    serverTime: new Date().toISOString(),
  });
});

app.get("/api/repos", async (req, res) => {
  const sort = req.query.sort || "updated";
  const perPage = Math.min(Number(req.query.per_page) || 100, 100);

  try {
    const repos = await githubFetch(
      `/users/${GITHUB_USER}/repos?sort=${encodeURIComponent(
        sort,
      )}&per_page=${perPage}`,
    );
    res.json(repos);
  } catch {
    try {
      const fallbackRepos = await scrapeReposFallback();
      res.json(fallbackRepos);
    } catch {
      res.status(502).json({ error: "Unable to load repositories" });
    }
  }
});

app.get("/api/repos/:repo", async (req, res) => {
  try {
    const repo = await githubFetch(
      `/repos/${GITHUB_USER}/${encodeURIComponent(req.params.repo)}`,
    );
    res.json(repo);
  } catch {
    try {
      const fallbackRepo = await scrapeRepoFallback(req.params.repo);
      res.json(fallbackRepo);
    } catch {
      res.status(404).json({ error: "Repository not found" });
    }
  }
});

app.get("/api/repos/:repo/readme", async (req, res) => {
  try {
    const readme = await githubFetch(
      `/repos/${GITHUB_USER}/${encodeURIComponent(req.params.repo)}/readme`,
    );
    res.json(readme);
  } catch {
    const fallbackReadme = await fetchReadmeFallback(req.params.repo);
    res.json(fallbackReadme);
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Running on http://localhost:${port}`));
