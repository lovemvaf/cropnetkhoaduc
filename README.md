# CROPNET – Sàn Thương Mại Điện Tử Nông Sản Việt Nam (D2C)

CROPNET là sàn thương mại điện tử nông sản Việt Nam vận hành theo mô hình D2C (Direct to Consumer) giúp kết nối trực tiếp nông trại/hợp tác xã tới tay người tiêu dùng. Hệ thống hỗ trợ minh bạch hóa nguồn gốc nông sản bằng mã QR Code, tự động gán nhãn chứng nhận chất lượng (VietGAP, GlobalGAP, HACCP, ISO 22000), theo dõi lộ trình vận tải lạnh, và xử lý khiếu nại chất lượng.

---

## 1. Project Overview & Tech Stack

### Technology Stack
* **Monorepo Manager**: NPM Workspaces
* **Frontend Component Wrapper**: `@cropnet/ui`
* **Frontend Web App**: Next.js 15 (App Router), Tailwind CSS, Zustand, Axios, Lucide React
* **Backend API Gateway**: Node.js Express, TypeScript, Socket.io (Realtime Events)
* **Database & ORM**: PostgreSQL, Prisma ORM
* **Production Logs**: Winston Logger
* **Security & Access Control**: JWT Secure Cookie Flow, Helmet, Express Rate Limit, Express Validator

---

## 2. Monorepo Folder Structure

```text
cropnet-monorepo/
├── apps/
│   ├── web/               # Next.js 15 Frontend
│   │   ├── Dockerfile     # Multi-stage production build configuration
│   │   └── src/           # Pages, components, api services, and store states
│   └── server/            # Express TypeScript Backend
│       ├── Dockerfile     # Build pipeline configuration
│       ├── logs/          # Server log archives (combined.log, error.log)
│       ├── uploads/       # Uploaded agricultural photos and certificates
│       └── src/           # Modules (auth, product, order, traceability, analytics, forum)
├── packages/
│   ├── config/            # Shared TypeScript compiler config templates
│   ├── types/             # Shared TypeScript types & interfaces
│   ├── ui/                # Shared atomic layout wrappers (Card, Drawer, ConfirmDialog)
│   └── utils/             # Reusable helper functions (currency format, date parser)
├── scripts/
│   ├── db-backup.sh       # Database daily backup script (Linux/macOS)
│   └── db-backup.ps1      # Database daily backup script (Windows PowerShell)
├── docker-compose.yml     # Local/Production database and app cluster configuration
└── README.md              # Project reference documentation
```

---

## 3. Environment Configuration Matrix

The system splits variables to follow security best practices. Copy `.env.example` templates to start local environments.

### 🌐 Frontend Environment Variables (`apps/web/.env`)
* `NEXT_PUBLIC_API_URL`: Points to backend gateway `/api` (Default: `http://localhost:5000/api`).
* `NEXT_PUBLIC_APP_URL`: Next.js client origin (Default: `http://localhost:3000`).

### 🔌 Backend Environment Variables (`apps/server/.env`)
* `DATABASE_URL`: PostgreSQL connection string.
* `PORT`: Server listening port (Default: `5000`).
* `BACKEND_URL`: URL origin of the backend, used to generate dynamic download URLs.
* `JWT_SECRET`: Crypto signature key for short-lived sessions.
* `JWT_EXPIRES_IN`: Session lifespan (Default: `1d`).
* `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`: Media credentials.
* `MOMO_PARTNER_CODE` / `MOMO_ACCESS_KEY` / `MOMO_SECRET_KEY`: MoMo sandbox configuration.

---

## 4. Database Setup & Production Safety

CROPNET runs on PostgreSQL. Prisma ORM handles type generation and schema mappings.

### Seeding Rules & Protection
The database seed script (`apps/server/src/database/seed.ts`) contains safeguards:
1. **Development/Test**: Running the seed script clears database tables to populate clean sample accounts and products.
2. **Production**: Database wipes are **disabled** (`NODE_ENV === 'production'`). The script queries `prisma.user.count()` and immediately halts if accounts exist, preventing data loss.

### Running Migration and Seeding
```bash
# Apply migrations to database
npm run db:migrate

# Populate base data
npm run db:seed
```

---

## 5. Development Guide (Local Setup)

Follow these steps to compile and launch the project:

### Step 1: Install Dependencies
Run the installation command in the monorepo root:
```bash
npm install --legacy-peer-deps
```

### Step 2: Configure Local Files
1. Copy [apps/web/.env.example](file:///c:/Users/asus/Desktop/CROPNET/apps/web/.env.example) to `.env` in `/apps/web/`.
2. Copy [apps/server/.env.example](file:///c:/Users/asus/Desktop/CROPNET/apps/server/.env.example) to `.env` in `/apps/server/`.

### Step 3: Run Dev Servers
Start both servers concurrently using the workspace scripts:
```bash
# Terminal 1: Backend API
npm run dev:server

# Terminal 2: Next.js Web App
npm run dev:web
```

---

## 6. Production Deployment Guide (Docker)

CROPNET is ready to be launched via Docker Compose.

### Step 1: Build & Launch Services
Launch PostgreSQL, Express API gateway, and Next.js cluster using Compose:
```bash
docker compose up --build -d
```
The database will wait for health validation before linking to the backend server. Static uploads and server logs are persistent on volumes.

### Step 2: Run Migrations on the Container
Deploy PostgreSQL schema inside the backend container:
```bash
docker compose exec backend npx prisma db push
```

---

## 7. Database Backup & Restore Operations

Automated daily backup scripts are provided under the `/scripts/` folder.

### 📅 Backup Strategy
Run backup scripts to query the current `DATABASE_URL` configurations, execute `pg_dump`, export `.sql` snapshots to `backups/`, and purge snapshots older than 7 days:
* **Linux/macOS Crontab schedule**: `bash ./scripts/db-backup.sh`
* **Windows Task scheduler**: Powershell execution of `.\scripts\db-backup.ps1`

### 🔄 Database Restoration
Restore a database schema snapshot using the standard psql utility:
```bash
# Restore file to postgres
psql -U postgres -d cropnet -f backups/cropnet_backup_YYYYMMDD_HHMMSS.sql
```

---

## 8. Winston Logging & Audits

Telemetry tracking is integrated through a centralized Winston logger (`apps/server/src/utils/logger.ts`):
* **API Audit & Transactions**: Logged dynamically by `logger.middleware.ts` tracking IP, user ID, role, duration, path, and method, saved to `/logs/combined.log`.
* **System Errors & Crashes**: Centralized in `error.middleware.ts` mapping stack traces and query values to `/logs/error.log`.
* **Console Spam Protection**: Console printing is restricted to local development environments (`NODE_ENV !== 'production'`), ensuring logs are kept clean.

---

## 9. Platform Role Privilege Matrix

| Role ID | Account Email | Privileges & Actions |
| --- | --- | --- |
| **ADMIN** | `admin@cropnet.vn` | Wipes disputes, verifies farm supplier registrations, audits overall stats, moderates forum post flags. |
| **CUSTOMER** | `khachhang@gmail.com` | Adds products to shopping cart, checkouts via MoMo or COD, views order history, submits disputes, rates reviews. |
| **FARMER** | `farmer@nongnghiep.vn` | Creates products, registers trace batches, assigns harvest QR codes to items, updates order processing logs, replies to reviews. |
| **LOGISTICS** | `logistics@cropnet.vn` | Updates shipping milestones, enters carrier plates and estimated delivery times, executes delivery verification logs. |
| **INSPECTOR** | `inspector@cropnet.vn` | Moderates batch certificates, uploads test reports, registers VietGAP/GlobalGAP image documents. |

All accounts default to password `123456`.
