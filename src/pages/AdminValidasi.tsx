//src/pages/AdminValidasi.tsx

import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { absensiService, AbsensiResponse } from '@/services/absensiService';

interface FilterParams {
  tanggal?: string;
  status?: string;
  needsValidation?: boolean;
}

const AdminValidasi = () => {
  const [absensiData, setAbsensiData] = useState<AbsensiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const loadAbsensi = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        tanggal: selectedDate,
        needsValidation: true
      };

      const response = await absensiService.getAll(params);
      
      if (response.success && response.data?.absensi) {
        setAbsensiData(response.data.absensi);
      } else {
        toast.error(response.error?.message || 'Gagal memuat data validasi');
        setAbsensiData([]);
      }
    } catch (error) {
      console.error('Error loading validasi absensi:', error);
      toast.error('Gagal memuat data validasi');
      setAbsensiData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadAbsensi();
  }, [loadAbsensi]);

  const validateAbsensi = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await absensiService.validateAbsensi(id, { action });
      
      if (response.success && response.data) {
        setAbsensiData(prev => prev.map(item => 
          item.id === id ? response.data! : item
        ));
        toast.success(`Absensi berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
      } else {
        throw new Error(response.error?.message || 'Gagal memvalidasi absensi');
      }
    } catch (error) {
      toast.error('Gagal memvalidasi absensi');
    }
  };

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

  const filteredAbsensi = absensiData.filter(item => {
    const matchesSearch = item.karyawan.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.karyawan.divisi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: filteredAbsensi.length,
    hadir: filteredAbsensi.filter(a => a.status === 'HADIR').length,
    telat: filteredAbsensi.filter(a => a.status === 'TELAT').length,
    pending: filteredAbsensi.filter(a => a.status === 'TELAT' || a.status === 'IZIN').length
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
        <title>Validasi Harian - Admin Dashboard</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Validasi Kehadiran Harian</h2>
            <p className="text-muted-foreground">Validasi dan verifikasi kehadiran karyawan</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(selectedDate)}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Total Absensi</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
                  <p className="text-xs text-muted-foreground">Hadir</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.telat}</div>
                  <p className="text-xs text-muted-foreground">Telat</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Perlu Validasi</p>
                </div>
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
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
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="HADIR">Hadir</SelectItem>
                  <SelectItem value="TELAT">Telat</SelectItem>
                  <SelectItem value="IZIN">Izin</SelectItem>
                  <SelectItem value="ALPHA">Alpha</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSearchTerm('');
                }}
              >
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Validation Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kehadiran untuk Validasi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead>Waktu Masuk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi Validasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAbsensi.map((item) => (
                  <TableRow key={item.id}>
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
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => validateAbsensi(item.id, 'approve')}
                          disabled={item.status === 'HADIR'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Setuju
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => validateAbsensi(item.id, 'reject')}
                          disabled={item.status === 'ALPHA'}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
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

export default AdminValidasi;