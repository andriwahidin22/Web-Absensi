import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Keyboard, Check } from 'lucide-react';
import { absensiService } from '@/services/absensiService';
import { useToast } from '@/hooks/use-toast';

interface ManualAbsensiProps {
  onSuccess: (result: any) => void;
  onClose: () => void;
}

const ManualAbsensi = ({ onSuccess, onClose }: ManualAbsensiProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Silakan masukkan kode absensi",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const result = await absensiService.createAbsensi({ manualCode: code.trim() });
      
      toast({
        title: "Berhasil",
        description: result.message || "Absensi berhasil dicatat",
        variant: "default"
      });
      
      onSuccess(result);
    } catch (error: any) {
      console.error('Manual absensi error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Gagal melakukan absensi manual",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Keyboard className="h-5 w-5" />
            <span>Absensi Manual</span>
          </CardTitle>
          <CardDescription>
            Masukkan kode absensi yang tertera pada QR Code ID Card Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode Absensi</Label>
              <Input
                id="code"
                type="text"
                placeholder="Masukkan kode (contoh: NIP atau kode QR)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                * Kode dapat berupa NIP atau kode yang ada di QR Code ID Card
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={loading || !code.trim()}
                className="flex-1"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Memproses...' : 'Absen Sekarang'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualAbsensi;