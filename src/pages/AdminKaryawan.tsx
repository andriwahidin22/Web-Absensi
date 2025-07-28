import { Helmet } from 'react-helmet-async';
import KaryawanManager from '@/components/KaryawanManager';

const AdminKaryawan = () => {
  return (
    <>
      <Helmet>
        <title>Kelola Karyawan - Admin Dashboard</title>
      </Helmet>
      <KaryawanManager />
    </>
  );
};

export default AdminKaryawan;