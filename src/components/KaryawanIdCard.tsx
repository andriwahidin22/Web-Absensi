import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { KaryawanResponse } from '@/services/karyawanService';

interface KaryawanIdCardProps {
  karyawan: KaryawanResponse;
  onClose: () => void;
}

const KaryawanIdCard = ({ karyawan, onClose }: KaryawanIdCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = cardRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card - ${karyawan.nama}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5; 
            }
            .id-card { 
              width: 320px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 12px; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
              color: white; 
              padding: 20px; 
              text-align: center; 
            }
            .company { 
              font-size: 14px; 
              font-weight: bold; 
              margin-bottom: 4px; 
            }
            .title { 
              font-size: 12px; 
              opacity: 0.9; 
            }
            .content { 
              padding: 20px; 
              text-align: center; 
            }
            .photo { 
              width: 100px; 
              height: 100px; 
              border-radius: 50%; 
              margin: 0 auto 16px; 
              border: 4px solid #f1f5f9; 
              object-fit: cover; 
              background: #f1f5f9; 
            }
            .name { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 4px; 
              color: #1e293b; 
            }
            .position { 
              font-size: 14px; 
              color: #64748b; 
              margin-bottom: 16px; 
            }
            .info { 
              text-align: left; 
              background: #f8fafc; 
              padding: 16px; 
              border-radius: 8px; 
              margin-bottom: 16px; 
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px; 
              font-size: 12px; 
            }
            .info-row:last-child { 
              margin-bottom: 0; 
            }
            .label { 
              font-weight: 600; 
              color: #475569; 
            }
            .value { 
              color: #1e293b; 
            }
            .qr-section { 
              text-align: center; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 16px; 
            }
            .qr-code { 
              width: 80px; 
              height: 80px; 
              margin: 0 auto 8px; 
              border: 1px solid #e2e8f0; 
              border-radius: 4px; 
              background: white; 
            }
            .qr-text { 
              font-size: 10px; 
              color: #64748b; 
            }
            @media print {
              body { background: white; }
              .id-card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              <div class="company">PT SYSWARE INDONESIA</div>
              <div class="title">Employee ID Card</div>
            </div>
            <div class="content">
              <img src="${karyawan.foto || '/placeholder.svg'}" alt="Foto" class="photo" />
              <div class="name">${karyawan.nama}</div>
              <div class="position">${karyawan.jabatan}</div>
              
              <div class="info">
                <div class="info-row">
                  <span class="label">NIP:</span>
                  <span class="value">${karyawan.nip}</span>
                </div>
                <div class="info-row">
                  <span class="label">Divisi:</span>
                  <span class="value">${karyawan.divisi}</span>
                </div>
                <div class="info-row">
                  <span class="label">Bergabung:</span>
                  <span class="value">${new Date(karyawan.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              
              <div class="qr-section">
                <img src="data:image/svg+xml;base64,${btoa(karyawan.qrCode)}" alt="QR Code" class="qr-code" />
                <div class="qr-text">Scan untuk absensi</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="space-y-4">
      {/* ID Card Preview */}
      <div ref={cardRef} className="w-80 mx-auto bg-card border rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-center">
          <div className="font-bold text-sm mb-1">PT SYSWARE INDONESIA</div>
          <div className="text-xs opacity-90">Employee ID Card</div>
        </div>

        {/* Content */}
        <div className="p-5 text-center">
          {/* Photo */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-border">
            <img 
              src={karyawan.foto || '/placeholder.svg'} 
              alt="Foto" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name & Position */}
          <h3 className="text-lg font-bold text-foreground mb-1">{karyawan.nama}</h3>
          <p className="text-sm text-muted-foreground mb-4">{karyawan.jabatan}</p>

          {/* Info */}
          <div className="bg-muted/50 p-4 rounded-lg text-left mb-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">NIP:</span>
              <span className="text-foreground">{karyawan.nip}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Divisi:</span>
              <span className="text-foreground">{karyawan.divisi}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Bergabung:</span>
              <span className="text-foreground">
                {new Date(karyawan.createdAt).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center border-t pt-4">
            <div className="w-20 h-20 mx-auto mb-2 border rounded bg-white p-1">
              <img 
                src={`data:image/svg+xml;base64,${btoa(karyawan.qrCode)}`}
                alt="QR Code" 
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">Scan untuk absensi</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button onClick={handlePrint} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Print ID Card
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1">
          Tutup
        </Button>
      </div>
    </div>
  );
};

export default KaryawanIdCard;