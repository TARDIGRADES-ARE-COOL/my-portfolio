# Deploy Guide (GitHub Pages + Render)

## 1) GitHub Pages (Frontend)

Your repository is already pushed with the latest frontend.

In GitHub:
1. Open repository `TARDIGRADES-ARE-COOL/my-portfolio`
2. Go to **Settings -> Pages**
3. Set:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`

Custom domain is handled by root `CNAME`:
- `sarveshjoaquim.com`

## 2) Render (Backend API)

Backend cannot run on GitHub Pages, so deploy `backend` separately.

### Option A: One-click from `render.yaml`
1. Go to Render dashboard and create a new Blueprint/Service from this repo.
2. Render will detect `backend/render.yaml`.
3. Set required env vars:
   - `OPENAI_API_KEY` (required)
   - `GITHUB_TOKEN` (optional but recommended for GitHub API limits)

### Option B: Manual Web Service
Use:
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Health Check Path:** `/metrics`

## 3) Connect Frontend to Backend URL

After Render deploy gives URL (example):
- `https://sarvesh-portfolio-backend.onrender.com`

Edit:
- `frontend/site-config.js`

Replace:
- `https://REPLACE_WITH_RENDER_BACKEND_URL`

with your real Render URL.

Then commit + push again.

## 4) Never commit secrets

Do not commit `backend/.env`.

Use:
- `backend/.env.example` as template
- Render environment variables for production secrets
