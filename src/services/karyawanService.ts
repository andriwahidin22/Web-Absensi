//src/services/absensiService.ts


import api from '../config/api';

export interface KaryawanData {
  nip: string;
  nama: string;
  jabatan: string;
  divisi: string;
  foto?: File;
}

export interface KaryawanResponse {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  divisi: string;
  foto?: string;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
}

export const karyawanService = {
  getAll: async (params?: { divisi?: string }): Promise<KaryawanResponse[]> => {
    console.log('Fetching karyawan with params:', params);
    const response = await api.get('/karyawan', { params });
    console.log('Karyawan response:', response.data);
    return response.data;
  },

  getById: async (id: string): Promise<KaryawanResponse> => {
    const response = await api.get(`/karyawan/${id}`);
    return response.data;
  },

  create: async (data: KaryawanData): Promise<KaryawanResponse> => {
    const formData = new FormData();
    formData.append('nip', data.nip);
    formData.append('nama', data.nama);
    formData.append('jabatan', data.jabatan);
    formData.append('divisi', data.divisi);
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    const response = await api.post('/karyawan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<KaryawanData>): Promise<KaryawanResponse> => {
    const formData = new FormData();
    if (data.nama) formData.append('nama', data.nama);
    if (data.jabatan) formData.append('jabatan', data.jabatan);
    if (data.divisi) formData.append('divisi', data.divisi);
    if (data.foto) formData.append('foto', data.foto);

    const response = await api.put(`/karyawan/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/karyawan/${id}`);
  },

  generateQRCode: async (id: string): Promise<{ qrCode: string }> => {
    console.log('Generating QR code for karyawan ID:', id);
    const response = await api.get(`/karyawan/${id}/qrcode`);
    console.log('QR code response:', response.data);
    return response.data;
  }
};
