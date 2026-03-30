# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MemoryHelper is a Next.js 15 application for spaced repetition learning, built with TypeScript, React 19, MongoDB/Mongoose, and NextAuth for authentication. The app uses a hierarchical content structure (Subject → Unit → MemoryPiece) with an intelligent spaced repetition system (SRS) for optimized memory retention.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Node inspector on port 3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed:roles` - Seed default roles into database (run once on setup)
- `npm run make-admin <email>` - Assign administrator role to a user (bootstrapping)

### TypeScript Path Aliases
- `@/*` → `./src/*`
- `@public/*` → `./public/*`

## Environment Variables

Required variables (see `src/lib/env.ts`):
- `DATABASE_URL` - MongoDB connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `IMAGE_BASE_PATH` - Base path for image assets
- `SECRET` - Application secret
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - NextAuth URL

## Architecture

### Data Model Hierarchy

The app follows a three-level content hierarchy:

1. **Subject** (`src/lib/db/model/Subject.ts`)
   - Top-level learning topic (e.g., "Chinese Characters")
   - Has title, description, labels, imageUrls

2. **Unit** (`src/lib/db/model/Unit.ts`)
   - Organizational container within a subject
   - Types: 'chapter', 'lesson', or 'module'
   - Can have parent units (hierarchical nesting)
   - Virtual fields: `children` (child units), `memoryPieces` (content items)

3. **MemoryPiece** (`src/lib/db/model/MemoryPiece.ts`)
   - Atomic learning content (flashcard equivalent)
   - Can belong to multiple units
   - Unlinking from a unit removes the unit reference, not the memory piece itself
   - Orphaned memory pieces (no unit associations) are kept and remain searchable
   - Has content, description, labels, imageUrls

### Spaced Repetition System

The SRS implementation is in `src/lib/utils/subscriptionUtils.ts`:

- **Subscription** (`src/lib/db/model/Subscription.ts`)
  - Links User to MemoryPiece with SRS metadata
  - Tracks: status ('new', 'learning', 'learned', 'lapsed'), easeFactor, currentInterval, nextTestDate
  - Unique constraint on (userId, memoryPieceId)

- **MemoryCheck** (`src/lib/db/model/MemoryCheck.ts`)
  - Records practice attempt results
  - Score: 0-5 (0=blackout, 3=hard correct, 4=good, 5=perfect)

- **SRS Parameters** (in `subscriptionUtils.ts`):
  - Initial intervals, graduating intervals, ease factor bounds
  - History-weighted performance metrics (HPM) for adaptive difficulty
  - Quality-to-score mapping for granular performance tracking

### Core User Flows

1. **Practice Flow** (`src/app/practice/page.tsx`)
   - Fetches subscriptions due for review using `getSubscriptionsDueToCheckForUser()`
   - Displays items in `PracticeTable` component
   - Creates MemoryChecks and updates Subscriptions via `processSubscriptions()`

2. **Review Flow** (`src/app/review/page.tsx`)
   - Shows all subscribed memory pieces
   - Uses `getSubscriptionsForUser()` to fetch user's subscriptions

3. **Self-Check Flow** (`src/app/selfcheck/`)
   - User-initiated practice outside the SRS schedule

### Database Layer

- **Connection**: `src/lib/db/utils.ts` - Singleton MongoDB connection with caching
- **API Layer**: `src/lib/db/api/` - Data access functions for each model
  - `memory-piece.ts`, `subscription.ts`, `unit.ts`, `subject.ts`, `user.ts`, `memory-check.ts`

### Authentication & Authorization

**Authentication**:
- NextAuth configuration in `src/lib/utils/authOptions.ts`
- Providers: Google OAuth + Credentials (email/password with bcrypt)
- Protected routes via middleware (`middleware.ts`): `/review`, `/practice`
- User management in `src/lib/db/api/user.ts`

**Role-Based Access Control (RBAC)**:
- 4 role levels: `visitor` (default), `student`, `teacher`, `administrator`
- 6 permission types: `view`, `practice`, `manage_content`, `manage_student`, `manage_subject`, `manage_teacher`
- Hybrid model: Global roles (visitor, administrator) and subject-scoped roles (student, teacher)
- Models: `Role` (definitions), `UserRole` (assignments), `User.defaultRole` (fallback)
- Permission checking: `src/lib/utils/permissions.ts` - use `hasPermission()`, `isAdministrator()`
- Client-side hook: `usePermissions()` for checking session permissions
- Component: `<PermissionGate>` for conditional rendering based on permissions
- Admin UI: `/admin/roles` for role management (administrators only)
- See `RBAC_GUIDE.md` for complete documentation

### Image Handling

- S3 integration for image uploads (`src/app/api/s3/`)
- Remote patterns configured in `next.config.ts`:
  - `lh3.googleusercontent.com` (Google avatars)
  - `chineselearning.cloudfront.gcdn.top`
  - `memoryhelper.s3.us-west-1.amazonaws.com`
- Upload utilities in `src/lib/utils/fileUtils.ts`

### UI Components

Key shared components in `src/app/components/`:
- **Cards**: `HeroCard`, `MemoryPieceCard`, `SubjectCard`, `UnitCard`
- **Forms**: `CreateMemoryPieceForm`, `ImageUploader`
- **Modals**: `AddSubjectModal`, `AddRootUnitModal`, `UnitAddContentModal`
- **Tables**: `PracticeTable` (SRS practice interface)
- **Dashboard**: Dashboard components for analytics/performance
- **Navbar**: Navigation with search functionality

### Styling

- Tailwind CSS with custom config (`tailwind.config.ts`)
- Theme providers: `colors-theme-provider`, `theme-provider` (`src/providers/`)
- shadcn/ui components (button, card, tabs, select, etc.)

## Key Patterns

### Model Definition Pattern
All Mongoose models use conditional definition to avoid re-compilation errors:
```typescript
let Model: Model<Props>;
if (!mongoose.models.ModelName) {
  // define schema
  Model = mongoose.model<Props>('ModelName', schema);
} else {
  Model = mongoose.models.ModelName as Model<Props>;
}
```

### Virtual Relationships
Units and Subscriptions use Mongoose virtuals for related data:
- Unit.children, Unit.memoryPieces
- Subscription.memoryChecks, Subscription.memoryPiece

### Server Actions
Next.js server actions are used for mutations (e.g., `createMemoryChecks` in practice page)

## Route Structure

- `/` - Home page
- `/subject/[id]` - Subject detail with units
- `/unit/[id]` - Unit detail with memory pieces or child units
- `/memorypiece/[id]` - Memory piece detail
- `/practice` - SRS practice session (protected)
- `/review` - Review subscribed items (protected)
- `/selfcheck` - Self-initiated practice
- `/performance` - User performance analytics
- `/auth/signin`, `/auth/signup` - Authentication pages
- `/admin/roles` - Role management UI (administrators only)

## API Routes

- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/auth/signup` - User registration
- `/api/s3/upload` - Image upload to S3
- `/api/s3/delete` - Delete S3 images
- `/api/generate-chinese-character-description` - AI-generated descriptions
- `/api/read-text` - Text extraction utilities
- `/api/search` - Fulltext search for memory pieces
- `/api/admin/user-roles` - Role assignment management (administrators only)

## Production Deployment

For AWS EC2 deployment (see `scripts.md`):
1. Setup Node.js 20.x on Ubuntu
2. Clone repo and install dependencies
3. Configure Caddy for reverse proxy
4. Use PM2 to run: `pm2 start npm --name nextjs-app -- run start -- -p 3000`

## Important Notes

- The app uses spaced repetition algorithms similar to Anki/SuperMemo
- Subscription status transitions: new → learning → learned (or → lapsed on poor performance)
- The middleware has a typo: matcher includes `/rerview` instead of `/review`
- Images support multiple sources (local upload, S3, external URLs)
- Chinese character learning features with AI-generated descriptions via OpenAI API
