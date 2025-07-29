
const { validationResult } = require('express-validator');
const QRCode = require('qrcode');
const crypto = require('crypto');
const prisma = require('../config/database');

const getAllKaryawan = async (req, res) => {
  try {
    const { divisi } = req.query;
    
    const where = {};
    if (req.user.role === 'BOS' && req.user.divisi) {
      where.divisi = req.user.divisi;
    } else if (divisi) {
      where.divisi = divisi;
    }

    const karyawan = await prisma.karyawan.findMany({
      where,
      include: {
        _count: {
          select: { sp: { where: { status: 'AKTIF' } } }
        }
      },
      orderBy: { nama: 'asc' }
    });

    res.json(karyawan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getKaryawanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
      include: {
        absensi: {
          orderBy: { tanggal: 'desc' },
          take: 10
        },
        sp: {
          where: { status: 'AKTIF' },
          orderBy: { tanggal: 'desc' }
        }
      }
    });

    if (!karyawan) {
      return res.status(404).json({ error: 'Karyawan not found' });
    }

    res.json(karyawan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createKaryawan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nip, nama, jabatan, divisi } = req.body;
    const foto = req.file ? req.file.filename : null;

    // Generate unique QR code data
    const qrData = `${nip}-${crypto.randomBytes(8).toString('hex')}`;
    const qrCodeSvg = await QRCode.toString(qrData, { type: 'svg' });

    const karyawan = await prisma.karyawan.create({
      data: {
        nip,
        nama,
        jabatan,
        divisi,
        foto,
        qrCode: qrCodeSvg
      }
    });

    res.status(201).json(karyawan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateKaryawan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { nama, jabatan, divisi } = req.body;
    const foto = req.file ? req.file.filename : undefined;

    const updateData = { nama, jabatan, divisi };
    if (foto) updateData.foto = foto;

    const karyawan = await prisma.karyawan.update({
      where: { id },
      data: updateData
    });

    res.json(karyawan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteKaryawan = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.karyawan.delete({
      where: { id }
    });

    res.json({ message: 'Karyawan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    
    const karyawan = await prisma.karyawan.findUnique({
      where: { id }
    });

    if (!karyawan) {
      return res.status(404).json({ error: 'Karyawan not found' });
    }

    const qrCodeData = await QRCode.toDataURL(karyawan.qrCode);
    
    res.json({ qrCode: qrCodeData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllKaryawan,
  getKaryawanById,
  createKaryawan,
  updateKaryawan,
  deleteKaryawan,
  generateQRCode
};
