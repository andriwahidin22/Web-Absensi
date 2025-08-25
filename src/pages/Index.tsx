import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Users, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QRScanner from '@/components/QRScanner';
import ManualAbsensi from '@/components/ManualAbsensi';
import LoginModal from '@/components/LoginModal';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { absensiService } from '@/services/absensiService';

// ---- Types ----
interface Karyawan {
  nama: string;
  jabatan: string;
  divisi?: string;
  foto?: string;
}

interface Absensi {
  id: string;
  karyawan: Karyawan;
  waktuMasuk: string;
  waktuKeluar?: string;
  tanggal: string;
  status: 'HADIR' | 'TELAT';
  type: 'checkin' | 'checkout';
  karyawanId: string;
}

interface AttendanceItem {
  id: string;
  nama: string;
  jabatan: string;
  waktuMasuk: string;
  status: 'HADIR' | 'TELAT';
  initials: string;
}

// Tambahkan tipe untuk response service
interface ServiceResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

interface AbsensiListResponse {
  absensi?: Absensi[];
  // tambahkan properti lain jika ada
}

const Index = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [showManualAbsensi, setShowManualAbsensi] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [absenResult, setAbsenResult] = useState<Absensi | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState<Absensi | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Refs
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDataLoadedRef = useRef(false);
  const currentDateRef = useRef(new Date().toISOString().split('T')[0]);

  // ---- Update jam real-time ----
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());

    updateTime();
    timeIntervalRef.current = setInterval(updateTime, 1000); // setiap detik

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    };
  }, []);

  // Load attendance dari localStorage
  useEffect(() => {
    const today = currentDateRef.current;
    const storedAttendance = localStorage.getItem(`attendance_${today}`);
    if (storedAttendance) {
      try {
        const attendanceData = JSON.parse(storedAttendance);
        setAttendanceStatus(attendanceData);
      } catch {
        // ignore
      }
    }
  }, []);

  const handleScanSuccess = useCallback((result: Absensi) => {
    setAbsenResult(result);
    setShowScanner(false);
    setShowManualAbsensi(false);

    const today = currentDateRef.current;
    localStorage.setItem(`attendance_${today}`, JSON.stringify(result));
    setAttendanceStatus(result);
  }, []);

  const handleLoginSuccess = useCallback(
    (userData: { role: string }) => {
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else if (userData.role === 'BOS') {
        navigate('/bos');
      }
    },
    [navigate]
  );

  const resetAbsen = useCallback(() => {
    setAbsenResult(null);
  }, []);

  // ---- Load Data ----
  const loadTodayAttendance = useCallback(async () => {
    if (isDataLoadedRef.current || isLoading) return;

    setIsLoading(true);
    try {
      const today = currentDateRef.current;
      const data = await absensiService.getAll({ tanggal: today }) as ServiceResponse<AbsensiListResponse>;

      let attendanceList: Absensi[] = [];
      
      // Perbaikan: Hindari penggunaan any dan periksa struktur data dengan benar
      if (Array.isArray(data)) {
        attendanceList = data;
      } else if (data && data.data && Array.isArray(data.data.absensi)) {
        attendanceList = data.data.absensi;
      } else if (data && Array.isArray((data as any).absensi)) {
        // Fallback jika struktur berbeda
        attendanceList = (data as any).absensi;
      }

      const formattedAttendance: AttendanceItem[] = attendanceList.map((item) => {
        const nama = item.karyawan?.nama || 'Unknown';
        const jabatan = item.karyawan?.jabatan || 'Unknown';

        return {
          id: item.id,
          nama,
          jabatan,
          waktuMasuk: new Date(item.waktuMasuk).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: item.status,
          initials: nama
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase(),
        };
      });

      setTodayAttendance(formattedAttendance);
      isDataLoadedRef.current = true;
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    loadTodayAttendance();
  }, [loadTodayAttendance]);

  const updateAttendanceData = useCallback((result: Absensi) => {
    if (!result) return;

    const newAttendance: AttendanceItem = {
      id: result.id || Date.now().toString(),
      nama: result.karyawan.nama,
      jabatan: result.karyawan.jabatan,
      waktuMasuk: new Date(result.waktuMasuk).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: result.status,
      initials: result.karyawan.nama
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase(),
    };

    setTodayAttendance((prev) => {
      const exists = prev.find((item) => item.nama === newAttendance.nama);
      if (exists) {
        return prev.map((item) =>
          item.nama === newAttendance.nama ? newAttendance : item
        );
      } else {
        return [newAttendance, ...prev];
      }
    });
  }, []);

  useEffect(() => {
    if (absenResult) {
      updateAttendanceData(absenResult);
    }
  }, [absenResult, updateAttendanceData]);

  const formatDateIndonesian = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatsCount = () => {
    const tepatWaktu = todayAttendance.filter((a) => a.status === 'HADIR').length;
    const terlambat = todayAttendance.filter((a) => a.status === 'TELAT').length;
    return { tepatWaktu, terlambat };
  };

  const stats = getStatsCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header onLoginClick={() => setShowLogin(true)} />

      <main className="container mx-auto px-4 py-8">
        {!absenResult ? (
          <div className="max-w-6xl mx-auto">
            {/* Top Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Digital Clock Card */}
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {currentTime.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                  <div className="text-sm text-gray-600">Waktu Saat Ini</div>
                </CardContent>
              </Card>

              {/* Date Card */}
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-xl font-semibold text-gray-900 mb-2">
                    {formatDateIndonesian(currentTime)}
                  </div>
                  <div className="text-sm text-gray-600">Tanggal Hari Ini</div>
                </CardContent>
              </Card>

              {/* Attendance Count Card */}
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {todayAttendance.length}
                  </div>
                  <div className="text-sm text-gray-600">Karyawan Hadir</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* QR Scanner Section */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold mb-2">
                    Scan QR Code
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Arahkan QR code ID card Anda ke kamera
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center bg-gray-50">
                    <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Camera className="h-12 w-12 text-blue-600" />
                    </div>
                    <p className="text-gray-600 mb-2">
                      Tekan tombol untuk memulai scan
                    </p>
                    <p className="text-sm text-gray-500">
                      Pastikan QR code terlihat jelas
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                    size="lg"
                  >
                    Mulai Scan QR Code
                  </Button>

                  <Button
                    onClick={() => setShowManualAbsensi(true)}
                    variant="outline"
                    className="w-full mt-3 py-3"
                    size="lg"
                  >
                    <Keyboard className="h-5 w-5 mr-2" />
                    Absen Manual
                  </Button>
                </CardContent>
              </Card>

              {/* Today's Attendance Section */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <Users className="h-6 w-6 mr-2 text-blue-600" />
                    Kehadiran Hari Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {todayAttendance.map((attendance) => (
                      <div
                        key={attendance.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {attendance.initials}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {attendance.nama}
                            </div>
                            <div className="text-sm text-gray-600">
                              {attendance.jabatan}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              attendance.status === 'HADIR'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {attendance.status === 'HADIR'
                              ? 'Hadir'
                              : 'Terlambat'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Masuk: {attendance.waktuMasuk}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {stats.tepatWaktu}
                      </div>
                      <div className="text-sm text-gray-600">Tepat Waktu</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {stats.terlambat}
                      </div>
                      <div className="text-sm text-gray-600">Terlambat</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Absen Result Card
          <div className="max-w-md mx-auto">
            <Card
              className={`${
                absenResult.status === 'HADIR'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <img
                    src={
                      absenResult.karyawan?.foto
                        ? `/uploads/${absenResult.karyawan.foto}`
                        : '/placeholder.svg'
                    }
                    alt="Foto Karyawan"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
                <CardTitle
                  className={`${
                    absenResult.status === 'HADIR'
                      ? 'text-green-800'
                      : 'text-yellow-800'
                  }`}
                >
                  {absenResult.type === 'checkin'
                    ? 'Check-in Berhasil!'
                    : 'Check-out Berhasil!'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {absenResult.karyawan?.nama}
                  </h3>
                  <p className="text-gray-600">
                    {absenResult.karyawan?.jabatan}
                  </p>
                  <p className="text-gray-600">
                    {absenResult.karyawan?.divisi}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">
                    {absenResult.type === 'checkin'
                      ? 'Waktu Masuk'
                      : 'Waktu Keluar'}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      absenResult.status === 'HADIR'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {new Date(
                      absenResult.type === 'checkin'
                        ? absenResult.waktuMasuk
                        : absenResult.waktuKeluar!
                    ).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(absenResult.tanggal).toLocaleDateString(
                      'id-ID',
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                      ${
                        absenResult.status === 'HADIR'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {absenResult.status === 'HADIR'
                        ? '✓ Tepat Waktu'
                        : '⏰ Terlambat'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Detail Absensi:</p>
                  <p>
                    • Tipe:{' '}
                    {absenResult.type === 'checkin'
                      ? 'Masuk Kerja'
                      : 'Pulang Kerja'}
                  </p>
                  <p>• Status: {absenResult.status}</p>
                  <p>• ID Karyawan: {absenResult.karyawanId}</p>
                </div>
                <Button
                  onClick={resetAbsen}
                  className={`w-full ${
                    absenResult.status === 'HADIR'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  OK, Selesai
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showManualAbsensi && (
        <ManualAbsensi
          onSuccess={handleScanSuccess}
          onClose={() => setShowManualAbsensi(false)}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default Index;