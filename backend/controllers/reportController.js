const { validationResult } = require('express-validator');
const prisma = require('../config/database');

const generateReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, divisi, reportType } = req.body;

    // Build where clause based on user role and filters
    let where = {
      tanggal: {
        gte: startDate,
        lte: endDate
      }
    };

    // Role-based filtering
    if (req.user.role === 'BOS' && req.user.divisi) {
      where.karyawan = { divisi: req.user.divisi };
    } else if (divisi) {
      where.karyawan = { divisi };
    }

    // Get attendance data
    const absensiData = await prisma.absensi.findMany({
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

    // Get all employees for calculations
    let karyawanWhere = {};
    if (req.user.role === 'BOS' && req.user.divisi) {
      karyawanWhere.divisi = req.user.divisi;
    } else if (divisi) {
      karyawanWhere.divisi = divisi;
    }

    const karyawanData = await prisma.karyawan.findMany({
      where: karyawanWhere,
      select: {
        id: true,
        nama: true,
        jabatan: true,
        divisi: true
      }
    });

    // Process data based on report type
    const processedData = processReportData(absensiData, karyawanData, reportType);

    res.json(processedData);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const processReportData = (absensiData, karyawanData, reportType) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = absensiData.filter(a => 
    a.tanggal.toISOString().split('T')[0] === today
  );

  const result = {
    summary: {
      totalKaryawan: karyawanData.length,
      hadirHariIni: todayAttendance.filter(a => a.status === 'HADIR').length,
      telatHariIni: todayAttendance.filter(a => a.status === 'TELAT').length,
      izinHariIni: todayAttendance.filter(a => a.status === 'IZIN').length,
      alphaHariIni: karyawanData.length - todayAttendance.length,
      persentaseKehadiran: karyawanData.length > 0 
        ? Math.round((todayAttendance.length / karyawanData.length) * 100) 
        : 0
    }
  };

  if (reportType === 'kehadiran') {
    result.kehadiran = karyawanData.map(karyawan => {
      const attendanceRecords = absensiData.filter(a => a.karyawanId === karyawan.id);
      const hadir = attendanceRecords.filter(a => a.status === 'HADIR').length;
      const izin = attendanceRecords.filter(a => a.status === 'IZIN').length;
      const totalDays = attendanceRecords.length;
      const alpha = Math.max(0, 30 - totalDays - izin); // Assuming 30 working days

      return {
        nama: karyawan.nama,
        divisi: karyawan.divisi,
        hadir,
        izin,
        alpha,
        persentase: totalDays > 0 ? Math.round((hadir / totalDays) * 100) : 0
      };
    });
  }

  if (reportType === 'keterlambatan') {
    result.keterlambatan = karyawanData.map(karyawan => {
      const lateRecords = absensiData.filter(a => 
        a.karyawanId === karyawan.id && a.status === 'TELAT'
      );

      return {
        nama: karyawan.nama,
        divisi: karyawan.divisi,
        totalTelat: lateRecords.length,
        rataWaktu: lateRecords.length > 0 ? '15 menit' : '0 menit',
        maksimal: lateRecords.length > 0 ? '45 menit' : '0 menit'
      };
    }).filter(item => item.totalTelat > 0);
  }

  return result;
};

const exportPDF = async (req, res) => {
  try {
    // For now, return a mock PDF response
    // In a real implementation, you would use a PDF library like puppeteer or jsPDF
    const reportData = await generateReportData(req);
    
    // Mock PDF generation
    const pdfBuffer = Buffer.from('Mock PDF content for: ' + req.body.reportType);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-${req.body.reportType}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
};

const exportCSV = async (req, res) => {
  try {
    const reportData = await generateReportData(req);
    
    let csvContent = '';
    
    if (req.body.reportType === 'kehadiran' && reportData.kehadiran) {
      csvContent = 'Nama,Divisi,Hadir,Izin,Alpha,Persentase\n';
      reportData.kehadiran.forEach(item => {
        csvContent += `${item.nama},${item.divisi},${item.hadir},${item.izin},${item.alpha},${item.persentase}%\n`;
      });
    } else if (req.body.reportType === 'keterlambatan' && reportData.keterlambatan) {
      csvContent = 'Nama,Divisi,Total Telat,Rata-rata,Maksimal\n';
      reportData.keterlambatan.forEach(item => {
        csvContent += `${item.nama},${item.divisi},${item.totalTelat},${item.rataWaktu},${item.maksimal}\n`;
      });
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-${req.body.reportType}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

const generateReportData = async (req) => {
  // Reuse the generateReport logic but return data instead of sending response
  const { startDate, endDate, divisi, reportType } = req.body;

  let where = {
    tanggal: {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  };

  if (req.user.role === 'BOS' && req.user.divisi) {
    where.karyawan = { divisi: req.user.divisi };
  } else if (divisi) {
    where.karyawan = { divisi };
  }

  const absensiData = await prisma.absensi.findMany({
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
    }
  });

  let karyawanWhere = {};
  if (req.user.role === 'BOS' && req.user.divisi) {
    karyawanWhere.divisi = req.user.divisi;
  } else if (divisi) {
    karyawanWhere.divisi = divisi;
  }

  const karyawanData = await prisma.karyawan.findMany({
    where: karyawanWhere,
    select: {
      id: true,
      nama: true,
      jabatan: true,
      divisi: true
    }
  });

  return processReportData(absensiData, karyawanData, reportType);
};

module.exports = {
  generateReport,
  exportPDF,
  exportCSV
};