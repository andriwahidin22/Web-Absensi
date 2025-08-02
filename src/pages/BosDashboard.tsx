
import { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { absensiService } from '@/services/absensiService';
import { karyawanService } from '@/services/karyawanService';
import { toast } from 'sonner';
import Header from '@/components/Header';

const BosDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalKaryawan: 0,
    absenHariIni: 0,
    karyawanTelat: 0,
    tingkatKehadiran: 0
  });
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load karyawan dalam divisi yang sama
      const karyawanList = await karyawanService.getAll({ 
        divisi: user?.divisi 
      });
      
      // Load absensi hari ini untuk divisi
      const absensiList = await absensiService.getAll({
        divisi: user?.divisi,
        tanggal: new Date().toISOString().split('T')[0]
      });

      // Parse absensi data based on structure
      const absensiArray = Array.isArray(absensiList) ? absensiList : 
                           (absensiList && 'absensi' in absensiList ? absensiList.absensi : []);
      
      // Hitung statistik
      const hadir = absensiArray?.filter((a: any) => a.status === 'HADIR').length || 0;
      const terlambat = absensiArray?.filter((a: any) => a.status === 'TELAT').length || 0;
      
      setStats({
        totalKaryawan: karyawanList.length,
        absenHariIni: hadir,
        karyawanTelat: terlambat,
        tingkatKehadiran: karyawanList.length > 0 ? Math.round((hadir / karyawanList.length) * 100) : 0
      });

      // Gabungkan data karyawan dengan absensi
      const teamWithAbsensi = karyawanList.map((karyawan: any) => {
        const absensi = absensiArray?.find((a: any) => a.karyawanId === karyawan.id);
        return {
          ...karyawan,
          status: absensi?.status || 'belum_absen',
          waktu: absensi?.waktuMasuk ? new Date(absensi.waktuMasuk).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'
        };
      });

      setTeamMembers(teamWithAbsensi);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.divisi) {
      loadDashboardData();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'tepat_waktu': return 'text-green-600';
      case 'terlambat': return 'text-red-600';
      case 'lebih_awal': return 'text-blue-600';
      case 'belum_absen': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'tepat_waktu': return 'Hadir';
      case 'terlambat': return 'Terlambat';
      case 'lebih_awal': return 'Hadir Awal';
      case 'belum_absen': return 'Belum Absen';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Bos Divisi</h1>
          <p className="text-muted-foreground">
            Monitoring kehadiran divisi {user?.divisi || 'All'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tim</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKaryawan}</div>
              <p className="text-xs text-muted-foreground">anggota divisi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.absenHariIni}</div>
              <p className="text-xs text-muted-foreground">dari {stats.totalKaryawan} anggota</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.karyawanTelat}</div>
              <p className="text-xs text-muted-foreground">hari ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tingkat Kehadiran</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.tingkatKehadiran}%</div>
              <p className="text-xs text-muted-foreground">hari ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Laporan Kehadiran</span>
              </CardTitle>
              <CardDescription>Lihat laporan kehadiran divisi Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Buat Laporan</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Analisis Tim</span>
              </CardTitle>
              <CardDescription>Analisis performa dan trend kehadiran</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Lihat Analisis</Button>
            </CardContent>
          </Card>
        </div>

        {/* Team Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status Tim Hari Ini</CardTitle>
                <CardDescription>
                  Kehadiran anggota divisi {user?.divisi || 'All'}
                </CardDescription>
              </div>
              <Select defaultValue="today">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="week">Minggu Ini</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada data karyawan di divisi ini
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.foto} />
                        <AvatarFallback>{member.nama.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.nama}</p>
                        <p className="text-sm text-muted-foreground">{member.jabatan}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(member.status)}`}>
                          {getStatusText(member.status)}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.waktu}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BosDashboard;
