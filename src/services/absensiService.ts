import api from '../config/api';

export interface AbsensiData {
  qrCode?: string;
  manualCode?: string;
}

export interface AbsensiResponse {
  id: string;
  karyawanId: string;
  tanggal: string;
  waktuMasuk: string;
  waktuKeluar?: string;
  status: 'HADIR' | 'TELAT' | 'IZIN' | 'ALPHA';
  keterangan?: string;
  type: 'checkin' | 'checkout';
  message: string;
  karyawan: {
    nama: string;
    jabatan: string;
    divisi: string;
  };
}

export interface AbsensiStats {
  stats: Array<{
    status: string;
    _count: {
      status: number;
    };
  }>;
  totalKaryawan: number;
}

export interface AbsensiListResponse {
  absensi: AbsensiResponse[];
  total: number;
  pagination?: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const absensiService = {
  getAll: async (params?: { 
    tanggal?: string; 
    karyawanId?: string; 
    divisi?: string;
  }): Promise<AbsensiListResponse | AbsensiResponse[]> => {
    console.log('Fetching absensi with params:', params);
    const response = await api.get('/absensi', { params });
    console.log('Absensi response:', response.data);
    return response.data;
  },

  createAbsensi: async (data: AbsensiData): Promise<AbsensiResponse> => {
    const response = await api.post('/absensi', data);
    return response.data;
  },

  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
    divisi?: string;
  }): Promise<AbsensiStats> => {
    const response = await api.get('/absensi/stats', { params });
    return response.data;
  }
};