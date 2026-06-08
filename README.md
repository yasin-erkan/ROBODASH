# RoboDash

[![GitHub](https://img.shields.io/badge/GitHub-yasin--erkan%2FROBODASH-181717?logo=github)](https://github.com/yasin-erkan/ROBODASH)

**Real-time fleet operations dashboard for solar panel cleaning robots.**

Monitor 10 robots across Europe, send remote commands, and track system events — built as a full-stack MERN demo with JWT auth, role-based access, and WebSocket telemetry.

![RoboDash demo](./frontend/src/assets/robodash-demo.gif)

---

## At a Glance

| | |
|---|---|
| **Stack** | React · Express · MySQL · Socket.io |
| **Robots** | 10 EU sites (LU, DE, FR, ES, IT, NL, BE, AT, PL, PT) |
| **Realtime** | WebSocket telemetry every 5s |
| **Auth** | JWT + RBAC (viewer / operator / admin) |
| **Simulator** | Built-in — no separate process needed |
| **Database** | MySQL 8 in Docker (`robodash-db`, port 3307) |

---

## Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React + Vite)"]
        LP[LoginPage]
        DB[Dashboard]
        MAP[FleetMap]
        RC[RobotCard]
    end

    subgraph Backend["Backend (Express + Socket.io)"]
        API[REST API]
        SOCK[Socket Handler]
        CMD[commandService]
        TEL[telemetryService]
        SIM[simulation.js]
    end

    subgraph Data["Data Layer"]
        MY[(MySQL)]
    end

    LP -->|POST /auth/login| API
    DB -->|JWT token| SOCK
    RC -->|robot:command| SOCK
    SOCK --> CMD
    CMD --> SIM
    SIM --> TEL
    SOCK -->|telemetry from robot| TEL
    TEL --> MY
    TEL -->|broadcast| DB
    API --> MY
```

---

## Data Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Dashboard
    participant API as REST API
    participant WS as Socket.io
    participant Sim as Simulation
    participant DB as MySQL

    User->>UI: Login (username / password)
    UI->>API: POST /api/auth/login
    API-->>UI: JWT token + role

    UI->>WS: Connect (?token=JWT)
    WS-->>UI: fleet:init

    loop Every 5 seconds
        Sim->>WS: telemetry payload
        WS->>DB: save telemetry
        WS-->>UI: telemetry event
    end

    User->>UI: Click Start Clean
    UI->>WS: robot:command
    WS->>Sim: applyCommand()
    Sim->>WS: updated telemetry
    WS-->>UI: status → cleaning
```

---

## Role-Based Access

```mermaid
flowchart LR
    subgraph Roles
        V[viewer]
        O[operator]
        A[admin]
    end

    subgraph Permissions
        W[Watch Live Telemetry]
        C[Send Commands]
        M[Full Access]
    end

    V --> W
    O --> W
    O --> C
    A --> W
    A --> C
    A --> M
```

| Role | Watch fleet | Start / Stop / Home | Notes |
|------|:-----------:|:-------------------:|-------|
| `viewer` | ✅ | ❌ | Read-only ops center |
| `operator` | ✅ | ✅ | Day-to-day fleet control |
| `admin` | ✅ | ✅ | Same as operator (demo) |

---

## Features

- **Live fleet map** — Leaflet dark-theme map with robot markers across Europe
- **Real-time telemetry** — battery, water level, panels cleaned, GPS, status
- **Remote commands** — `start_clean` · `stop` · `return_home`
- **State machine sim** — idle → cleaning → charging / error → idle
- **System logs** — connection events, status changes, commands
- **JWT authentication** — protected socket + REST command endpoints
- **Modular backend** — controllers · services · middleware · socket layer

---

## Project Structure

```
mernstack_RoboDash/
├── docker-compose.yml       # MySQL 8 container (robodash-db)
├── backend/
│   ├── server.js              # Entry point — starts API + sim
│   ├── app.js                 # Express setup
│   ├── simulation.js          # Built-in fleet simulator
│   ├── fleet.js               # 10 robot definitions
│   ├── database.js            # MySQL pool + queries
│   ├── schema.sql             # DB setup (fresh + migrate)
│   ├── config.js              # Env + demo users
│   ├── middleware/auth.js     # JWT verify + role guard
│   ├── controllers/           # HTTP handlers
│   ├── services/              # Business logic
│   ├── socket/index.js        # WebSocket auth + events
│   └── routes/index.js        # API routes
│
└── frontend/
    └── src/
        ├── App.jsx            # Auth gate (login vs dashboard)
        ├── components/
        │   ├── LoginPage.jsx
        │   ├── Dashboard.jsx
        │   ├── FleetMap.jsx
        │   ├── RobotCard.jsx
        │   └── ...
        ├── hooks/
        │   ├── useAuth.js
        │   └── useFleetSocket.js
        └── lib/
            ├── auth.js
            └── socket.js
```

---

## MySQL + Docker

The project uses **MySQL 8** running in Docker. Backend connects on port **3307** (mapped from container `3306`).

```mermaid
flowchart LR
    subgraph Docker
        DB[(robodash-db\nmysql:8.0)]
    end

    subgraph Host
        BE[Express Backend\n:3000]
        MY[MySQL Workbench\n:3307]
    end

    BE -->|mysql2 pool| DB
    MY -->|TCP 3307| DB
```

### Docker Compose (recommended)

```bash
# Start MySQL
docker compose up -d

# Check status
docker ps
# → robodash-db   0.0.0.0:3307->3306/tcp
```

### Manual Docker (alternative)

```bash
docker run -d --name robodash-db \
  -e MYSQL_ROOT_PASSWORD=password123 \
  -e MYSQL_DATABASE=robodash \
  -p 3307:3306 \
  -v robodash_mysql_data:/var/lib/mysql \
  mysql:8.0
```

### Connection Details

| Setting | Value |
|---------|-------|
| Container | `robodash-db` |
| Image | `mysql:8.0` |
| Host port | `3307` |
| User | `root` |
| Password | `password123` |
| Database | `robodash` |

### Database Tables

| Table | Purpose |
|-------|---------|
| `robots` | Fleet registry — 10 EU robots |
| `telemetry_data` | Live telemetry snapshots (every sim tick) |
| `system_logs` | Connection events, status changes, commands |

### Schema Setup

```bash
cd backend
npm run db:setup
# password: password123
```

Or via MySQL Workbench / CLI:

```bash
mysql -u root -p -P 3307 -h 127.0.0.1 < backend/schema.sql
```

`schema.sql` handles both **fresh install** and **existing DB upgrade** (adds missing columns safely).

### Useful Docker Commands

```bash
docker compose up -d          # start DB
docker compose down           # stop DB
docker compose logs db        # view MySQL logs
docker exec -it robodash-db mysql -u root -ppassword123 robodash
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop (for MySQL)

### 1 · Database

```bash
docker compose up -d
cd backend && npm run db:setup
```

### 2 · Backend

```bash
cd backend
npm install
npm start
# → http://localhost:3000
```

### 3 · Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | admin |
| `operator` | `op123` | operator |
| `viewer` | `view123` | viewer |

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | — | Get JWT token |
| `GET` | `/api/health` | — | Server + sim status |
| `GET` | `/api/fleet` | — | Robot registry |
| `GET` | `/api/telemetry-history` | — | Historical telemetry |
| `GET` | `/api/logs` | — | System logs |
| `POST` | `/api/robots/:id/command` | operator, admin | Send robot command |

**Command body:**
```json
{ "action": "start_clean" }
```
Actions: `start_clean` · `stop` · `return_home`

---

## WebSocket Events

| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `robot:command` | `{ robotId, action }` |
| Server → Client | `telemetry` | `{ id, battery, status, lat, lng, ... }` |
| Server → Client | `system:log` | `{ level, source, message, ... }` |
| Server → Client | `fleet:init` | `{ robots, countries }` |
| Server → Client | `command:ack` | `{ robotId, action, ok }` |

**Connect:** `io(url, { query: { token: JWT } })`

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend port |
| `DB_HOST` | `127.0.0.1` | MySQL host |
| `DB_PORT` | `3307` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | `password123` | MySQL password |
| `DB_NAME` | `robodash` | Database name |
| `JWT_SECRET` | `robodash-dev-secret` | JWT signing key |
| `ROBOT_TOKEN` | `robot-secret-key` | Real robot socket auth |
| `ENABLE_SIMULATOR` | `true` | Built-in sim on/off |
| `SIM_INTERVAL_MS` | `5000` | Sim tick interval |

**Production:**
```bash
ENABLE_SIMULATOR=false npm run start:prod
```

---

## Robot Status State Machine

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> cleaning : auto / start_clean
    cleaning --> idle : job done / stop
    cleaning --> charging : battery low
    cleaning --> error : water low
    charging --> idle : battery full
    error --> idle : auto recovery
    idle --> cleaning : return_home resets position
```

---

## Production Path

This repo is a **working HMI demo**. In production:

```
ROS Robot → rosbridge_suite → adapter → RoboDash Socket.io
```

- `simulation.js` is replaced by real robot telemetry
- `ENABLE_SIMULATOR=false` disables the built-in sim
- Same telemetry contract — dashboard code stays unchanged

---

## Tech Stack

```
React 19 · Vite · Mantine · Leaflet
Express 5 · Socket.io · MySQL2 · JWT
```

---

## Deploy to Production

Vercel alone cannot run this backend (WebSocket + MySQL). Use **GitHub → two services**:

```mermaid
flowchart LR
    GH[GitHub Repo]
    GH --> V[Vercel\nfrontend/]
    GH --> R[Railway\nbackend/]
    R --> DB[(Railway MySQL)]
    V -->|VITE_API_URL| R
```

### Step 1 · Push to GitHub

```bash
cd mernstack_RoboDash
git init
git add .
git commit -m "RoboDash fleet dashboard"
git remote add origin https://github.com/YOUR_USER/RoboDash.git
git push -u origin main
```

### Step 2 · Backend on Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select repo → set **Root Directory** to `backend`
3. Add **MySQL** plugin → Railway injects `MYSQL_*` vars
4. Set environment variables:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `${{MYSQLHOST}}` or Railway MySQL host |
| `DB_PORT` | `${{MYSQLPORT}}` |
| `DB_USER` | `${{MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MYSQLPASSWORD}}` |
| `DB_NAME` | `robodash` |
| `JWT_SECRET` | random strong string |
| `FRONTEND_URL` | *(add after Vercel deploy)* |

5. Deploy → copy public URL: `https://robodash-backend.up.railway.app`
6. Run schema once (Railway MySQL shell or local mysql client pointed at Railway)

### Step 3 · Frontend on Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo
2. Set **Root Directory** to `frontend`
3. Environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://robodash-backend.up.railway.app` |

4. Deploy → copy URL: `https://robodash.vercel.app`

### Step 4 · Link them

Back on Railway, set:

```
FRONTEND_URL=https://robodash.vercel.app
```

Redeploy backend. Done — open Vercel URL.

> **What you remember from before:** Vercel pulls from GitHub on every push — that's correct. But for full-stack apps, backend usually lives on Railway/Render, not Vercel.

---

## License

ISC — demo / portfolio project.
