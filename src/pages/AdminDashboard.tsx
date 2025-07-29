
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, AlertTriangle, TrendingUp, Calendar, FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { absensiService } from '@/services/absensiService';
import { karyawanService } from '@/services/karyawanService';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalKaryawan: 0,
    absenHariIni: 0,
    spAktif: 0,
    karyawanTelat: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const [absensiStats, karyawanList, absensiList] = await Promise.all([
        absensiService.getStats(),
        karyawanService.getAll(),
        absensiService.getAll()
      ]);

      setStats({
        totalKaryawan: karyawanList.length,
        absenHariIni: absensiStats.stats.find(s => s.status === 'HADIR')?._count.status || 0,
        spAktif: 0,
        karyawanTelat: absensiStats.stats.find(s => s.status === 'TELAT')?._count.status || 0
      });

      setRecentActivity(absensiList || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'tepat_waktu': return 'text-green-600';
      case 'terlambat': return 'text-red-600';
      case 'lebih_awal': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'tepat_waktu': return 'Tepat Waktu';
      case 'terlambat': return 'Terlambat';
      case 'lebih_awal': return 'Lebih Awal';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Admin</h1>
        <p className="text-muted-foreground">Kelola sistem absensi PT Sysware Indonesia</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKaryawan}</div>
            <p className="text-xs text-muted-foreground">Karyawan terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absen Hari Ini</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.absenHariIni}</div>
            <p className="text-xs text-muted-foreground">dari {stats.totalKaryawan} karyawan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SP Aktif</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.spAktif}</div>
            <p className="text-xs text-muted-foreground">perlu perhatian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.karyawanTelat}</div>
            <p className="text-xs text-muted-foreground">karyawan terlambat</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/karyawan')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Manajemen Karyawan</span>
            </CardTitle>
            <CardDescription>Kelola data karyawan dan generate QR Code</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Kelola Karyawan
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/absensi')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Data Absensi</span>
            </CardTitle>
            <CardDescription>Lihat dan kelola data absensi karyawan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Lihat Data</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/sp')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Surat Peringatan</span>
            </CardTitle>
            <CardDescription>Kelola SP dan peringatan karyawan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Kelola SP</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/laporan')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Laporan Kehadiran</span>
            </CardTitle>
            <CardDescription>Generate dan ekspor laporan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Buat Laporan</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/statistik')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <span>Statistik & Analytics</span>
            </CardTitle>
            <CardDescription>Analisis data kehadiran</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Lihat Statistik</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/settings')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              <span>Pengaturan Sistem</span>
            </CardTitle>
            <CardDescription>Konfigurasi jam kerja dan aturan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Pengaturan</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Absensi Terbaru</CardTitle>
          <CardDescription>Absensi masuk hari ini</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada aktivitas absensi hari ini
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={activity.karyawan?.foto} />
                      <AvatarFallback>
                        {activity.karyawan?.nama?.charAt(0) || 'K'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activity.karyawan?.nama || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.karyawan?.jabatan} - {activity.karyawan?.divisi}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                        {getStatusText(activity.status)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.waktuMasuk).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
