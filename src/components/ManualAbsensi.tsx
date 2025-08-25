//src/components/ManualAbsensi.tsx

import { useState, useRef, useEffect, CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Keyboard, Check, X, Maximize2, Minimize2 } from 'lucide-react';
import { absensiService } from '@/services/absensiService';
import { useToast } from '@/hooks/use-toast';
import { ServiceResponse } from '@/types/service';
import { AbsensiResponse } from '@/types/absensi';

interface ManualAbsensiProps {
  onSuccess: (result: ServiceResponse<AbsensiResponse>) => void;
  onClose: () => void;
}

const ManualAbsensi = ({ onSuccess, onClose }: ManualAbsensiProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popupSize, setPopupSize] = useState({ width: 400, height: 500 });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle click outside to close keyboard
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        keyboardRef.current && 
        !keyboardRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setShowKeyboard(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Center popup on mount
    setPosition({
      x: (window.innerWidth - popupSize.width) / 2,
      y: (window.innerHeight - popupSize.height) / 3
    });
  }, [popupSize]);

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Ensure popup stays within viewport
        const boundedX = Math.max(0, Math.min(newX, window.innerWidth - popupSize.width));
        const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 100));
        
        setPosition({
          x: boundedX,
          y: boundedY
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMaximized, popupSize]);

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
        description: result.data?.message || "Absensi berhasil dicatat",
        variant: "default"
      });
      
      onSuccess(result);
    } catch (error: unknown) {
      console.error('Manual absensi error:', error);
      const errorMessage = error instanceof Error ? error.message : "Gagal melakukan absensi manual";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setCode(prev => prev.slice(0, -1));
    } else if (key === 'enter') {
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      handleSubmit(syntheticEvent);
    } else if (key === 'space') {
      setCode(prev => prev + ' ');
    } else {
      setCode(prev => prev + key);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (popupRef.current && !isMaximized) {
      const rect = popupRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized) {
      // Save current size before maximizing
      if (popupRef.current) {
        setPopupSize({
          width: popupRef.current.offsetWidth,
          height: popupRef.current.offsetHeight
        });
      }
      setPosition({ x: 0, y: 0 });
    } else {
      // Restore to center when minimizing
      setPosition({
        x: (window.innerWidth - popupSize.width) / 2,
        y: (window.innerHeight - popupSize.height) / 3
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = popupRef.current?.offsetWidth || popupSize.width;
    const startHeight = popupRef.current?.offsetHeight || popupSize.height;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(350, Math.min(startWidth + (e.clientX - startX), window.innerWidth - 50));
      const newHeight = Math.max(400, Math.min(startHeight + (e.clientY - startY), window.innerHeight - 100));
      
      setPopupSize({
        width: newWidth,
        height: newHeight
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const keyboardLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '-', '_'],
    ['backspace', 'space', 'enter']
  ];

  const popupStyle: CSSProperties = isMaximized 
    ? { 
        width: '100vw', 
        height: '100vh', 
        top: 0,
        left: 0,
        borderRadius: 0
      } 
    : {
        width: `${popupSize.width}px`,
        height: `${popupSize.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
      };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 p-4 overflow-hidden">
      <div 
        ref={popupRef}
        className="bg-background rounded-xl shadow-lg overflow-hidden flex flex-col absolute"
        style={popupStyle}
      >
        {/* Header dengan drag area dan kontrol */}
        <div 
          className="flex justify-between items-center p-3 border-b cursor-move bg-muted/30"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2 text-primary font-semibold">
            <Keyboard className="h-4 w-4" />
            <span>Absensi Manual</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleMaximize}
              className="h-7 w-7 p-0"
            >
              {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Konten utama */}
        <div className="overflow-y-auto flex-grow p-4">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Masukkan Kode Absensi</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Masukkan kode yang tertera pada QR Code ID Card Anda
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Kode Absensi</Label>
              <Input
                id="code"
                ref={inputRef}
                type="text"
                placeholder="Contoh: NIP atau kode QR"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-md py-2"
                autoFocus
                onFocus={() => setShowKeyboard(true)}
                readOnly // Prevent default keyboard on mobile
              />
              <p className="text-xs text-muted-foreground text-center">
                * Kode dapat berupa NIP atau kode yang ada di QR Code ID Card
              </p>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={loading || !code.trim()}
                className="flex-1 py-2"
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
                className="py-2"
              >
                Batal
              </Button>
            </div>
          </div>

          {/* Virtual Keyboard */}
          {showKeyboard && (
            <div 
              ref={keyboardRef}
              className="mt-4 p-2 bg-muted rounded-lg border"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Keyboard Virtual</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowKeyboard(false)}
                  className="h-5 w-5 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {keyboardLayout.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center space-x-1">
                    {row.map((key) => {
                      let displayKey = key;
                      let className = "min-w-6 h-7 text-xs p-0";

                      if (key === 'backspace') {
                        displayKey = '⌫';
                        className += " bg-destructive/20 text-destructive-foreground hover:bg-destructive/30";
                      } else if (key === 'space') {
                        displayKey = 'Spasi';
                        className += " flex-grow max-w-[120px] bg-primary/10 hover:bg-primary/20";
                      } else if (key === 'enter') {
                        displayKey = '✓';
                        className += " bg-primary/80 text-primary-foreground hover:bg-primary";
                      } else {
                        className += " bg-background hover:bg-accent";
                      }

                      return (
                        <Button
                          key={key}
                          type="button"
                          variant="outline"
                          className={className}
                          onClick={() => handleKeyPress(key)}
                        >
                          {displayKey}
                        </Button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resize handle */}
        {!isMaximized && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" 
            onMouseDown={handleResizeMouseDown}
          >
            <div className="w-full h-full border-l-2 border-b-2 border-muted-foreground/30 rounded-bl-lg"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualAbsensi;