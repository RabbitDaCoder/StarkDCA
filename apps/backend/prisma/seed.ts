// ─── Prisma Seed ─────────────────────────────────────────────────────
// Seeds the database with the admin user.

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'starkdca@gmail.com';
  const adminPassword = 'starkdca2026@';

  // Hash the password
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Upsert admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      passwordHash,
      emailVerified: true,
      launchAccessGranted: true,
      name: 'StarkDCA Admin',
    },
    create: {
      email: adminEmail,
      name: 'StarkDCA Admin',
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
      launchAccessGranted: true,
    },
  });

  console.log(`✅ Admin user seeded: ${admin.email} (ID: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
