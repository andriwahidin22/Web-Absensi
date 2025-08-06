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
    try {
      const response = await api.get('/absensi', { 
        params,
        timeout: 5000
      });
      return response.data;
    } catch (error: any) {
      // Return empty array instead of throwing to prevent loops
      return [];
    }
  },

  createAbsensi: async (data: AbsensiData): Promise<AbsensiResponse> => {
    try {
      const response = await Promise.race([
        api.post('/absensi', data, { timeout: 8000 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 8000)
        )
      ]) as any;
      
      return response.data;
    } catch (error: any) {
      // Return error instead of throwing to prevent crashes
      return { error: error?.message || 'Failed to create absensi' } as any;
    }
  },

  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
    divisi?: string;
  }): Promise<AbsensiStats> => {
    try {
      const response = await Promise.race([
        api.get('/absensi/stats', { 
          params,
          timeout: 5000
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ]) as any;
      
      return response.data;
    } catch (error: any) {
      // Return empty stats instead of throwing
      return { stats: [], totalKaryawan: 0 };
    }
  }
};