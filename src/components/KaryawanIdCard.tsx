import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { KaryawanResponse } from "@/services/karyawanService";

interface KaryawanIdCardProps {
  karyawan: KaryawanResponse;
  onClose: () => void;
}

const KaryawanIdCard = ({ karyawan, onClose }: KaryawanIdCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Ambil foto karyawan
  const getFotoUrl = () => {
    if (!karyawan.foto) return "/placeholder.svg";
    return `http://localhost:5001/uploads/${karyawan.foto}`;
  };

  // Ambil QR Code
  const getQrCodeUrl = () => {
    if (!karyawan.qrCode) return null;
    if (!karyawan.qrCode.startsWith("<svg")) {
      return `http://localhost:5001/uploads/${karyawan.qrCode}`;
    }
    return `data:image/svg+xml;base64,${btoa(karyawan.qrCode)}`;
  };

  // Cetak ID Card
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card - ${karyawan.nama}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f0f0; }
            .id-card { width: 320px; margin: 0 auto; background: white; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden; }
            .header { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: white; padding: 16px; text-align: center; }
            .header h2 { margin: 0; font-size: 14px; font-weight: bold; }
            .header span { font-size: 11px; opacity: 0.9; }
            .photo { 
              width: 100px; 
              height: 120px; 
              display: block; 
              margin: 16px auto; 
              object-fit: cover; 
              border: 2px solid #ddd; 
              border-radius: 8px; 
              background: #f1f5f9; 
            }
            .info { padding: 0 20px 16px; text-align: center; }
            .info h3 { margin: 8px 0 4px; font-size: 16px; }
            .info p { margin: 2px 0; font-size: 13px; color: #555; }
            .details { background: #f9fafb; border-top: 1px solid #eee; padding: 12px 20px; font-size: 12px; }
            .details div { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .qr { text-align: center; padding: 12px; border-top: 1px solid #eee; }
            .qr img { width: 110px; height: 110px; border: 1px solid #ddd; border-radius: 6px; background: white; display:block; margin:0 auto; }
            .qr small { display: block; margin-top: 4px; font-size: 11px; color: #666; }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              <h2>PT SYSWARE INDONESIA</h2>
              <span>Employee ID Card</span>
            </div>
            <img src="${getFotoUrl()}" alt="Foto" class="photo"/>
            <div class="info">
              <h3>${karyawan.nama}</h3>
              <p>${karyawan.jabatan}</p>
            </div>
            <div class="details">
              <div><span>NIP:</span><span>${karyawan.nip}</span></div>
              <div><span>Divisi:</span><span>${karyawan.divisi}</span></div>
            </div>
            <div class="qr">
              ${
                getQrCodeUrl()
                  ? `<img src="${getQrCodeUrl()}" alt="QR Code"/>`
                  : `<div>QR Code tidak tersedia</div>`
              }
              <small>Scan untuk absensi</small>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="w-80 mx-auto bg-card border rounded-xl overflow-hidden shadow-lg"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-center">
          <div className="font-bold text-sm">PT SYSWARE INDONESIA</div>
          <div className="text-xs opacity-90">Employee ID Card</div>
        </div>

        {/* Body */}
        <div className="p-5 text-center">
          {/* FOTO */}
          <div className="w-28 h-32 mx-auto mb-4 rounded-md overflow-hidden border border-border bg-gray-100 flex items-center justify-center">
            <img
              src={getFotoUrl()}
              alt="Foto"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>

          <h3 className="text-lg font-bold">{karyawan.nama}</h3>
          <p className="text-sm text-muted-foreground">{karyawan.jabatan}</p>

          {/* Detail */}
          <div className="bg-muted/50 p-4 rounded-lg text-left mb-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span>NIP:</span>
              <span>{karyawan.nip}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Divisi:</span>
              <span>{karyawan.divisi}</span>
            </div>
          </div>

          {/* QR */}
          <div className="text-center border-t pt-4">
            <div className="w-28 h-28 mx-auto mb-2 border rounded bg-white p-1 flex items-center justify-center">
              {getQrCodeUrl() ? (
                <img
                  src={getQrCodeUrl()!}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  QR Code tidak tersedia
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Scan untuk absensi</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex space-x-2">
        <Button onClick={handlePrint} className="flex-1">
          <Download className="h-4 w-4 mr-2" /> Print ID Card
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1">
          Tutup
        </Button>
      </div>
    </div>
  );
};

export default KaryawanIdCard;
