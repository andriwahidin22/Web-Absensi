
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
import { absensiService } from '@/services/absensiService';

const Index = () => {
  console.log('🏠 Index component mounting/re-mounting');
  const [showScanner, setShowScanner] = useState(false);
  const [showManualAbsensi, setShowManualAbsensi] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [absenResult, setAbsenResult] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Component lifecycle tracking
  useEffect(() => {
    console.log('🎯 Index component DID MOUNT');
    return () => {
      console.log('💀 Index component WILL UNMOUNT');
    };
  }, []);

  // Update time every second
  useEffect(() => {
    console.log('⏰ Setting up timer interval for clock update');
    const timer = setInterval(() => {
      // Timer untuk update jam - tidak perlu log berlebihan
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      console.log('🛑 Cleaning up timer interval');
      clearInterval(timer);
    };
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

  // Load today's attendance from database - REAL DATA ONLY
  useEffect(() => {
    console.log('🔄 Index useEffect triggered - checking for infinite loop');
    let isMounted = true;
    
    const loadTodayAttendance = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        console.log('🚀 Starting loadTodayAttendance for:', today);
        
        const data = await absensiService.getAll({ tanggal: today });
        
        // Cek jika component masih mounted sebelum update state
        if (!isMounted) return;
        
        console.log('Real absensi response:', data);
        
        // Parse attendance data from API
        let attendanceList = [];
        if (Array.isArray(data)) {
          attendanceList = data;
        } else if (data && 'absensi' in data && Array.isArray(data.absensi)) {
          attendanceList = data.absensi;
        }
        
        console.log('Parsed attendance list:', attendanceList);
        
        // Format for display - REAL DATA FROM DATABASE
        const formattedAttendance = attendanceList.map((item: any) => {
          const nama = item.karyawan?.nama || item.nama || 'Unknown';
          const jabatan = item.karyawan?.jabatan || item.jabatan || 'Unknown';
          
          return {
            id: item.id,
            nama: nama,
            jabatan: jabatan,
            waktuMasuk: new Date(item.waktuMasuk).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: item.status,
            initials: nama.split(' ').map((n: string) => n[0]).join('').toUpperCase()
          };
        });
        
        console.log('Formatted real attendance:', formattedAttendance);
        
        // Hanya update state jika ada data yang valid untuk mencegah infinite loop
        if (isMounted && formattedAttendance.length > 0) {
          setTodayAttendance(formattedAttendance);
        } else if (isMounted && formattedAttendance.length === 0) {
          console.log('No attendance data found for today');
          // Jangan update state jika data kosong untuk mencegah loop
        }
        
      } catch (error) {
        // Jangan update state atau log saat backend error untuk mencegah infinite loop
        if (isMounted) {
          console.log('Backend tidak tersedia, skip update state');
        }
      }
    };

    console.log('🎯 About to call loadTodayAttendance');
    // Load data hanya sekali saat component mount
    loadTodayAttendance();
    console.log('✅ loadTodayAttendance called');
    
    // Cleanup function untuk mencegah memory leak
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array untuk mencegah infinite loop
  
  // Update data saat ada absen baru berhasil
  useEffect(() => {
    if (absenResult) {
      console.log('New attendance result:', absenResult);
      
      // Add new real attendance data
      const newAttendance = {
        id: absenResult.id || Date.now().toString(),
        nama: absenResult.karyawan.nama,
        jabatan: absenResult.karyawan.jabatan,
        waktuMasuk: new Date(absenResult.waktuMasuk).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: absenResult.status,
        initials: absenResult.karyawan.nama.split(' ').map((n: string) => n[0]).join('').toUpperCase()
      };
      
      setTodayAttendance(prev => {
        // Update existing or add new attendance
        const exists = prev.find(item => item.nama === newAttendance.nama);
        if (exists) {
          return prev.map(item => 
            item.nama === newAttendance.nama ? newAttendance : item
          );
        } else {
          return [newAttendance, ...prev];
        }
      });
    }
  }, [absenResult]);

  const formatDateIndonesian = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatsCount = () => {
    const tepatWaktu = todayAttendance.filter(a => a.status === 'HADIR').length;
    const terlambat = todayAttendance.filter(a => a.status === 'TELAT').length;
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
                      second: '2-digit'
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
                  <CardTitle className="text-2xl font-bold mb-2">Scan QR Code</CardTitle>
                  <CardDescription className="text-gray-600">
                    Arahkan QR code ID card Anda ke kamera
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {/* QR Scanner Preview Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center bg-gray-50">
                    <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Camera className="h-12 w-12 text-blue-600" />
                    </div>
                    <p className="text-gray-600 mb-2">Tekan tombol untuk memulai scan</p>
                    <p className="text-sm text-gray-500">Pastikan QR code terlihat jelas</p>
                  </div>
                  
                  <Button 
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                    size="lg"
                  >
                    Mulai Scan QR Code
                  </Button>
                  
                  {/* Manual Option */}
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
                      <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {attendance.initials}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{attendance.nama}</div>
                            <div className="text-sm text-gray-600">{attendance.jabatan}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            attendance.status === 'HADIR' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attendance.status === 'HADIR' ? 'Hadir' : 'Terlambat'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Masuk: {attendance.waktuMasuk}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.tepatWaktu}</div>
                      <div className="text-sm text-gray-600">Tepat Waktu</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{stats.terlambat}</div>
                      <div className="text-sm text-gray-600">Terlambat</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
