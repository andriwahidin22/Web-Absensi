# Sistem Absensi Backend

Backend API untuk sistem absensi PT Sysware menggunakan Node.js, Express, Prisma, dan PostgreSQL.

## Setup Development

1. Clone repository dan masuk ke folder backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Edit file `.env` dengan konfigurasi database PostgreSQL Anda

5. Migrate database dan generate Prisma client:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Seed database dengan data awal:
```bash
npm run db:seed
```

7. Jalankan development server:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5001`

## Scripts

- `npm run dev` - Jalankan development server dengan nodemon
- `npm run start` - Jalankan production server
- `npm run db:migrate` - Jalankan migrasi database
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database dengan data awal

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user baru

### Karyawan
- `GET /api/karyawan` - Ambil semua data karyawan
- `GET /api/karyawan/:id` - Ambil data karyawan berdasarkan ID
- `POST /api/karyawan` - Tambah karyawan baru (Admin only)
- `PUT /api/karyawan/:id` - Update data karyawan (Admin only)
- `DELETE /api/karyawan/:id` - Hapus karyawan (Admin only)
- `GET /api/karyawan/:id/qrcode` - Generate QR code karyawan

### Absensi
- `GET /api/absensi` - Ambil data absensi
- `POST /api/absensi` - Catat absensi (check in/out)
- `GET /api/absensi/stats` - Statistik absensi

### SP (Surat Peringatan)
- `GET /api/sp` - Ambil data SP
- `POST /api/sp` - Buat SP baru (Admin only)
- `PUT /api/sp/:id` - Update status SP (Admin only)

## Environment Variables

```env
NODE_ENV=development
PORT=5001
DATABASE_URL="postgresql://username:password@localhost:5432/absensi_db"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:8080,http://127.0.0.1:8080"
```

## Database Schema

Database menggunakan PostgreSQL dengan tabel:
- `users` - Data pengguna admin/bos
- `karyawan` - Data karyawan  
- `absensi` - Record absensi karyawan
- `sp` - Surat peringatan karyawan

## Features

- JWT-based authentication
- Role-based access control (ADMIN/BOS)
- File upload untuk foto karyawan
- QR Code generation untuk ID card
- Absensi dengan QR scanner dan manual input
- Statistik dan reporting