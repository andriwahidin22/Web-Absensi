import { api } from '@/config/api';

interface ReportParams {
  startDate: string;
  endDate: string;
  divisi?: string;
  reportType: 'kehadiran' | 'keterlambatan' | 'rekap-bulanan' | 'absensi-detail';
}

interface ReportData {
  kehadiran?: {
    nama: string;
    divisi: string;
    hadir: number;
    izin: number;
    alpha: number;
    persentase: number;
  }[];
  keterlambatan?: {
    nama: string;
    divisi: string;
    totalTelat: number;
    rataWaktu: string;
    maksimal: string;
  }[];
  summary: {
    totalKaryawan: number;
    hadirHariIni: number;
    telatHariIni: number;
    izinHariIni: number;
    alphaHariIni: number;
    persentaseKehadiran: number;
  };
}

export const reportService = {
  async generateReport(params: ReportParams): Promise<ReportData> {
    try {
      // Get attendance data for the date range
      const absensiResponse = await api.get('/absensi', {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          divisi: params.divisi
        }
      });

      // Get employee data
      const karyawanResponse = await api.get('/karyawan', {
        params: { divisi: params.divisi }
      });

      const absensiData = absensiResponse.data;
      const karyawanData = karyawanResponse.data;

      // Process data based on report type
      const processedData = this.processReportData(absensiData, karyawanData, params.reportType);
      
      return processedData;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  processReportData(absensiData: any[], karyawanData: any[], reportType: string): ReportData {
    const result: ReportData = {
      summary: {
        totalKaryawan: karyawanData.length,
        hadirHariIni: 0,
        telatHariIni: 0,
        izinHariIni: 0,
        alphaHariIni: 0,
        persentaseKehadiran: 0
      }
    };

    // Calculate attendance summary
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = absensiData.filter(a => 
      a.tanggal.split('T')[0] === today
    );

    result.summary.hadirHariIni = todayAttendance.filter(a => a.status === 'HADIR').length;
    result.summary.telatHariIni = todayAttendance.filter(a => a.status === 'TELAT').length;
    result.summary.izinHariIni = todayAttendance.filter(a => a.status === 'IZIN').length;
    result.summary.alphaHariIni = karyawanData.length - todayAttendance.length;
    result.summary.persentaseKehadiran = karyawanData.length > 0 
      ? Math.round((todayAttendance.length / karyawanData.length) * 100) 
      : 0;

    // Process specific report types
    if (reportType === 'kehadiran') {
      result.kehadiran = karyawanData.map(karyawan => {
        const attendanceCount = absensiData.filter(a => 
          a.karyawanId === karyawan.id
        );
        
        const hadir = attendanceCount.filter(a => a.status === 'HADIR').length;
        const izin = attendanceCount.filter(a => a.status === 'IZIN').length;
        const totalDays = attendanceCount.length;
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
        const lateAttendance = absensiData.filter(a => 
          a.karyawanId === karyawan.id && a.status === 'TELAT'
        );

        return {
          nama: karyawan.nama,
          divisi: karyawan.divisi,
          totalTelat: lateAttendance.length,
          rataWaktu: lateAttendance.length > 0 ? '15 menit' : '0 menit',
          maksimal: lateAttendance.length > 0 ? '45 menit' : '0 menit'
        };
      }).filter(item => item.totalTelat > 0);
    }

    return result;
  },

  async exportPDF(params: ReportParams): Promise<Blob> {
    try {
      const response = await api.post('/reports/export/pdf', params, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  },

  async exportCSV(params: ReportParams): Promise<Blob> {
    try {
      const response = await api.post('/reports/export/csv', params, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }
};