import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { absensiService, AbsensiResponse } from '@/services/absensiService';

const AdminValidasi = () => {
  const [absensi, setAbsensi] = useState<AbsensiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Static data untuk demo
  const staticAbsensi: AbsensiResponse[] = [
    {
      id: '1',
      karyawanId: '1',
      tanggal: new Date().toISOString().split('T')[0],
      waktuMasuk: new Date().toISOString(),
      waktuKeluar: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      status: 'HADIR',
      type: 'checkin',
      message: 'Check in berhasil',
      karyawan: {
        nama: 'Ahmad Rizki',
        jabatan: 'Software Developer',
        divisi: 'IT Development'
      }
    },
    {
      id: '2',
      karyawanId: '2',
      tanggal: new Date().toISOString().split('T')[0],
      waktuMasuk: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'TELAT',
      type: 'checkin',
      message: 'Check in terlambat',
      karyawan: {
        nama: 'Sari Indah',
        jabatan: 'HR Manager',
        divisi: 'HR'
      }
    },
    {
      id: '3',
      karyawanId: '3',
      tanggal: new Date().toISOString().split('T')[0],
      waktuMasuk: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'HADIR',
      type: 'checkin',
      message: 'Check in berhasil',
      karyawan: {
        nama: 'Budi Santoso',
        jabatan: 'Finance Analyst',
        divisi: 'Finance'
      }
    },
    {
      id: '4',
      karyawanId: '4',
      tanggal: new Date().toISOString().split('T')[0],
      waktuMasuk: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'HADIR',
      type: 'checkin',
      message: 'Check in berhasil',
      karyawan: {
        nama: 'Maya Sari',
        jabatan: 'Marketing Specialist',
        divisi: 'Marketing'
      }
    }
  ];

  const loadAbsensi = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDate) params.tanggal = selectedDate;
      
      try {
        const data = await absensiService.getAll(params);
        console.log('API Response:', data);
        
        if (Array.isArray(data)) {
          setAbsensi(data);
        } else if (data && 'absensi' in data && Array.isArray(data.absensi)) {
          setAbsensi(data.absensi);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (apiError) {
        console.log('Backend tidak tersedia, menggunakan data demo');
        setAbsensi([...staticAbsensi]);
      }
    } catch (error) {
      console.error('Error loading absensi:', error);
      setAbsensi([...staticAbsensi]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbsensi();
  }, [selectedDate]);

  const validateAbsensi = async (id: string, action: 'approve' | 'reject') => {
    try {
      // Update status locally
      setAbsensi(prev => prev.map(item => 
        item.id === id 
          ? { ...item, status: action === 'approve' ? 'HADIR' : 'ALPHA' }
          : item
      ));
      
      toast.success(`Absensi ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
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

  const filteredAbsensi = absensi.filter(item => {
    const matchesSearch = item.karyawan.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.karyawan.divisi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: filteredAbsensi.length,
    hadir: filteredAbsensi.filter(a => a.status === 'HADIR').length,
    telat: filteredAbsensi.filter(a => a.status === 'TELAT').length,
    pending: filteredAbsensi.filter(a => a.status === 'TELAT').length
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
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="HADIR">Hadir</SelectItem>
                  <SelectItem value="TELAT">Telat</SelectItem>
                  <SelectItem value="IZIN">Izin</SelectItem>
                  <SelectItem value="ALPHA">Alpha</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedStatus('');
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