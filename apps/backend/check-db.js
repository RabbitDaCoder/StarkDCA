const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const uc = await p.user.count();
  const wc = await p.waitlistUser.count();
  const vc = await p.user.count({ where: { emailVerified: true } });
  console.log('User count:', uc, 'WaitlistUser count:', wc, 'Verified:', vc);
  const users = await p.user.findMany({
    select: { id: true, email: true, emailVerified: true, name: true },
  });
  console.log('Users:', JSON.stringify(users, null, 2));
  await p.$disconnect();
})();
