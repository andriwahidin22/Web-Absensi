
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sysware.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create boss user
  const bosPassword = await bcrypt.hash('bos123', 10);
  const bos = await prisma.user.create({
    data: {
      email: 'bos@sysware.com',
      password: bosPassword,
      role: 'BOS',
      divisi: 'IT Development'
    }
  });

  // Create sample employees
  const employees = [
    {
      nip: 'EMP001',
      nama: 'John Doe',
      jabatan: 'Software Developer',
      divisi: 'IT Development',
      qrCode: 'QR_EMP001'
    },
    {
      nip: 'EMP002',
      nama: 'Jane Smith',
      jabatan: 'UI/UX Designer',
      divisi: 'IT Development',
      qrCode: 'QR_EMP002'
    }
  ];

  for (const emp of employees) {
    await prisma.karyawan.create({
      data: emp
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
