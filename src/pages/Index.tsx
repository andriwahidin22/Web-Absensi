
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Users, Clock, Building2, QrCode, BarChart3, Keyboard, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QRScanner from '@/components/QRScanner';
import ManualAbsensi from '@/components/ManualAbsensi';
import LoginModal from '@/components/LoginModal';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [showManualAbsensi, setShowManualAbsensi] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [absenResult, setAbsenResult] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check today's attendance status
  useEffect(() => {
    const checkTodayAttendance = () => {
      // Check localStorage for today's attendance
      const today = new Date().toISOString().split('T')[0];
      const storedAttendance = localStorage.getItem(`attendance_${today}`);
      
      if (storedAttendance) {
        const attendanceData = JSON.parse(storedAttendance);
        setAttendanceStatus(attendanceData);
      }
    };

    checkTodayAttendance();
  }, []);

  const handleScanSuccess = (result: any) => {
    setAbsenResult(result);
    setShowScanner(false);
    setShowManualAbsensi(false);
    
    // Store attendance in localStorage
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`attendance_${today}`, JSON.stringify(result));
    setAttendanceStatus(result);
  };

  const handleLoginSuccess = (userData: any) => {
    // Redirect based on role
    if (userData.role === 'ADMIN') {
      navigate('/admin');
    } else if (userData.role === 'BOS') {
      navigate('/bos');
    }
  };

  const resetAbsen = () => {
    setAbsenResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header onLoginClick={() => setShowLogin(true)} />

      <main className="container mx-auto px-4 py-8">
        {!absenResult ? (
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Selamat Datang di Sistem Absensi
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Scan QR Code pada ID Card Anda untuk melakukan absensi
              </p>

              {/* Real-time Clock and Attendance Status */}
              <div className="mb-8">
                <Card className="bg-white/90 backdrop-blur-sm max-w-md mx-auto">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {currentTime.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                      <div className="text-lg text-gray-600 mb-4">
                        {currentTime.toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      
                      {attendanceStatus ? (
                        <div className="flex items-center justify-center space-x-2 p-3 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-800 font-medium">
                            Sudah Absen Hari Ini - {attendanceStatus.status === 'HADIR' ? 'Tepat Waktu' : 'Terlambat'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2 p-3 bg-orange-100 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                          <span className="text-orange-800 font-medium">Belum Absen Hari Ini</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setShowScanner(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <QrCode className="h-6 w-6 mr-2" />
                  SCAN QR CODE
                </Button>
                <Button
                  onClick={() => setShowManualAbsensi(true)}
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Keyboard className="h-6 w-6 mr-2" />
                  ABSEN MANUAL
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>QR Code Scanner</CardTitle>
                  <CardDescription>
                    Scan QR code pada ID Card untuk absensi cepat dan akurat
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <CardTitle>Real-time Tracking</CardTitle>
                  <CardDescription>
                    Pencatatan waktu absensi secara real-time dengan validasi otomatis
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Laporan Lengkap</CardTitle>
                  <CardDescription>
                    Sistem pelaporan komprehensif untuk monitoring kehadiran
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Company Info */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Informasi Perusahaan</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Jam Kerja</h3>
                    <p className="text-gray-600">Senin - Jumat: 08:00 - 17:00</p>
                    <p className="text-gray-600">Sabtu: 08:00 - 12:00</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cara Penggunaan</h3>
                    <ul className="text-gray-600 space-y-1">
                     <li>1. Pilih "SCAN QR CODE" atau "ABSEN MANUAL"</li>
                      <li>2. Scan QR Code atau masukkan kode manual</li>
                      <li>3. Konfirmasi data absensi</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Absen Success Result */
          <div className="max-w-md mx-auto">
            <Card className={`${absenResult.status === 'HADIR' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <img 
                    src={absenResult.karyawan?.foto ? `/uploads/${absenResult.karyawan.foto}` : "/placeholder.svg"}
                    alt="Foto Karyawan" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
                <CardTitle className={`${absenResult.status === 'HADIR' ? 'text-green-800' : 'text-yellow-800'}`}>
                  {absenResult.type === 'checkin' ? 'Check-in Berhasil!' : 'Check-out Berhasil!'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{absenResult.karyawan?.nama}</h3>
                  <p className="text-gray-600">{absenResult.karyawan?.jabatan}</p>
                  <p className="text-gray-600">{absenResult.karyawan?.divisi}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">
                    {absenResult.type === 'checkin' ? 'Waktu Masuk' : 'Waktu Keluar'}
                  </p>
                  <p className={`text-xl font-bold ${absenResult.status === 'HADIR' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {new Date(absenResult.type === 'checkin' ? absenResult.waktuMasuk : absenResult.waktuKeluar).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(absenResult.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                      ${absenResult.status === 'HADIR' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {absenResult.status === 'HADIR' ? '✓ Tepat Waktu' : '⏰ Terlambat'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Detail Absensi:</p>
                  <p>• Tipe: {absenResult.type === 'checkin' ? 'Masuk Kerja' : 'Pulang Kerja'}</p>
                  <p>• Status: {absenResult.status}</p>
                  <p>• ID Karyawan: {absenResult.karyawanId}</p>
                </div>
                <Button 
                  onClick={resetAbsen}
                  className={`w-full ${absenResult.status === 'HADIR' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                >
                  OK, Selesai
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner 
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Manual Absensi Modal */}
      {showManualAbsensi && (
        <ManualAbsensi
          onSuccess={handleScanSuccess}
          onClose={() => setShowManualAbsensi(false)}
        />
      )}

      {/* Login Modal */}
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
