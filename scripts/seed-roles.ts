import { seedRoles } from '../src/lib/db/seed/roles';

async function main() {
  console.log('Starting role seeding...');
  const result = await seedRoles();

  if (result.success) {
    console.log('✅ Role seeding completed successfully');
    console.log(JSON.stringify(result.results, null, 2));
  } else {
    console.error('❌ Role seeding failed:', result.error);
    process.exit(1);
  }

  process.exit(0);
}

main();
