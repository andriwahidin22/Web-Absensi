import { api } from '@/config/api';

interface SPData {
  karyawanId: string;
  alasan: string;
}

interface SPResponse {
  id: string;
  karyawanId: string;
  alasan: string;
  tanggal: string;
  status: 'AKTIF' | 'SELESAI';
  karyawan: {
    id: string;
    nama: string;
    jabatan: string;
    divisi: string;
  };
}

export const spService = {
  async getAll(params?: { divisi?: string; status?: string }): Promise<SPResponse[]> {
    try {
      const response = await api.get('/sp', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching SP data:', error);
      throw error;
    }
  },

  async getByKaryawan(karyawanId: string): Promise<SPResponse[]> {
    try {
      const response = await api.get(`/sp/karyawan/${karyawanId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching SP by karyawan:', error);
      throw error;
    }
  },

  async create(data: SPData): Promise<SPResponse> {
    try {
      const response = await api.post('/sp', data);
      return response.data;
    } catch (error) {
      console.error('Error creating SP:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: 'AKTIF' | 'SELESAI'): Promise<SPResponse> {
    try {
      const response = await api.put(`/sp/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating SP status:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/sp/${id}`);
    } catch (error) {
      console.error('Error deleting SP:', error);
      throw error;
    }
  }
};