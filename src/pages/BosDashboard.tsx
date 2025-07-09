
import { useState } from 'react';
import { Users, Clock, TrendingUp, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BosDashboard = () => {
  const [selectedDivisi] = useState("IT Development");
  const [stats] = useState({
    totalKaryawan: 25,
    absenHariIni: 23,
    karyawanTelat: 2,
    tingkatKehadiran: 92
  });

  const [teamMembers] = useState([
    { name: "John Doe", jabatan: "Senior Developer", status: "hadir", waktu: "08:15" },
    { name: "Jane Smith", jabatan: "UI/UX Designer", status: "terlambat", waktu: "08:45" },
    { name: "Bob Johnson", jabatan: "Backend Developer", status: "hadir", waktu: "07:55" },
    { name: "Alice Brown", jabatan: "QA Tester", status: "belum_absen", waktu: "-" },
    { name: "Charlie Wilson", jabatan: "DevOps Engineer", status: "hadir", waktu: "08:10" },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'bg-green-100 text-green-800';
      case 'terlambat': return 'bg-red-100 text-red-800';
      case 'belum_absen': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hadir': return 'Hadir';
      case 'terlambat': return 'Terlambat';
      case 'belum_absen': return 'Belum Absen';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Bos Divisi</h1>
          <p className="text-gray-600">Monitoring kehadiran divisi {selectedDivisi}</p>
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
              <p className="text-xs text-muted-foreground">bulan ini</p>
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
                <span>Kelola Cuti & Izin</span>
              </CardTitle>
              <CardDescription>Approve pengajuan cuti dan izin</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Kelola Pengajuan</Button>
            </CardContent>
          </Card>
        </div>

        {/* Team Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status Tim Hari Ini</CardTitle>
                <CardDescription>Kehadiran anggota divisi {selectedDivisi}</CardDescription>
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
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.jabatan}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(member.status)}>
                      {getStatusText(member.status)}
                    </Badge>
                    <span className="text-sm text-gray-500 w-16 text-right">{member.waktu}</span>
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

export default BosDashboard;
