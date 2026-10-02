# Frontend — Base Technical Skeleton

> Starting technical skeleton for the frontend module of the ISEP Integrative Project (LEI-ISEP 2026/27).

---

## 📌 Technology & Architecture Disclaimer
**Note:** The Request for Proposal (RFP) does not mandate any specific technology or architecture for this part of the system.
The technology choices (React, TypeScript, Vite, Vitest) and future architecture decisions must be documented and justified by the team in the project deliverables.

---

## 🛠️ Prerequisites & Runtime
* **Node.js**: v20+ (tested on v22/v26)
* **npm**: v10+

---

## 🚀 Installation & Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   A `.env.example` file is provided:
   ```bash
   cp .env.example .env
   ```
   * Default Backend API URL: `http://localhost:3000/api/v1`
   * Dev Server Port: `5173`

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## 🧪 Running Automated Tests
Run the configured test suite (Vitest):
```bash
npm run test
```

---

## 📂 Where the Team Should Add Their Own Folder Structure & Routing
This repository contains **only the bare technical skeleton**:
* A single home page in `src/App.tsx` showing the connection status to the backend.
* An API client function in `src/api.ts` connecting to the `GET /health` endpoint.

**Next steps for the team:**
* Introduce client-side routing (e.g. React Router) when multiple pages are needed.
* Design and establish your application folder structure (e.g. `components/`, `features/`, `hooks/`, `services/`, `pages/`, `state/`).
* Add domain-specific screens, business models, and UI components as required by subsequent sprint user stories.

---

## ⚠️ Troubleshooting: "Backend: unreachable"
If the home page displays **"Backend: unreachable"**:
1. Ensure the backend server is running (`cd ../backend && npm run dev` on `http://localhost:3000`).
2. Verify CORS configuration in `backend/.env`: `CORS_ORIGIN` must match this frontend's dev server origin (`http://localhost:5173`).
3. Ensure `VITE_BACKEND_URL` in `frontend/.env` is pointing to the correct backend API address (`http://localhost:3000/api/v1`).
