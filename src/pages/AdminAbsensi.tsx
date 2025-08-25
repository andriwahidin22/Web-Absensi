import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { absensiService, AbsensiResponse, AbsensiListResponse } from '@/services/absensiService';

interface FilterParams {
  tanggal?: string;
  divisi?: string;
}

const AdminAbsensi = () => {
  const [absensiData, setAbsensiData] = useState<AbsensiListResponse>({
    absensi: [],
    total: 0,
    pagination: {
      limit: 50,
      offset: 0,
      hasMore: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('ALL');

  const loadAbsensi = useCallback(async () => {
    try {
      setLoading(true);
      
      const params: FilterParams = {};
      if (selectedDate) params.tanggal = selectedDate;
      if (selectedDivisi && selectedDivisi !== 'ALL') params.divisi = selectedDivisi;
      
      const response = await absensiService.getAll(params);
      
      if (response.success && response.data) {
        setAbsensiData(response.data);
      } else {
        toast.error(response.error?.message || 'Gagal memuat data absensi');
        setAbsensiData({
          absensi: [],
          total: 0,
          pagination: {
            limit: 50,
            offset: 0,
            hasMore: false
          }
        });
      }
    } catch (error) {
      console.error('Error loading absensi:', error);
      toast.error('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedDivisi]);

  useEffect(() => {
    loadAbsensi();
  }, [loadAbsensi]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'HADIR': return 'default';
      case 'TELAT': return 'secondary';
      case 'IZIN': return 'outline';
      case 'ALPHA': return 'destructive';
      default: return 'default';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const filteredAbsensi = absensiData.absensi.filter(item =>
    item.karyawan.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.karyawan.divisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Nama', 'Divisi', 'Jabatan', 'Waktu Masuk', 'Waktu Keluar', 'Status'];
    const csvData = [
      headers.join(','),
      ...filteredAbsensi.map(item => [
        formatDate(item.tanggal),
        item.karyawan.nama,
        item.karyawan.divisi,
        item.karyawan.jabatan,
        formatTime(item.waktuMasuk),
        item.waktuKeluar ? formatTime(item.waktuKeluar) : '-',
        item.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absensi-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Data Absensi - Admin Dashboard</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Data Absensi</h2>
            <p className="text-muted-foreground">Kelola dan monitor kehadiran karyawan</p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              
              <Select value={selectedDivisi} onValueChange={setSelectedDivisi}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Divisi</SelectItem>
                  <SelectItem value="IT Development">IT Development</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedDate('');
                  setSelectedDivisi('ALL');
                  setSearchTerm('');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{absensiData.total}</div>
              <p className="text-xs text-muted-foreground">Total Absensi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {filteredAbsensi.filter(a => a.status === 'HADIR').length}
              </div>
              <p className="text-xs text-muted-foreground">Hadir</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredAbsensi.filter(a => a.status === 'TELAT').length}
              </div>
              <p className="text-xs text-muted-foreground">Telat</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {filteredAbsensi.filter(a => a.status === 'ALPHA').length}
              </div>
              <p className="text-xs text-muted-foreground">Alpha</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Absensi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead>Waktu Masuk</TableHead>
                  <TableHead>Waktu Keluar</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAbsensi.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.tanggal)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.karyawan.nama}</div>
                        <div className="text-sm text-muted-foreground">{item.karyawan.jabatan}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.karyawan.divisi}</Badge>
                    </TableCell>
                    <TableCell>{formatTime(item.waktuMasuk)}</TableCell>
                    <TableCell>
                      {item.waktuKeluar ? formatTime(item.waktuKeluar) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminAbsensi;