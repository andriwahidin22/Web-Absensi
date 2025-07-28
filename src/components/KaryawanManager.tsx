import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download, QrCode, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { karyawanService, KaryawanResponse } from '@/services/karyawanService';
import KaryawanForm from './KaryawanForm';
import KaryawanIdCard from './KaryawanIdCard';

const KaryawanManager = () => {
  const [karyawan, setKaryawan] = useState<KaryawanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKaryawan, setSelectedKaryawan] = useState<KaryawanResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);

  const loadKaryawan = async () => {
    try {
      setLoading(true);
      const data = await karyawanService.getAll();
      setKaryawan(data);
    } catch (error) {
      toast.error('Gagal memuat data karyawan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKaryawan();
  }, []);

  const handleCreate = () => {
    setSelectedKaryawan(null);
    setShowForm(true);
  };

  const handleEdit = (item: KaryawanResponse) => {
    setSelectedKaryawan(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus karyawan ini?')) return;
    
    try {
      await karyawanService.delete(id);
      toast.success('Karyawan berhasil dihapus');
      loadKaryawan();
    } catch (error) {
      toast.error('Gagal menghapus karyawan');
    }
  };

  const handlePrintIdCard = (item: KaryawanResponse) => {
    setSelectedKaryawan(item);
    setShowIdCard(true);
  };

  const filteredKaryawan = karyawan.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.divisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Kelola Karyawan</h2>
          <p className="text-muted-foreground">Manajemen data karyawan dan ID card</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Karyawan
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari karyawan (nama, NIP, divisi)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{karyawan.length}</div>
            <p className="text-xs text-muted-foreground">Total Karyawan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Set(karyawan.map(k => k.divisi)).size}
            </div>
            <p className="text-xs text-muted-foreground">Total Divisi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredKaryawan.length}</div>
            <p className="text-xs text-muted-foreground">Hasil Pencarian</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKaryawan.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={item.foto} />
                      <AvatarFallback>{item.nama.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{item.nip}</TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.jabatan}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.divisi}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintIdCard(item)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintIdCard(item)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedKaryawan ? 'Edit Karyawan' : 'Tambah Karyawan'}
            </DialogTitle>
          </DialogHeader>
          <KaryawanForm
            karyawan={selectedKaryawan}
            onSuccess={() => {
              setShowForm(false);
              loadKaryawan();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ID Card Dialog */}
      <Dialog open={showIdCard} onOpenChange={setShowIdCard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ID Card Karyawan</DialogTitle>
          </DialogHeader>
          {selectedKaryawan && (
            <KaryawanIdCard
              karyawan={selectedKaryawan}
              onClose={() => setShowIdCard(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KaryawanManager;