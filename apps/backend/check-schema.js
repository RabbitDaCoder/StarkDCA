const { PrismaClient, Prisma } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const cols = await p.$queryRawUnsafe(
    "SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position",
  );
  console.log('User columns:', cols.map((c) => c.column_name).join(', '));

  const tables = await p.$queryRawUnsafe(
    "SELECT tablename FROM pg_tables WHERE schemaname='public'",
  );
  console.log('Tables:', tables.map((t) => t.tablename).join(', '));
}

main()
  .catch((e) => console.error('Error:', e.message))
  .finally(() => p.$disconnect());
