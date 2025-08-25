//src/services/absensiService.ts

import api from "../config/api";

interface KaryawanData {
  nama: string;
  jabatan: string;
  divisi: string;
  nip?: string;
  foto?: string;
  id?: string;
}

export interface AbsensiResponse {
  id: string;
  karyawanId: string;
  tanggal: string;
  waktuMasuk: string;
  waktuKeluar?: string;
  status: "HADIR" | "TELAT" | "IZIN" | "ALPHA";
  keterangan?: string;
  type?: "checkin" | "checkout";
  message?: string;
  karyawan: KaryawanData;
}

export interface AbsensiListResponse {
  absensi: AbsensiResponse[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface AbsensiStats {
  totalKaryawan: number;
  absenHariIni: number;
  karyawanTelat: number;
  spAktif: number;
}

export interface DashboardStats {
  totalKaryawan: number;
  hadirHariIni: number;
  tidakHadir: number;
  lemburBulanIni: number;
  attendancePercentage: number;
}

export interface RecentActivity {
  id: string;
  karyawan: {
    nama: string;
  };
  type: string;
  waktuMasuk: string;
  status: string;
}

export interface WeeklyAttendance {
  day: string;
  hadir: number;
  total: number;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: string;
    code?: number;
  };
}

interface GetAllParams {
  tanggal?: string;
  divisi?: string;
  limit?: number;
  offset?: number;
  needsValidation?: boolean;
}

interface GetStatsParams {
  divisi?: string;
}

interface ValidateAbsensiParams {
  action: "approve" | "reject";
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
      details?: string;
    };
    status?: number;
  };
  message?: string;
}

export const absensiService = {
  async createAbsensi(data: {
    qrCode?: string;
    manualCode?: string;
  }): Promise<ServiceResponse<AbsensiResponse>> {
    try {
      if (!data.qrCode && !data.manualCode) {
        throw new Error("Harap masukkan QR Code atau NIP");
      }

      const payload = data.qrCode
        ? { qrCode: data.qrCode.trim() }
        : { manualCode: data.manualCode?.trim() };

      const response = await api.post("/absensi", payload);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      let message = "Gagal melakukan absensi";
      let details = err.response?.data?.details;
      const code = err.response?.status;

      if (err.response) {
        message = err.response.data?.error || message;
        details =
          details || `Code: ${data.qrCode?.split("-")[0] || data.manualCode}`;
      } else if (err.message?.includes("timeout")) {
        message = "Timeout: Server tidak merespon";
      }

      return {
        success: false,
        error: { message, details, code },
      };
    }
  },

  async getAll(
    params?: GetAllParams
  ): Promise<ServiceResponse<AbsensiListResponse>> {
    try {
      const response = await api.get("/absensi", { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return {
        success: false,
        error: {
          message: "Gagal mengambil data absensi",
          details: err.response?.data?.error || err.message,
          code: err.response?.status,
        },
      };
    }
  },

  async getStats(
    params?: GetStatsParams
  ): Promise<ServiceResponse<AbsensiStats>> {
    try {
      const response = await api.get("/absensi/stats", { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return {
        success: false,
        error: {
          message: "Gagal mengambil statistik absensi",
          details: err.response?.data?.error || err.message,
          code: err.response?.status,
        },
      };
    }
  },

  async validateAbsensi(
    absensiId: string,
    params: ValidateAbsensiParams
  ): Promise<ServiceResponse<AbsensiResponse>> {
    try {
      const response = await api.patch(
        `/absensi/${absensiId}/validate`,
        params
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return {
        success: false,
        error: {
          message: err.response?.data?.error || "Gagal memvalidasi absensi",
          details: err.response?.data?.details,
          code: err.response?.status,
        },
      };
    }
  },

  async getDashboardStats(): Promise<ServiceResponse<DashboardStats>> {
    try {
      const response = await api.get("/absensi/dashboard-stats");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return {
        success: false,
        error: {
          message: "Gagal mengambil statistik dashboard",
          details: err.response?.data?.error || err.message,
          code: err.response?.status,
        },
      };
    }
  },

  async getRecentActivity(): Promise<ServiceResponse<RecentActivity[]>> {
    try {
      const response = await api.get("/absensi/recent-activity");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return {
        success: false,
        error: {
          message: "Gagal mengambil aktivitas terbaru",
          details: err.response?.data?.error || err.message,
          code: err.response?.status,
        },
      };
    }
  },

  async getWeeklyAttendance(): Promise<ServiceResponse<WeeklyAttendance[]>> {
    try {
      const response = await api.get("/absensi/weekly-attendance");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return {
        success: false,
        error: {
          message: "Gagal mengambil data mingguan",
          details: err.response?.data?.error || err.message,
          code: err.response?.status,
        },
      };
    }
  },
};
