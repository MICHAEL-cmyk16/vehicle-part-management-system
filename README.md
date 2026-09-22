# Vehicle Part Management System

A professional DBMS + automotive web project based on the project concept:
QR-based part identification, repair manuals, CAD references, and digital service history.

## Stack
- Frontend: React + Vite + CSS
- Backend: Node.js + Express
- Database: MySQL
- QR: `qrcode` and `html5-qrcode`
- CAD demo: Three.js (`@react-three/fiber` + `@react-three/drei`)

## 1. Database
Open MySQL Workbench and run:

`database/schema.sql`

This creates the database, tables, relationships and sample data.

## 2. Backend
```bash
cd backend
npm install
npm run dev
```

Edit `.env` with your MySQL credentials.

## 3. Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite.

## Demo login
Admin:
- admin@autopart.local
- admin123

Mechanic:
- mechanic@autopart.local
- mechanic123

Owner:
- owner@autopart.local
- owner123

The passwords are demo-only. For a production system, passwords must be hashed and secrets must be stored securely.


## Enhanced final-year-project features
- Public-style automotive landing/login screen
- Admin CRUD for vehicles and parts
- Vehicle image upload
- Technical manual upload
- CAD file upload
- Working QR generation API
- Camera QR scanning
- Digital service history
- Maintenance schedule
- CAD Studio
- Demo 3D-style assemblies

### Real 3D car models
For actual 3D cars, put `.glb`/`.gltf` files under `frontend/public/models/`.
You can then load them with Three.js / React Three Fiber. The project intentionally does not bundle third-party copyrighted vehicle CAD assets. Use models you own, create yourself, or have permission to use.
