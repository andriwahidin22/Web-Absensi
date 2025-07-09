
import api from '../config/api';

export interface AbsensiData {
  qrCode: string;
}

export interface Karyawan {
  id: string;
  nama: string;
  jabatan: string;
  divisi: string;
  foto?: string;
}

export interface AbsensiResponse {
  message: string;
  karyawan: Karyawan;
  absensi: {
    id: string;
    waktuMasuk: string;
    status: string;
  };
}

export interface AbsensiStats {
  totalKaryawan: number;
  absenHariIni: number;
  karyawanTelat: number;
  spAktif: number;
}

export const absensiService = {
  processAbsensi: async (data: AbsensiData): Promise<AbsensiResponse> => {
    const response = await api.post('/absensi', data);
    return response.data;
  },

  getStats: async (): Promise<AbsensiStats> => {
    const response = await api.get('/absensi/stats');
    return response.data;
  },

  getAbsensiList: async (params?: {
    tanggal?: string;
    divisi?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/absensi', { params });
    return response.data;
  }
};
