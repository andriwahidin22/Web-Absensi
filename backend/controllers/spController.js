
const { validationResult } = require('express-validator');
const prisma = require('../config/database');

const createSP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { karyawanId, alasan } = req.body;

    const sp = await prisma.sp.create({
      data: {
        karyawanId,
        alasan
      },
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
            jabatan: true,
            divisi: true
          }
        }
      }
    });

    res.status(201).json(sp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getSPByKaryawan = async (req, res) => {
  try {
    const { karyawanId } = req.params;

    const sp = await prisma.sp.findMany({
      where: { karyawanId },
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
            jabatan: true,
            divisi: true
          }
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    res.json(sp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllSP = async (req, res) => {
  try {
    const { status = 'AKTIF', divisi } = req.query;
    
    const where = { status };
    
    if (req.user.role === 'BOS' && req.user.divisi) {
      where.karyawan = { divisi: req.user.divisi };
    } else if (divisi) {
      where.karyawan = { divisi };
    }

    const sp = await prisma.sp.findMany({
      where,
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
            jabatan: true,
            divisi: true
          }
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    res.json(sp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateSP = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const sp = await prisma.sp.update({
      where: { id },
      data: { status },
      include: {
        karyawan: {
          select: {
            id: true,
            nama: true,
            jabatan: true,
            divisi: true
          }
        }
      }
    });

    res.json(sp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteSP = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.sp.delete({
      where: { id }
    });

    res.json({ message: 'SP deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createSP,
  getSPByKaryawan,
  getAllSP,
  updateSP,
  deleteSP
};
