
# Backend Sistem Absensi PT Sysware

Backend API untuk sistem absensi menggunakan Express.js, Prisma ORM, dan PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
# Create database
createdb absensi_db

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed initial data
npm run db:seed
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Update `.env` dengan konfigurasi database dan JWT secret Anda

5. Create uploads directory:
```bash
mkdir uploads
```

6. Run server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login admin/bos
- `GET /api/auth/profile` - Get user profile

### Karyawan
- `GET /api/karyawan` - Get all karyawan
- `GET /api/karyawan/:id` - Get karyawan by ID
- `POST /api/karyawan` - Create karyawan (Admin only)
- `PUT /api/karyawan/:id` - Update karyawan (Admin only)
- `DELETE /api/karyawan/:id` - Delete karyawan (Admin only)
- `GET /api/karyawan/:id/qrcode` - Generate QR code

### Absensi
- `POST /api/absensi` - Process absensi (Public)
- `GET /api/absensi` - Get absensi list (Auth required)
- `GET /api/absensi/stats` - Get absensi statistics

### Surat Peringatan
- `GET /api/sp` - Get all SP
- `POST /api/sp` - Create SP (Admin only)
- `GET /api/sp/karyawan/:karyawanId` - Get SP by karyawan
- `PUT /api/sp/:id` - Update SP (Admin only)
- `DELETE /api/sp/:id` - Delete SP (Admin only)

## Database Schema

### Users
- id, email, password, role (ADMIN/BOS), divisi

### Karyawan
- id, nip, nama, jabatan, divisi, foto, qrCode

### Absensi
- id, karyawanId, tanggal, waktuMasuk, waktuKeluar, status

### SP (Surat Peringatan)
- id, karyawanId, alasan, tanggal, status

## Features

- JWT Authentication
- Role-based access control
- File upload untuk foto karyawan
- QR Code generation
- Automatic late detection
- Database relationships dengan Prisma
- Input validation
- Error handling
- CORS configuration
