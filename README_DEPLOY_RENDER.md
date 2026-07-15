StreamConnect - Deploying to Render (free tier)

Overview

- This repo contains a combined Node/Express server (`/server`) and React client (`/client`).
- The server can serve the built React app so you can deploy a single service on Render.

Key points

1. The client connects to the backend using `REACT_APP_BACKEND_URL`. By default it connects to the same origin (`/`) so when the server serves the client build, sockets work without extra config.
2. The server's `package.json` includes a `postinstall` script that installs and builds the client automatically when `npm install` runs in the `/server` folder. This makes Render builds simpler.

Render setup (one-service combined deployment)

1. In Render, create a new Web Service.
2. Connect your GitHub/GitLab repo and point the root to the `server` folder (so Render runs `npm install` in `server`).
3. Set the build command to the default (Render will run `npm install` which triggers `postinstall` to build the client).
4. Set the start command to `npm start`.
5. No extra environment variables are required for a combined deployment (client uses same origin). If you want to separate services, set `REACT_APP_BACKEND_URL` to your backend URL.

Render settings and environment variables (summary)

- Combined single Web Service (point Render to the `server` folder):
  - Root Directory: `server` (set in Render service)
  - Build Command: `npm install` (Render runs this by default; the server `postinstall` builds the client)
  - Start Command: `npm start`
  - Environment variables to set in Render (optional):
    - `FRONTEND_ORIGIN` — restrict CORS to this origin (e.g. `https://your-app.onrender.com`). Leave empty for `*`.

- Separate services (recommended for static hosting of client):
  - Client (Static Site / Web Service):
    - Build Command: `npm install && npm run build`
    - Publish Directory: `client/build`
    - Optional env: set `REACT_APP_BACKEND_URL` to your backend URL if the client will call a separate server.
  - Server (Web Service):
    - Root Directory: `server`
    - Build Command: `npm install`
    - Start Command: `npm start`
    - Environment variables to set in Render:
      - `PORT` — Render provides this automatically; do not change unless necessary.
      - `FRONTEND_ORIGIN` — set to your client URL to restrict CORS.

Environment files

- See `server/.env.example` and `client/.env.example` for example variables you can set locally. Do NOT commit real secrets to the repo.

Optional: If you prefer separate services

- Deploy `client` to a static site service (or Render static site) and deploy `server` separately.
- In that case, set `REACT_APP_BACKEND_URL` in the client service to the server's URL.

Local testing

- To build locally and run server serving client build:

```bash
# from repo root
cd server
npm install
# postinstall will install/build client
npm start
```

Security/Notes

- In production, consider restricting CORS to your frontend origin instead of `*`.
- Render sets `PORT` automatically; server reads `process.env.PORT`.

If you want, I can:

- Add a root-level `package.json` to orchestrate installs/builds across both folders.
- Add a `render.yaml` for Render-specific settings.
- Set CORS to a configurable origin via `process.env.FRONTEND_ORIGIN`.
