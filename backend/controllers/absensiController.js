//backend/controllers/absensiController.js


const { validationResult } = require('express-validator');
const prisma = require('../config/database');

const createAbsensi = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { qrCode, manualCode } = req.body;
    
    // Enhanced employee finding with QR code and NIP support
    let karyawan;
    if (qrCode) {
      const searchKey = qrCode.includes('-') ? qrCode.split('-')[0] : qrCode;
      
      karyawan = await prisma.karyawan.findFirst({
        where: {
          OR: [
            { qrCode: qrCode },
            { nip: searchKey }
          ]
        }
      });
    } else if (manualCode) {
      karyawan = await prisma.karyawan.findFirst({
        where: {
          OR: [
            { nip: manualCode },
            { qrCode: manualCode }
          ]
        }
      });
    }

    if (!karyawan) {
      const searchValue = qrCode || manualCode;
      const cleanNIP = searchValue.includes('-') ? searchValue.split('-')[0] : searchValue;
      
      return res.status(404).json({ 
        error: 'Karyawan tidak ditemukan',
        details: `NIP/Code ${cleanNIP} tidak terdaftar`
      });
    }

    // Attendance logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.absensi.findFirst({
      where: {
        karyawanId: karyawan.id,
        tanggal: { gte: today, lt: tomorrow }
      }
    });

    const now = new Date();
    const isCheckIn = !existing;

    if (isCheckIn) {
      const status = now.getHours() >= 8 ? 'TELAT' : 'HADIR';
      const newAbsensi = await prisma.absensi.create({
        data: {
          karyawanId: karyawan.id,
          tanggal: today,
          waktuMasuk: now,
          status
        }
      });

      return res.status(201).json({
        ...newAbsensi,
        karyawan: pick(karyawan, ['nama', 'jabatan', 'divisi']),
        type: 'checkin',
        message: 'Check in berhasil'
      });
    } else {
      if (existing.waktuKeluar) {
        return res.status(400).json({ error: 'Anda sudah check out hari ini' });
      }

      const updated = await prisma.absensi.update({
        where: { id: existing.id },
        data: { waktuKeluar: now }
      });

      return res.json({
        ...updated,
        karyawan: pick(karyawan, ['nama', 'jabatan', 'divisi']),
        type: 'checkout',
        message: 'Check out berhasil'
      });
    }
  } catch (error) {
    console.error('Attendance error:', error);
    return res.status(500).json({ 
      error: 'System error',
      details: 'Silakan coba lagi atau hubungi admin'
    });
  }
};

const getAllAbsensi = async (req, res) => {
  try {
    const { tanggal, divisi, limit = 50, offset = 0 } = req.query;
    
    // Add cache control headers to prevent excessive requests
    res.set({
      'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      'ETag': `"absensi-${tanggal}-${Date.now()}"`,
    });
    
    const where = {};
    
    // Role-based filtering - check if req.user exists
    if (req.user && req.user.role === 'BOS' && req.user.divisi) {
      where.karyawan = { divisi: req.user.divisi };
    } else if (divisi) {
      where.karyawan = { divisi };
    }

    // Date filtering
    if (tanggal) {
      const date = new Date(tanggal);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      
      where.tanggal = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    // Use timeout wrapper for database operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database timeout')), 3000);
    });

    try {
      const [absensi, total] = await Promise.race([
        Promise.all([
          prisma.absensi.findMany({
            where,
            include: {
              karyawan: {
                select: {
                  id: true,
                  nama: true,
                  jabatan: true,
                  divisi: true,
                  foto: true
                }
              }
            },
            orderBy: [
              { tanggal: 'desc' },
              { waktuMasuk: 'desc' }
            ],
            take: parseInt(limit),
            skip: parseInt(offset)
          }),
          prisma.absensi.count({ where })
        ]),
        timeoutPromise
      ]);

      res.json({ 
        absensi: absensi, 
        total,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + absensi.length) < total
        }
      });
    } catch (dbError) {
      console.log('Database error or timeout, sending minimal static data');
      
      // Return minimal consistent data to prevent UI flickering
      const currentDate = tanggal || new Date().toISOString().split('T')[0];
      
      res.json({ 
        absensi: [], // Return empty array instead of mock data
        total: 0,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: false
        }
      });
    }
  } catch (error) {
    console.error('getAllAbsensi error:', error);
    res.status(500).json({ 
      error: 'Server error',
      absensi: [],
      total: 0,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: false
      }
    });
  }
};

const getAbsensiStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const where = {};
    if (req.user.role === 'BOS' && req.user.divisi) {
      where.karyawan = { divisi: req.user.divisi };
    }

    const [totalKaryawan, absenHariIni, karyawanTelat, spAktif] = await Promise.all([
      prisma.karyawan.count({ where: req.user.role === 'BOS' ? { divisi: req.user.divisi } : {} }),
      prisma.absensi.count({
        where: {
          ...where,
          tanggal: { gte: startOfDay, lte: endOfDay }
        }
      }),
      prisma.absensi.count({
        where: {
          ...where,
          tanggal: { gte: startOfDay, lte: endOfDay },
          status: 'TELAT'
        }
      }),
      prisma.sp.count({
        where: {
          status: 'AKTIF',
          ...(req.user.role === 'BOS' ? { karyawan: { divisi: req.user.divisi } } : {})
        }
      })
    ]);

    res.json({
      totalKaryawan,
      absenHariIni,
      karyawanTelat,
      spAktif
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj[key]) acc[key] = obj[key];
    return acc;
  }, {});
}

module.exports = {
  getAllAbsensi,
  createAbsensi,
  getAbsensiStats
};
