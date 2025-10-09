# Scripts

This directory contains utility scripts for managing the MemoryHelper application.

## Available Scripts

### `seed-roles.ts`
Seeds the default roles (visitor, student, teacher, administrator) into the database.

**Usage:**
```bash
npm run seed:roles
```

**When to use:**
- First time setting up the application
- After adding new roles or modifying role definitions
- Safe to run multiple times (idempotent)

---

### `make-admin.ts`
Assigns the administrator role to an existing user. This is essential for bootstrapping the RBAC system, as you need at least one administrator to manage other users.

**Usage:**
```bash
npm run make-admin <user-email>
```

**Example:**
```bash
npm run make-admin alice@example.com
```

**Prerequisites:**
- User must have already signed up in the application
- Roles must be seeded (script will do this automatically if needed)

**When to use:**
- First time setup: Make yourself an administrator
- Promoting existing users to administrators
- Recovering from accidental administrator removal

**Output:**
The script will:
1. ✅ Check/seed roles if needed
2. ✅ Look up the user by email
3. ✅ Assign the administrator role (global)
4. ✅ Display success message with next steps

**Next steps after running:**
1. Log out and log back in to refresh your session
2. Visit `/admin/roles` to manage user roles

---

## Typical Setup Flow

For a fresh installation:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env` (if available)
   - Configure your `DATABASE_URL` and other variables

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Sign up in the application**
   - Visit `http://localhost:3000`
   - Create your account (Google OAuth or email/password)

5. **Seed roles**
   ```bash
   npm run seed:roles
   ```

6. **Make yourself an administrator**
   ```bash
   npm run make-admin your-email@example.com
   ```

7. **Access admin panel**
   - Log out and log back in
   - Visit `http://localhost:3000/admin/roles`
   - Start managing user roles!

---

## Troubleshooting

### "User not found" error
- Make sure you've signed up in the application first
- Check that you're using the exact email address from your account

### "Administrator role not found" error
- Run `npm run seed:roles` first
- Check that your database connection is working

### "No response" or hangs
- Check that your `DATABASE_URL` in `.env` is correct
- Ensure MongoDB is running and accessible

### Script shows "deprecated" warning
- These warnings from dependencies are safe to ignore
- The scripts will still work correctly

---

## Adding New Scripts

When creating new utility scripts:

1. Place them in this `scripts/` directory
2. Use TypeScript (`.ts` extension)
3. Import from `../src/` as needed
4. Add error handling and helpful console output
5. Update `package.json` with a script command
6. Document it in this README

Example script structure:
```typescript
import { someFunction } from '../src/lib/db/api/something';

async function main() {
  try {
    console.log('Starting...');
    // Your logic here
    console.log('✅ Success!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
```
