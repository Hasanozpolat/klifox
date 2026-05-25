# KliFox Launch Roadmap (MVP)

This roadmap outlines the steps required to take KliFox from a local simulation environment to a real-world deployed MVP in the Gaziantep pilot region.

## 1. Local Testing & Hardening (Current Phase)
- [x] Freeze experimental features (Predictive AI, Economy, Topology) via `MVP_MODE`.
- [x] Simplify Landing & Onboarding for end-users.
- [x] Stabilize worker queues and ensure memory leak prevention on failed node jobs.
- [x] Ensure Socket.io reconnects safely without listener duplication.

## 2. Infrastructure Setup (VPS & Domain)
- [ ] **Provision VPS:** Ubuntu 22.04 on DigitalOcean or AWS (minimum 2GB RAM for Node + AI Processing).
- [ ] **Domain Setup:** Point `klifox.com` and `api.klifox.com` to the VPS IP.
- [ ] **Nginx & SSL:** Install Nginx and configure reverse proxy to Node.js port (3000). Generate free SSL certs via Let's Encrypt / Certbot.

## 3. Environment & Secrets Management
- [ ] **Production Config:** Ensure `config/env.js` has `ENV: 'production'` and `host` points to `https://api.klifox.com`.
- [ ] **Backend Secrets:** Create `.env` on VPS containing:
  ```env
  PORT=3000
  NODE_ENV=production
  OPENAI_API_KEY=sk-...
  DATABASE_URL=postgresql://...
  JWT_SECRET=...
  ```
- [ ] **Security:** Ensure `helmet` and `cors` are correctly configured in `server.js`.

## 4. Database Migration (Optional for MVP, but recommended)
- [ ] If relying on simulated `database/` folders for the very first launch, ensure in-memory state is backed up (or accept ephemeral state for pilot day 1).
- [ ] *Next step:* Migrate in-memory structures (`db.schema.js`) to a managed PostgreSQL instance.

## 5. Deployment
- [ ] Clone repository on VPS.
- [ ] Run `npm install --production`.
- [ ] Start the backend with PM2: `pm2 start server.js --name "KliFox-MVP"`.
- [ ] Verify logs: `pm2 logs`.

## 6. Real-World Onboarding (Pilot Launch)
- [ ] **Craftsman Onboarding:** Manually onboard 5-10 trusted craftsmen in Şahinbey/Şehitkamil. Ensure their PWA is installed and background location (if applicable) is active.
- [ ] **Customer Alpha:** Launch targeted local ads or invite beta customers to submit real jobs.
- [ ] **Monitor:** Watch real-time dispatch success via the Admin Enterprise Dashboard.
