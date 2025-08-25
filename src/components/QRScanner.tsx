import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { absensiService } from '@/services/absensiService';
import { useToast } from '@/hooks/use-toast';
import { BrowserMultiFormatReader, NotFoundException, Result } from '@zxing/library';

interface QRScannerProps {
  onScanSuccess: (result: unknown) => void;
  onClose: () => void;
}

interface ScannerState {
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  isScanning: boolean;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [state, setState] = useState<ScannerState>({
    isLoading: true,
    error: null,
    isProcessing: false,
    isScanning: false
  });
  
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const testCameraAccess = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      stream.getTracks().forEach(track => track.stop());
    } catch (err: unknown) {
      const error = err as Error;
      throw new Error(
        error.name === 'NotAllowedError' ? 'Camera access denied' :
        error.name === 'NotFoundError' ? 'No camera available' :
        'Failed to access camera'
      );
    }
  }, []);

  const handleScan = useCallback(async (qrData: string): Promise<void> => {
    if (state.isProcessing) return;
    
    setState(prev => ({ ...prev, isProcessing: true, isScanning: false }));
    
    try {
      const result = await absensiService.createAbsensi({ qrCode: qrData });

      if (!result.success) {
        const errorMsg = result.error?.details || result.error?.message || 'Invalid QR Code';
        throw new Error(errorMsg);
      }

      toast({
        title: "Success",
        description: `Welcome, ${result.data?.karyawan.nama}`,
      });
      
      if (result.data) {
        onScanSuccess(result.data);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
      
      setState(prev => ({ ...prev, error: err.message }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
      // Note: We don't call initCamera here to avoid circular dependencies
      // Instead, we'll let the user manually retry if needed
    }
  }, [state.isProcessing, toast, onScanSuccess]);

  const initCamera = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await testCameraAccess();
      
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const devices = await reader.listVideoInputDevices();
      if (devices.length === 0) throw new Error('No cameras found');

      await reader.decodeFromVideoDevice(
        devices[0].deviceId,
        videoRef.current!,
        (result: Result | null, err: Error | null) => {
          if (result && !state.isProcessing) {
            handleScan(result.getText());
          }
          if (err && !(err instanceof NotFoundException)) {
            console.warn('Scan error:', err);
          }
        }
      );

      setState(prev => ({ ...prev, isLoading: false, isScanning: true }));
    } catch (err: unknown) {
      const error = err as Error;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to access camera'
      }));
    }
  }, [state.isProcessing, testCameraAccess, handleScan]);

  useEffect(() => {
    initCamera();
    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [initCamera]);

  const { isLoading, error, isProcessing, isScanning } = state;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <span>Scan QR Code</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Initializing camera...</p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive text-sm mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setState(prev => ({ ...prev, error: null }));
                      initCamera();
                    }}
                  >
                    Try Again
                  </Button>
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
                    <div className="border-2 border-primary rounded-lg w-48 h-48 animate-pulse">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`absolute ${i < 2 ? 'top-0' : 'bottom-0'} ${
                          i % 2 === 0 ? 'left-0' : 'right-0'
                        } w-6 h-6 border-t-4 border-l-4 border-primary rounded-${
                          i === 0 ? 'tl' : i === 1 ? 'tr' : i === 2 ? 'bl' : 'br'
                        }-lg`} />
                      ))}
                    </div>
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                      <p>Processing...</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Scan the QR code on your ID Card
          </p>
        </CardContent>
      </Card>
    </div>
  );
}