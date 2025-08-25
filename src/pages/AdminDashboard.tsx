import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, AlertTriangle, TrendingUp, Calendar, FileText, CheckCircle, XCircle, Clock4 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { absensiService } from '@/services/absensiService';
import { toast } from 'sonner';

interface DashboardStats {
  totalKaryawan: number;
  hadirHariIni: number;
  tidakHadir: number;
  lemburBulanIni: number;
  attendancePercentage: number;
}

interface ApiRecentActivity {
  id: string;
  karyawan: { nama: string };
  type: 'checkin' | 'checkout';
  waktuMasuk: string;
  status: 'TELAT' | 'ONTIME' | 'OVERTIME';
}

interface RecentActivity {
  id: string;
  nama: string;
  initials: string;
  type: string;
  time: string;
  status: string;
}

interface WeeklyAttendance {
  day: string;
  hadir: number;
  total: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    totalKaryawan: 0,
    hadirHariIni: 0,
    tidakHadir: 0,
    lemburBulanIni: 0,
    attendancePercentage: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState<WeeklyAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, activityRes, weeklyRes] = await Promise.all([
          absensiService.getDashboardStats(),
          absensiService.getRecentActivity(),
          absensiService.getWeeklyAttendance()
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (activityRes.success && Array.isArray(activityRes.data)) {
          setRecentActivity(
            activityRes.data.map((item: ApiRecentActivity) => ({
              id: item.id,
              nama: item.karyawan.nama,
              initials: getInitials(item.karyawan.nama),
              type: item.type === 'checkin' ? 'Clock In' : 'Clock Out',
              time: formatTime(item.waktuMasuk),
              status:
                item.status === 'TELAT'
                  ? 'late'
                  : item.status === 'OVERTIME'
                  ? 'overtime'
                  : 'success'
            }))
          );
        }

        if (weeklyRes.success && Array.isArray(weeklyRes.data)) {
          setWeeklyAttendance(weeklyRes.data);
        }
      } catch {
        toast.error('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const formatTime = (timeString: string) =>
    new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{getGreeting()}, Admin!</h1>
          <p className="text-muted-foreground">Kelola absensi karyawan dengan mudah</p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={() => navigate('/admin/laporan')} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Laporan Bulanan
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/absensi')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Analisis
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Karyawan', value: stats.totalKaryawan, color: 'blue', icon: <Users className="h-6 w-6 text-blue-600" /> },
          { label: 'Hadir Hari Ini', value: stats.hadirHariIni, color: 'green', icon: <CheckCircle className="h-6 w-6 text-green-600" /> },
          { label: 'Tidak Hadir', value: stats.tidakHadir, color: 'red', icon: <XCircle className="h-6 w-6 text-red-600" /> },
          { label: 'Lembur Bulan Ini', value: stats.lemburBulanIni, color: 'orange', icon: <Clock4 className="h-6 w-6 text-orange-600" /> }
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color === 'blue' ? '' : `text-${stat.color}-600`}`}>{stat.value}</p>
                </div>
                <div className={`h-12 w-12 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grafik Kehadiran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-blue-600 border-t-red-600 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.attendancePercentage}%</div>
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
                <span className="text-sm font-medium">{stats.attendancePercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm">Tidak Hadir</span>
                </div>
                <span className="text-sm font-medium">{100 - stats.attendancePercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aktivitas Terbaru */}
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
                      <AvatarFallback className="bg-blue-100 text-blue-600">{activity.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activity.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type} - {activity.time}
                      </p>
                    </div>
                  </div>
                  {getActivityIcon(activity.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kehadiran Mingguan */}
      <Card>
        <CardHeader>
          <CardTitle>Kehadiran Mingguan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyAttendance.map((item) => (
              <div key={item.day} className="flex items-center justify-between">
                <div className="w-20">
                  <span className="text-sm font-medium">{item.day}</span>
                </div>
                <div className="flex-1 mx-4">
                  <Progress value={(item.hadir / item.total) * 100} className="h-3" />
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm text-muted-foreground">
                    {item.hadir}/{item.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
