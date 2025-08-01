import { useState, useEffect, useRef } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { absensiService } from '@/services/absensiService';
import { useToast } from '@/hooks/use-toast';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface QRScannerProps {
  onScanSuccess: (result: any) => void;
  onClose: () => void;
}

const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request camera permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (permError) {
        console.error('Permission error:', permError);
        if (permError instanceof Error) {
          if (permError.name === 'NotAllowedError') {
            throw new Error('Akses kamera ditolak. Mohon izinkan akses kamera.');
          } else if (permError.name === 'NotFoundError') {
            throw new Error('Kamera tidak ditemukan pada perangkat ini.');
          }
        }
        throw new Error('Gagal mengakses kamera');
      }
      
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // Get available video devices
      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('Tidak ada kamera yang tersedia');
      }

      // Use the first available camera (usually back camera on mobile)
      const selectedDeviceId = videoInputDevices[0].deviceId;

      // Start decoding from video device
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, err) => {
          if (result && !processing) {
            handleScanResult(result.getText());
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('QR Scan error:', err);
          }
        }
      );

      setIsLoading(false);
      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(err.message || 'Gagal mengakses kamera');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  const handleScanResult = async (qrCode: string) => {
    if (processing) return;
    
    setProcessing(true);
    stopCamera();
    
    try {
      const result = await absensiService.createAbsensi({ qrCode });
      
      toast({
        title: "Absensi Berhasil!",
        description: `Selamat datang, ${result.karyawan.nama}`,
      });
      
      onScanSuccess(result);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Terjadi kesalahan saat memproses absensi';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setError(errorMessage);
      setProcessing(false);
    }
  };

  const handleTestScan = async () => {
    setProcessing(true);
    stopCamera();
    
    try {
      // Simulasi scan QR code dengan kode "QR_EMP001"
      const result = await absensiService.createAbsensi({ qrCode: "QR_EMP001" });
      
      toast({
        title: "Absensi Berhasil!",
        description: `Selamat datang, ${result.karyawan.nama}`,
      });
      
      onScanSuccess(result);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Terjadi kesalahan saat memproses absensi';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setError(errorMessage);
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setProcessing(false);
    startCamera();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Scan QR Code</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memulai kamera...</p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4 text-sm">{error}</p>
                  <div className="space-y-2">
                    <Button onClick={handleRetry} variant="outline" size="sm">
                      Coba Lagi
                    </Button>
                    <Button onClick={handleTestScan} size="sm" disabled={processing}>
                      {processing ? "Memproses..." : "Coba Scan Demo"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-blue-400 rounded-lg w-48 h-48 animate-pulse">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-600 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-600 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-600 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-600 rounded-br-lg"></div>
                    </div>
                  </div>
                )}
                {processing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Memproses...</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Arahkan kamera ke QR Code pada ID Card
            </p>
            {!error && !processing && !isLoading && (
              <Button 
                onClick={handleTestScan} 
                variant="outline"
                size="sm"
                disabled={processing}
                className="mt-2"
              >
                Test Scan Demo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;