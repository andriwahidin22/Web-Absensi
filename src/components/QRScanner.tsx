
import { useState, useEffect } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}

const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulasi loading kamera
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleTestScan = () => {
    // Simulasi scan QR code berhasil
    onScanSuccess("EMP001");
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
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memulai kamera...</p>
              </div>
            ) : error ? (
              <div className="text-center p-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => setError(null)} variant="outline">
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="border-2 border-dashed border-blue-400 rounded-lg p-8">
                  <Camera className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Arahkan kamera ke QR Code</p>
                  <Button onClick={handleTestScan} className="bg-blue-600 hover:bg-blue-700">
                    Test Scan (Demo)
                  </Button>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 text-center">
            Pastikan QR Code terlihat jelas dalam frame kamera
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
