import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Download, CalendarIcon, Filter, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const AdminLaporan = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedDivisi, setSelectedDivisi] = useState<string>('');
  const [reportType, setReportType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'kehadiran', label: 'Laporan Kehadiran', icon: Users },
    { value: 'keterlambatan', label: 'Laporan Keterlambatan', icon: CalendarIcon },
    { value: 'rekap-bulanan', label: 'Rekap Bulanan', icon: BarChart3 },
    { value: 'absensi-detail', label: 'Detail Absensi', icon: FileText }
  ];

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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Laporan berhasil digenerate!');
      
      // Mock download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `laporan-${reportType}-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      toast.error('Gagal generate laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    toast.success('Export CSV akan segera tersedia');
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
                    <SelectItem value="">Semua Divisi</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
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