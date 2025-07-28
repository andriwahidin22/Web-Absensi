import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { karyawanService, KaryawanData, KaryawanResponse } from '@/services/karyawanService';

interface KaryawanFormProps {
  karyawan?: KaryawanResponse | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const KaryawanForm = ({ karyawan, onSuccess, onCancel }: KaryawanFormProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<KaryawanData>({
    defaultValues: {
      nip: karyawan?.nip || '',
      nama: karyawan?.nama || '',
      jabatan: karyawan?.jabatan || '',
      divisi: karyawan?.divisi || '',
    }
  });

  const divisiOptions = [
    'IT Development',
    'HR',
    'Finance',
    'Marketing',
    'Operations',
    'QA',
    'Design'
  ];

  const onSubmit = async (data: KaryawanData) => {
    try {
      setLoading(true);
      
      const formData = {
        ...data,
        foto: selectedFile || undefined
      };

      if (karyawan) {
        await karyawanService.update(karyawan.id, formData);
        toast.success('Karyawan berhasil diupdate');
      } else {
        await karyawanService.create(formData);
        toast.success('Karyawan berhasil ditambahkan');
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menyimpan data karyawan');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Ukuran file terlalu besar (maksimal 5MB)');
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nip">NIP</Label>
        <Input
          id="nip"
          {...register('nip', { required: 'NIP harus diisi' })}
          placeholder="Masukkan NIP"
        />
        {errors.nip && <p className="text-sm text-destructive">{errors.nip.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nama">Nama Lengkap</Label>
        <Input
          id="nama"
          {...register('nama', { required: 'Nama harus diisi' })}
          placeholder="Masukkan nama lengkap"
        />
        {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="jabatan">Jabatan</Label>
        <Input
          id="jabatan"
          {...register('jabatan', { required: 'Jabatan harus diisi' })}
          placeholder="Masukkan jabatan"
        />
        {errors.jabatan && <p className="text-sm text-destructive">{errors.jabatan.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="divisi">Divisi</Label>
        <Select
          value={watch('divisi')}
          onValueChange={(value) => setValue('divisi', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih divisi" />
          </SelectTrigger>
          <SelectContent>
            {divisiOptions.map((divisi) => (
              <SelectItem key={divisi} value={divisi}>
                {divisi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.divisi && <p className="text-sm text-destructive">{errors.divisi.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="foto">Foto (Opsional)</Label>
        <Input
          id="foto"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground">
          Maksimal 5MB. Format: JPG, PNG, GIF
        </p>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Menyimpan...' : (karyawan ? 'Update' : 'Simpan')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Batal
        </Button>
      </div>
    </form>
  );
};

export default KaryawanForm;