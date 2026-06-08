# TikTube Tools - Production Deployment Suite

Production Domain: **[https://TikTubeTools.com](https://TikTubeTools.com)**

An ultra-clean, high-performance web platform containing advanced downloaders, media converters, transcription systems, and AI-powered visual analysis studios tailored specifically for modern content creators. TikTube Tools is 100% SEO-optimized, bilingual, and integrates seamlessly with WordPress.

---

## 🏗️ 1. Central Configuration (`config/site-config.ts`)

To support fast deployments and ease of management, **all editable parameters are consolidated inside `src/config/site-config.ts`**. You do not need to modify multiple files in the source code.

Open `/src/config/site-config.ts` to edit key settings, or supply them through standard environment variables (`.env` file):

### 🌐 Changing the Domain
To update the domain, edit the `DOMAIN_URL` option:
* **In Code (`site-config.ts`)**: Update `DOMAIN_URL: "https://TikTubeTools.com"`
* **In Environment (`.env`)**: Define `DOMAIN_URL=https://TikTubeTools.com`

### 📝 Connecting to WordPress
TikTube Tools features an advanced interactive WordPress integration panel.
* Set the target WordPress URL using `WORDPRESS_URL` (e.g. `https://TikTubeTools.com/blog`).
* Set the REST JSON endpoint using `WORDPRESS_API_URL` (e.g. `https://TikTubeTools.com/blog/wp-json/wp/v2`).
* When active, TikTube Tools dynamically tests connection statuses, retries on latency issues, logs errors in the admin panel, and synchronizes published items in real time.

### 🗄️ Database Credentials
The platform operates on a resilient JSON filesystem backend on startup (pre-seeded with analytical charts and audit logs). For high-scale enterprise environments, you can transition to a relational PostgreSQL database:
* **`DB_PROVIDER`**: Change to `"postgresql"`.
* Specify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_SSL` inside `.env` or `site-config.ts` under `DATABASE_SETTINGS`.

---

## 🚀 2. Local Installation & Development

To spin up development or production stages locally, make sure you have **Node.js (v18+)** installed:

1. **Install Base Packages**:
   ```bash
   npm install
   ```

2. **Configure Your Secrets**:
   Copy `.env.example` to `.env` and fill out your variables:
   ```bash
   cp .env.example .env
   ```

3. **Launch the Real-time Dev Cluster**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to inspect the app.

---

## 📦 3. Production Deployment Guideline

### Step A: Build & Package Compiled Assets
Build the production-ready clients and bundle the custom server using:
```bash
npm run build
```
This performs a compile pass:
* Bundles React and Vite static files inside `/dist`.
* Packages `/server.ts` into a self-contained, high-performance CommonJS file `/dist/server.cjs` via `esbuild`.

### Step B: Start Live Production Instances
Boot up the pre-bundled server instances:
```bash
npm start
```

### Option C: Containerized Deployment (Docker / Cloud Run)
To deploy TikTube Tools onto Google Cloud Run, AWS ECS, or any virtual host running Docker:
1. Use the following simple `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```
2. Build the container image and upload:
   ```bash
   docker build -t tiktubetools:v1 .
   ```

---

## ⚡ 4. Real-time WordPress Webhooks Setup

To synchronize content *instantly* when publishing new articles in WordPress:
1. In your WordPress administration panel, install a webhook dispatcher (such as *WP Webhooks*).
2. Register a webhook action triggered on **Post Created**, **Post Updated**, or **Post Deleted**.
3. Point the payload delivery destination to:
   ```
   https://TikTubeTools.com/api/wordpress/sync
   ```
4. Securely add the required administrative passcode headers or request parameters:
   * Key: `passcode`
   * Value: `[SECRET_ADMIN_PASSCODE]`

---

## 📈 5. Live Relational SQL Schema & Migrations

If migrating onto relational PostgreSQL hosting:
* Schema models can be located in: `src/db/schema.ts`
* Execute SQL DDL structures from the initial migration: `src/db/migrations/0000_init.sql`

Your production analytics (visits, unique views, CTA impressions, and tool usage profiles) will sync natively into SQL tables, keeping records secured and scalable.
