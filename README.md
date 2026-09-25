# API Skeleton

This repository contains the domain-agnostic starting skeleton for a Node.js API.

## Requirements

- Node.js `22.x` (tested with `22.17.1`)
- npm `10.x`

## Install

```bash
npm install
cp .env.example .env
```

Update `.env` as needed. `CORS_ORIGIN` accepts the frontend origin that should be allowed; it defaults to `http://localhost:5173`.

## Run

```bash
npm start
```

The API listens on `http://localhost:8080` by default.

- Health: `GET /api/v1/health`
- OpenAPI UI: `GET /api/v1/docs`

## Test and quality checks

```bash
npm test
npm run lint
npm run format:check
```

## Project structure

The project intentionally contains only the entry point and required tooling. Add the team's application folder structure next to `Base.js`, after agreeing on and documenting the design.

The RFP does not mandate any technology or architecture for this part of the system. The team must justify both its technology choices and its architectural choices.# LEI-SEM5-PI-2026-27-3DL-E-C
# LEI-SEM5-PI-2026-27-3DL-E-C
