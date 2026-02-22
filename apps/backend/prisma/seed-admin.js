// Simple JS seed script - run with: node prisma/seed-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash('starkdca2026@', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'starkdca@gmail.com' },
      update: {
        role: 'ADMIN',
        passwordHash: hash,
        emailVerified: true,
        launchAccessGranted: true,
        name: 'StarkDCA Admin',
      },
      create: {
        email: 'starkdca@gmail.com',
        name: 'StarkDCA Admin',
        passwordHash: hash,
        role: 'ADMIN',
        emailVerified: true,
        launchAccessGranted: true,
      },
    });
    console.log('Admin seeded:', admin.email, admin.id);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
