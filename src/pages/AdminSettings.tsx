import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Settings, Save, Bell, Clock, Users, Shield, Database, Download, Upload, Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    companyName: 'PT. Example Company',
    workStartTime: '08:00',
    workEndTime: '17:00',
    lateThreshold: '15',
    timezone: 'Asia/Jakarta',
    emailNotifications: true,
    smsNotifications: false,
    autoLogout: true,
    sessionTimeout: '480',
    backupEnabled: true,
    backupFrequency: 'daily',
    maxLoginAttempts: '3',
    passwordExpiry: '90'
  });

  const handleSave = () => {
    // Simulate saving settings
    toast.success('Pengaturan berhasil disimpan');
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Pengaturan - Admin Dashboard</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pengaturan Sistem</h1>
            <p className="text-muted-foreground">Kelola konfigurasi dan preferensi sistem</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>

        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Pengaturan Perusahaan</span>
            </CardTitle>
            <CardDescription>
              Konfigurasi informasi dasar perusahaan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">Nama Perusahaan</Label>
                <Input
                  id="company-name"
                  value={settings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Zona Waktu</Label>
                <Select value={settings.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Jakarta">WIB (UTC+7)</SelectItem>
                    <SelectItem value="Asia/Makassar">WITA (UTC+8)</SelectItem>
                    <SelectItem value="Asia/Jayapura">WIT (UTC+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Hours Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Jam Kerja</span>
            </CardTitle>
            <CardDescription>
              Atur jam kerja dan ketentuan keterlambatan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="work-start">Jam Masuk</Label>
                <Input
                  id="work-start"
                  type="time"
                  value={settings.workStartTime}
                  onChange={(e) => handleInputChange('workStartTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="work-end">Jam Pulang</Label>
                <Input
                  id="work-end"
                  type="time"
                  value={settings.workEndTime}
                  onChange={(e) => handleInputChange('workEndTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="late-threshold">Batas Telat (menit)</Label>
                <Input
                  id="late-threshold"
                  type="number"
                  value={settings.lateThreshold}
                  onChange={(e) => handleInputChange('lateThreshold', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifikasi</span>
            </CardTitle>
            <CardDescription>
              Kelola pengaturan notifikasi sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifikasi Email</Label>
                <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifikasi SMS</Label>
                <p className="text-sm text-muted-foreground">Terima notifikasi melalui SMS</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Keamanan</span>
            </CardTitle>
            <CardDescription>
              Konfigurasi pengaturan keamanan sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-login">Maksimal Percobaan Login</Label>
                <Input
                  id="max-login"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleInputChange('maxLoginAttempts', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password-expiry">Masa Berlaku Password (hari)</Label>
                <Input
                  id="password-expiry"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Logout</Label>
                <p className="text-sm text-muted-foreground">Logout otomatis saat tidak aktif</p>
              </div>
              <Switch
                checked={settings.autoLogout}
                onCheckedChange={(checked) => handleInputChange('autoLogout', checked)}
              />
            </div>
            {settings.autoLogout && (
              <div>
                <Label htmlFor="session-timeout">Timeout Session (menit)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Backup & Pemulihan</span>
            </CardTitle>
            <CardDescription>
              Pengaturan backup data otomatis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Otomatis</Label>
                <p className="text-sm text-muted-foreground">Aktifkan backup data otomatis</p>
              </div>
              <Switch
                checked={settings.backupEnabled}
                onCheckedChange={(checked) => handleInputChange('backupEnabled', checked)}
              />
            </div>
            {settings.backupEnabled && (
              <div>
                <Label htmlFor="backup-frequency">Frekuensi Backup</Label>
                <Select value={settings.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Setiap Jam</SelectItem>
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminSettings;