import { assignUserRole } from '../src/lib/db/api/user-role';
import { getRoleByName } from '../src/lib/db/api/role';
import { getUserByEmail } from '../src/lib/db/api/user';
import { seedRoles } from '../src/lib/db/seed/roles';

async function makeAdmin() {
  try {
    console.log('🚀 Starting admin assignment...\n');

    // Step 1: Ensure roles are seeded
    console.log('Step 1: Checking/seeding roles...');
    await seedRoles();
    console.log('✅ Roles ready\n');

    // Step 2: Get email from command line argument or prompt
    const email = process.argv[2];

    if (!email) {
      console.error('❌ Error: Please provide an email address');
      console.log('\nUsage:');
      console.log('  npm run make-admin <email>');
      console.log('\nExample:');
      console.log('  npm run make-admin user@example.com');
      process.exit(1);
    }

    console.log(`Step 2: Looking up user with email: ${email}`);
    const user = await getUserByEmail(email);

    if (!user) {
      console.error(`❌ Error: No user found with email "${email}"`);
      console.log('\nMake sure the user has signed up first.');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user.email})\n`);

    // Step 3: Get administrator role
    console.log('Step 3: Getting administrator role...');
    const adminRole = await getRoleByName('administrator');

    if (!adminRole) {
      console.error('❌ Error: Administrator role not found');
      console.log('Please run: npm run seed:roles');
      process.exit(1);
    }

    console.log('✅ Administrator role found\n');

    // Step 4: Assign administrator role
    console.log('Step 4: Assigning administrator role...');
    const userRole = await assignUserRole({
      userId: user._id.toString(),
      roleId: adminRole._id.toString(),
      subjectId: null  // null for global administrator role
    });

    console.log('✅ Administrator role assigned successfully!\n');

    console.log('═══════════════════════════════════════');
    console.log('🎉 SUCCESS!');
    console.log('═══════════════════════════════════════');
    console.log(`User: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: Administrator (Global)`);
    console.log('═══════════════════════════════════════\n');

    console.log('Next steps:');
    console.log('1. Log out and log back in to refresh your session');
    console.log('2. Visit http://localhost:3000/admin/roles to manage users\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error(error);
    process.exit(1);
  }
}

makeAdmin();
