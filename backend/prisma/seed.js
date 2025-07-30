const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sysware.com' },
    update: {},
    create: {
      email: 'admin@sysware.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create bos user
  const bosPassword = await bcrypt.hash('bos123', 12);
  const bos = await prisma.user.upsert({
    where: { email: 'bos@sysware.com' },
    update: {},
    create: {
      email: 'bos@sysware.com',
      password: bosPassword,
      role: 'BOS',
      divisi: 'IT Development'
    }
  });

  console.log('Seed data created:', { admin, bos });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });