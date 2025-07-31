import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Search, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Temporary data structure
interface SP {
  id: string;
  karyawan: {
    id: string;
    nama: string;
    jabatan: string;
    divisi: string;
  };
  alasan: string;
  tanggal: string;
  status: 'AKTIF' | 'SELESAI';
}

const AdminSP = () => {
  const [sp, setSP] = useState<SP[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDivisi, setSelectedDivisi] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Temporary mock data
  useEffect(() => {
    const mockData: SP[] = [
      {
        id: '1',
        karyawan: {
          id: '1',
          nama: 'John Doe',
          jabatan: 'Software Engineer',
          divisi: 'IT'
        },
        alasan: 'Terlambat 3 kali dalam seminggu',
        tanggal: new Date().toISOString(),
        status: 'AKTIF'
      }
    ];
    setSP(mockData);
  }, []);

  const filteredSP = sp.filter(item => {
    const matchesSearch = item.karyawan.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.alasan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesDivisi = !selectedDivisi || item.karyawan.divisi === selectedDivisi;
    
    return matchesSearch && matchesStatus && matchesDivisi;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'destructive';
      case 'SELESAI': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCreateSP = () => {
    toast.success('Fitur akan segera tersedia');
    setShowCreateDialog(false);
  };

  const handleUpdateStatus = (id: string, newStatus: 'AKTIF' | 'SELESAI') => {
    setSP(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
    toast.success(`Status SP berhasil diubah menjadi ${newStatus}`);
  };

  return (
    <>
      <Helmet>
        <title>Surat Peringatan - Admin Dashboard</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Surat Peringatan</h1>
            <p className="text-muted-foreground">Kelola surat peringatan karyawan</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Buat SP
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Surat Peringatan</DialogTitle>
                <DialogDescription>
                  Buat surat peringatan baru untuk karyawan
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="karyawan">Karyawan</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih karyawan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">John Doe - IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="alasan">Alasan SP</Label>
                  <Textarea 
                    id="alasan"
                    placeholder="Masukkan alasan pemberian surat peringatan"
                    rows={4}
                  />
                </div>
                <Button onClick={handleCreateSP} className="w-full">
                  Buat SP
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Cari SP</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nama karyawan atau alasan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Status</SelectItem>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="SELESAI">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="divisi">Divisi</Label>
                <Select value={selectedDivisi} onValueChange={setSelectedDivisi}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Divisi</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('ALL');
                    setSelectedDivisi('');
                  }}
                  className="w-full"
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SP Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Surat Peringatan</CardTitle>
            <CardDescription>
              Total: {filteredSP.length} SP
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSP.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada data surat peringatan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Karyawan</th>
                      <th className="text-left p-4 font-medium">Jabatan</th>
                      <th className="text-left p-4 font-medium">Divisi</th>
                      <th className="text-left p-4 font-medium">Alasan</th>
                      <th className="text-left p-4 font-medium">Tanggal</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSP.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{item.karyawan.nama}</td>
                        <td className="p-4 text-muted-foreground">{item.karyawan.jabatan}</td>
                        <td className="p-4 text-muted-foreground">{item.karyawan.divisi}</td>
                        <td className="p-4 max-w-xs truncate" title={item.alasan}>
                          {item.alasan}
                        </td>
                        <td className="p-4 text-muted-foreground">{formatDate(item.tanggal)}</td>
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            {item.status === 'AKTIF' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(item.id, 'SELESAI')}
                              >
                                Selesaikan
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminSP;