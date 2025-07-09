
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Users, Clock, Building2, QrCode, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QRScanner from '@/components/QRScanner';
import LoginModal from '@/components/LoginModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [absenResult, setAbsenResult] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleScanSuccess = (result: any) => {
    setAbsenResult(result);
    setShowScanner(false);
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PT Sysware</h1>
                <p className="text-sm text-gray-500">Sistem Absensi Digital</p>
              </div>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.role}
                </span>
                <Button
                  variant="outline"
                  onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/bos')}
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowLogin(true)}
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Login Admin</span>
              </Button>
            )}
          </div>
        </div>
      </header>

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
              
              <Button
                onClick={() => setShowScanner(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <QrCode className="h-6 w-6 mr-2" />
                ABSEN SEKARANG
              </Button>
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
                      <li>1. Klik tombol "ABSEN SEKARANG"</li>
                      <li>2. Scan QR Code pada ID Card</li>
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
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img 
                    src={absenResult.karyawan.foto ? `/uploads/${absenResult.karyawan.foto}` : "/placeholder.svg"}
                    alt="Foto Karyawan" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
                <CardTitle className="text-green-800">Absensi Berhasil!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{absenResult.karyawan.nama}</h3>
                  <p className="text-gray-600">{absenResult.karyawan.jabatan}</p>
                  <p className="text-gray-600">{absenResult.karyawan.divisi}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Waktu Absensi</p>
                  <p className="text-xl font-bold text-green-600">
                    {new Date(absenResult.absensi.waktuMasuk).toLocaleTimeString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {absenResult.absensi.status === 'HADIR' ? 'Tepat Waktu' : 'Terlambat'}
                  </p>
                </div>
                <Button 
                  onClick={resetAbsen}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  OK
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
