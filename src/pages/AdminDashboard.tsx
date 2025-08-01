import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, AlertTriangle, TrendingUp, Calendar, FileText, Plus, CheckCircle, XCircle, Clock4 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { absensiService } from '@/services/absensiService';
import { karyawanService } from '@/services/karyawanService';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalKaryawan: 156,
    hadirHariIni: 142,
    tidakHadir: 14,
    lemburBulanIni: 89
  });

  const [recentActivity] = useState([
    {
      id: '1',
      nama: 'Devi Sartika',
      initials: 'DS',
      type: 'Clock In',
      time: '08:00',
      status: 'success'
    },
    {
      id: '2',
      nama: 'Ahmad Rizki',
      initials: 'AR',
      type: 'Clock Out',
      time: '17:30',
      status: 'success'
    },
    {
      id: '3',
      nama: 'Siti Nurhaliza',
      initials: 'SN',
      type: 'Clock In',
      time: '08:15',
      status: 'late'
    },
    {
      id: '4',
      nama: 'Budi Santoso',
      initials: 'BS',
      type: 'Overtime',
      time: '18:00',
      status: 'overtime'
    }
  ]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'late':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'overtime':
        return <Clock4 className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{getGreeting()}, Admin!</h1>
          <p className="text-muted-foreground">Kelola absensi karyawan dengan mudah</p>
        </div>
        <div className="flex space-x-4">
          <Button 
            onClick={() => navigate('/admin/laporan')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Laporan Bulanan
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/absensi')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Analisis
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Karyawan</p>
                <p className="text-3xl font-bold">{stats.totalKaryawan}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hadir Hari Ini</p>
                <p className="text-3xl font-bold text-green-600">{stats.hadirHariIni}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tidak Hadir</p>
                <p className="text-3xl font-bold text-red-600">{stats.tidakHadir}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lembur Bulan Ini</p>
                <p className="text-3xl font-bold text-orange-600">{stats.lemburBulanIni}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock4 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simple Pie Chart Representation */}
        <Card>
          <CardHeader>
            <CardTitle>Grafik Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-blue-600 border-t-red-600 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">91%</div>
                    <div className="text-sm text-muted-foreground">Kehadiran</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">Hadir</span>
                </div>
                <span className="text-sm font-medium">91%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm">Tidak Hadir</span>
                </div>
                <span className="text-sm font-medium">9%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {activity.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activity.nama}</p>
                      <p className="text-sm text-muted-foreground">{activity.type} - {activity.time}</p>
                    </div>
                  </div>
                  {getActivityIcon(activity.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Kehadiran Mingguan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { day: 'Senin', hadir: 145, total: 156 },
              { day: 'Selasa', hadir: 142, total: 156 },
              { day: 'Rabu', hadir: 148, total: 156 },
              { day: 'Kamis', hadir: 144, total: 156 },
              { day: 'Jumat', hadir: 142, total: 156 },
              { day: 'Sabtu', hadir: 98, total: 156 }
            ].map((item) => (
              <div key={item.day} className="flex items-center justify-between">
                <div className="w-20">
                  <span className="text-sm font-medium">{item.day}</span>
                </div>
                <div className="flex-1 mx-4">
                  <Progress value={(item.hadir / item.total) * 100} className="h-3" />
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm text-muted-foreground">{item.hadir}/{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/karyawan')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Kelola Karyawan</span>
            </CardTitle>
            <CardDescription>Generate QR Code dan kelola data karyawan</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/absensi')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Validasi Harian</span>
            </CardTitle>
            <CardDescription>Validasi dan verifikasi data absensi harian</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/laporan')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Laporan</span>
            </CardTitle>
            <CardDescription>Generate laporan kehadiran dan analisis</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/sp')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Lembur</span>
            </CardTitle>
            <CardDescription>Kelola lembur dan overtime karyawan</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/settings')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              <span>Pengaturan</span>
            </CardTitle>
            <CardDescription>Konfigurasi sistem dan pengaturan</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;