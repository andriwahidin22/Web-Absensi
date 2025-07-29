
const { validationResult } = require('express-validator');
const prisma = require('../config/database');

const createAbsensi = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { qrCode, manualCode } = req.body;
    
    // Find karyawan by QR code or manual code
    let karyawan;
    if (qrCode) {
      karyawan = await prisma.karyawan.findFirst({
        where: {
          qrCode: {
            contains: qrCode
          }
        }
      });
    } else if (manualCode) {
      karyawan = await prisma.karyawan.findFirst({
        where: {
          OR: [
            { nip: manualCode },
            { qrCode: { contains: manualCode } }
          ]
        }
      });
    }

    if (!karyawan) {
      return res.status(404).json({ error: 'Karyawan not found' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        karyawanId: karyawan.id,
        tanggal: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const now = new Date();
    const currentTime = new Date();

    if (existingAbsensi) {
      // Check out
      if (existingAbsensi.waktuKeluar) {
        return res.status(400).json({ error: 'Already checked out today' });
      }

      const updatedAbsensi = await prisma.absensi.update({
        where: { id: existingAbsensi.id },
        data: { waktuKeluar: currentTime },
        include: {
          karyawan: {
            select: {
              nama: true,
              jabatan: true,
              divisi: true
            }
          }
        }
      });

      res.json({
        ...updatedAbsensi,
        type: 'checkout',
        message: 'Check out berhasil'
      });
    } else {
      // Check in
      const workStartTime = new Date();
      workStartTime.setHours(8, 0, 0, 0); // 08:00

      let status = 'HADIR';
      if (currentTime > workStartTime) {
        status = 'TELAT';
      }

      const newAbsensi = await prisma.absensi.create({
        data: {
          karyawanId: karyawan.id,
          tanggal: today,
          waktuMasuk: currentTime,
          status
        },
        include: {
          karyawan: {
            select: {
              nama: true,
              jabatan: true,
              divisi: true
            }
          }
        }
      });

      res.status(201).json({
        ...newAbsensi,
        type: 'checkin',
        message: 'Check in berhasil'
      });
    }
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
  getAllAbsensi,
  createAbsensi,
  getAbsensiStats
};
