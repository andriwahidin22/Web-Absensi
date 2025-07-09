
import { useState } from 'react';
import { Users, Clock, AlertTriangle, TrendingUp, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';

const AdminDashboard = () => {
  const [stats] = useState({
    totalKaryawan: 150,
    absenHariIni: 142,
    spAktif: 8,
    karyawanTelat: 5
  });

  const [recentActivity] = useState([
    { name: "John Doe", action: "Absen Masuk", time: "08:15", status: "ontime" },
    { name: "Jane Smith", action: "Absen Masuk", time: "08:45", status: "late" },
    { name: "Bob Johnson", action: "Absen Masuk", time: "07:55", status: "early" },
    { name: "Alice Brown", action: "Absen Masuk", time: "09:10", status: "late" },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ontime': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-red-100 text-red-800';
      case 'early': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
          <p className="text-gray-600">Kelola sistem absensi PT Sysware</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKaryawan}</div>
              <p className="text-xs text-muted-foreground">+2 dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absen Hari Ini</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.absenHariIni}</div>
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
              <p className="text-xs text-muted-foreground">-2 dari kemarin</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Manajemen Karyawan</span>
              </CardTitle>
              <CardDescription>Kelola data karyawan dan generate QR Code</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Kelola Karyawan</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Laporan Kehadiran</span>
              </CardTitle>
              <CardDescription>Lihat dan ekspor laporan kehadiran</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Buat Laporan</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Absensi masuk hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status === 'ontime' ? 'Tepat Waktu' : 
                       activity.status === 'late' ? 'Terlambat' : 'Lebih Awal'}
                    </Badge>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
