
const { validationResult } = require('express-validator');
const prisma = require('../config/database');

const processAbsensi = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { qrCode } = req.body;

    // Find employee by QR code
    const karyawan = await prisma.karyawan.findUnique({
      where: { qrCode }
    });

    if (!karyawan) {
      return res.status(404).json({ error: 'QR Code tidak valid' });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Check if already absent today
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        karyawanId: karyawan.id,
        tanggal: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingAbsensi) {
      return res.status(400).json({ 
        error: 'Sudah melakukan absensi hari ini',
        absensi: existingAbsensi
      });
    }

    // Determine status (late if after 8 AM)
    const jamMasuk = new Date();
    const jamKerja = new Date();
    jamKerja.setHours(8, 0, 0, 0);

    const status = jamMasuk > jamKerja ? 'TELAT' : 'HADIR';

    // Create absensi record
    const absensi = await prisma.absensi.create({
      data: {
        karyawanId: karyawan.id,
        tanggal: startOfDay,
        waktuMasuk: jamMasuk,
        status
      },
      include: {
        karyawan: true
      }
    });

    res.status(201).json({
      message: 'Absensi berhasil dicatat',
      absensi,
      karyawan: {
        id: karyawan.id,
        nama: karyawan.nama,
        jabatan: karyawan.jabatan,
        divisi: karyawan.divisi,
        foto: karyawan.foto
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllAbsensi = async (req, res) => {
  try {
    const { tanggal, divisi, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    // Role-based filtering
    if (req.user.role === 'BOS' && req.user.divisi) {
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

    const absensi = await prisma.absensi.findMany({
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
      orderBy: { tanggal: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.absensi.count({ where });

    res.json({ absensi, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
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

module.exports = {
  processAbsensi,
  getAllAbsensi,
  getAbsensiStats
};
