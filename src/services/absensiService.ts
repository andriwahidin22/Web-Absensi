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
      console.log('AbsensiService: Fetching absensi with params:', params);
      
      // Add timeout and better error handling
      const response = await Promise.race([
        api.get('/absensi', { 
          params,
          timeout: 5000 // 5 second timeout
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ]) as any;
      
      console.log('AbsensiService: Response received:', response?.data);
      return response.data;
    } catch (error: any) {
      console.log('AbsensiService: Error occurred:', error?.message || error);
      
      // Return empty array instead of throwing errors to prevent reload loops
      console.log('Returning empty data due to network error');
      return [];
    }
  },

  createAbsensi: async (data: AbsensiData): Promise<AbsensiResponse> => {
    try {
      console.log('AbsensiService: Creating absensi:', data);
      
      const response = await Promise.race([
        api.post('/absensi', data, { timeout: 10000 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]) as any;
      
      console.log('AbsensiService: Absensi created:', response?.data);
      return response.data;
    } catch (error: any) {
      console.log('AbsensiService: Create error:', error?.message || error);
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
      console.log('AbsensiService: Fetching stats with params:', params);
      
      const response = await Promise.race([
        api.get('/absensi/stats', { 
          params,
          timeout: 5000
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ]) as any;
      
      console.log('AbsensiService: Stats received:', response?.data);
      return response.data;
    } catch (error: any) {
      console.log('AbsensiService: Stats error:', error?.message || error);
      // Return empty stats instead of throwing
      return { stats: [], totalKaryawan: 0 };
    }
  }
};