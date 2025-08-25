import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Download, CalendarIcon, Filter, BarChart3, Users, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { reportService } from '@/services/reportService';

// Define types for report data
interface ReportSummary {
  totalKaryawan: number;
  hadirHariIni: number;
  telatHariIni: number;
  izinHariIni: number;
  alphaHariIni: number;
  persentaseKehadiran: number;
}

interface KehadiranItem {
  nama: string;
  divisi: string;
  hadir: number;
  izin: number;
  alpha: number;
  persentase: number;
}

interface KeterlambatanItem {
  nama: string;
  divisi: string;
  totalTelat: number;
  rataWaktu: string;
  maksimal: string;
}

interface ReportData {
  summary: ReportSummary;
  kehadiran?: KehadiranItem[];
  keterlambatan?: KeterlambatanItem[];
}

interface ReportType {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AdminLaporan = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedDivisi, setSelectedDivisi] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const reportTypes: ReportType[] = [
    { value: 'kehadiran', label: 'Laporan Kehadiran', icon: Users },
    { value: 'keterlambatan', label: 'Laporan Keterlambatan', icon: CalendarIcon },
    { value: 'rekap-bulanan', label: 'Rekap Bulanan', icon: BarChart3 },
    { value: 'absensi-detail', label: 'Detail Absensi', icon: FileText }
  ];

  const divisiOptions = [
    { value: 'all', label: 'Semua Divisi' },
    { value: 'IT', label: 'IT' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' }
  ];

  const loadReportData = useCallback(async () => {
    if (!startDate || !endDate || !reportType) return;

    try {
      setLoading(true);
      const data = await reportService.generateReport({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        divisi: selectedDivisi !== 'all' ? selectedDivisi : undefined,
        reportType: reportType as 'kehadiran' | 'keterlambatan' | 'rekap-bulanan' | 'absensi-detail'
      });
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, reportType, selectedDivisi]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast.error('Pilih jenis laporan terlebih dahulu');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Pilih rentang tanggal terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      
      const blob = await reportService.exportPDF({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        divisi: selectedDivisi !== 'all' ? selectedDivisi : undefined,
        reportType: reportType as 'kehadiran' | 'keterlambatan' | 'rekap-bulanan' | 'absensi-detail'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-${reportType}-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Laporan berhasil digenerate!');
      
    } catch (error) {
      toast.error('Gagal generate laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!reportType || !startDate || !endDate) {
      toast.error('Pilih jenis laporan dan tanggal terlebih dahulu');
      return;
    }

    try {
      const blob = await reportService.exportCSV({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        divisi: selectedDivisi !== 'all' ? selectedDivisi : undefined,
        reportType: reportType as 'kehadiran' | 'keterlambatan' | 'rekap-bulanan' | 'absensi-detail'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-${reportType}-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Data berhasil diexport ke CSV!');
    } catch (error) {
      toast.error('Gagal export CSV');
    }
  };

  return (
    <>
      <Helmet>
        <title>Laporan - Admin Dashboard</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Laporan & Export</h1>
          <p className="text-muted-foreground">Generate dan export laporan kehadiran karyawan</p>
        </div>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Generate Laporan</span>
            </CardTitle>
            <CardDescription>
              Pilih jenis laporan dan rentang tanggal untuk generate laporan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="report-type">Jenis Laporan</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis laporan" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tanggal Mulai</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy', { locale: id }) : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Tanggal Selesai</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yyyy', { locale: id }) : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="divisi">Divisi (Opsional)</Label>
                <Select value={selectedDivisi} onValueChange={setSelectedDivisi}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisiOptions.map(divisi => (
                      <SelectItem key={divisi.value} value={divisi.value}>
                        {divisi.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={handleGenerateReport}
                disabled={loading}
                className="flex-1 max-w-xs"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Generating...' : 'Generate PDF'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card key={type.value} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <IconComponent className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <CardTitle className="text-lg">{type.label}</CardTitle>
                  <CardDescription>
                    {type.value === 'kehadiran' && 'Laporan kehadiran harian karyawan'}
                    {type.value === 'keterlambatan' && 'Analisis keterlambatan karyawan'}
                    {type.value === 'rekap-bulanan' && 'Ringkasan kehadiran bulanan'}
                    {type.value === 'absensi-detail' && 'Detail lengkap data absensi'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setReportType(type.value)}
                  >
                    Pilih Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div className="text-2xl font-bold">{reportData?.summary?.totalKaryawan || 0}</div>
                </div>
                <p className="text-xs text-muted-foreground">Total Karyawan</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{reportData?.summary?.hadirHariIni || 0}</div>
                </div>
                <p className="text-xs text-muted-foreground">Hadir Hari Ini</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-600">{reportData?.summary?.telatHariIni || 0}</div>
                </div>
                <p className="text-xs text-muted-foreground">Telat Hari Ini</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{reportData?.summary?.izinHariIni || 0}</div>
                <p className="text-xs text-muted-foreground">Izin</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{reportData?.summary?.alphaHariIni || 0}</div>
                <p className="text-xs text-muted-foreground">Alpha</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{reportData?.summary?.persentaseKehadiran || 0}%</div>
                <p className="text-xs text-muted-foreground">Persentase Kehadiran</p>
                <Progress value={reportData?.summary?.persentaseKehadiran || 0} className="mt-2" />
              </CardContent>
            </Card>
        </div>

        {/* Live Data Tables */}
        {reportType === 'kehadiran' && (
          <Card>
            <CardHeader>
              <CardTitle>Laporan Kehadiran Bulanan</CardTitle>
              <CardDescription>Data kehadiran karyawan bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Hadir</TableHead>
                    <TableHead>Izin</TableHead>
                    <TableHead>Alpha</TableHead>
                    <TableHead>Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.kehadiran?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.divisi}</Badge>
                      </TableCell>
                      <TableCell className="text-green-600">{item.hadir}</TableCell>
                      <TableCell className="text-blue-600">{item.izin}</TableCell>
                      <TableCell className="text-red-600">{item.alpha}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.persentase}%</span>
                          <Progress value={item.persentase} className="w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportType === 'keterlambatan' && (
          <Card>
            <CardHeader>
              <CardTitle>Laporan Keterlambatan</CardTitle>
              <CardDescription>Analisis keterlambatan karyawan</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Total Telat</TableHead>
                    <TableHead>Rata-rata</TableHead>
                    <TableHead>Maksimal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.keterlambatan?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.divisi}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{item.totalTelat}x</Badge>
                      </TableCell>
                      <TableCell>{item.rataWaktu}</TableCell>
                      <TableCell className="text-red-600">{item.maksimal}</TableCell>
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Terbaru</CardTitle>
            <CardDescription>Riwayat laporan yang telah digenerate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Laporan Kehadiran November 2024', date: '2024-12-01', type: 'PDF', size: '2.4 MB' },
                { name: 'Rekap Keterlambatan Oktober 2024', date: '2024-11-01', type: 'PDF', size: '1.8 MB' },
                { name: 'Detail Absensi September 2024', date: '2024-10-01', type: 'CSV', size: '856 KB' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.type} • {report.size} • {format(new Date(report.date), 'dd MMM yyyy', { locale: id })}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminLaporan;