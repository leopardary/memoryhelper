# MemoryHelper

A Next.js 15 application for spaced repetition learning, optimized for Chinese character mastery. Built with intelligent algorithms to help users retain knowledge efficiently through scientifically-proven spaced repetition techniques.

## Features

- **Spaced Repetition System (SRS)** - Intelligent algorithm adapts to your learning pace, similar to Anki/SuperMemo
- **Hierarchical Content Structure** - Organize learning materials with Subject → Unit → MemoryPiece hierarchy
- **Role-Based Access Control** - Four-tier permission system (visitor, student, teacher, administrator)
- **Multiple Authentication** - Google OAuth and email/password sign-in
- **Performance Analytics** - Track your learning progress with detailed performance dashboards
- **AI-Powered Descriptions** - Automated Chinese character descriptions via OpenAI API
- **Media Management** - AWS S3 integration for images and audio files
- **Full-Text Search** - Quickly find memory pieces across your content library

## Tech Stack

**Core:**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) - Database

**Authentication & Authorization:**
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- Custom RBAC system - Role-based permissions

**UI & Styling:**
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Lucide React](https://lucide.dev/) - Icons
- [Next Themes](https://github.com/pacocoursey/next-themes) - Dark mode support

**Media & APIs:**
- [AWS S3](https://aws.amazon.com/s3/) - Image and audio storage
- [OpenAI API](https://openai.com/) - AI descriptions and TTS audio generation
- [Recharts](https://recharts.org/) - Performance visualizations

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB instance (local or cloud)
- AWS S3 bucket (for media storage)
- Google OAuth credentials (for Google sign-in)
- OpenAI API key (optional, for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd memoryhelper
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with required environment variables:
```env
# Database
DATABASE_URL=mongodb://localhost:27017/memoryhelper

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
SECRET=your-app-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3
IMAGE_BASE_PATH=https://your-s3-bucket.s3.region.amazonaws.com

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key
```

4. Seed default roles into the database:
```bash
npm run seed:roles
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Initial Setup

Create an administrator account:
```bash
npm run make-admin your-email@example.com
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Node inspector |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed:roles` | Seed default roles (run once on setup) |
| `npm run make-admin <email>` | Assign administrator role to a user |

## Project Structure

```
/src/
├── /app/                    # Next.js App Router
│   ├── /api/               # API routes (24 endpoints)
│   ├── /components/        # React components (40+)
│   ├── /admin/             # Admin pages
│   ├── /auth/              # Authentication pages
│   ├── /practice/          # SRS practice session
│   ├── /review/            # Review subscribed content
│   ├── /subject/           # Subject detail pages
│   ├── /unit/              # Unit detail pages
│   ├── /memorypiece/       # Memory piece detail pages
│   └── /performance/       # Analytics dashboard
│
├── /lib/
│   ├── /db/
│   │   ├── /model/         # Mongoose schemas (8 models)
│   │   ├── /api/           # Data access functions
│   │   └── /seed/          # Database seeding
│   ├── /utils/             # Business logic utilities
│   └── /theme/             # Theme system
│
└── /providers/             # React context providers

/scripts/                   # Migration and setup scripts (18 files)
/docs/                      # Documentation
/public/                    # Static assets
```

## Key Concepts

### Content Hierarchy

1. **Subject** - Top-level learning topic (e.g., "Chinese Characters HSK 1")
2. **Unit** - Organizational container within a subject (can be nested)
3. **MemoryPiece** - Atomic learning content (flashcard equivalent)

### Spaced Repetition System (SRS)

The app uses an intelligent SRS algorithm that:
- Tracks each user's mastery of individual memory pieces
- Calculates optimal review intervals based on performance
- Adapts difficulty using history-weighted performance metrics (HPM)
- Supports multiple learning states: new → learning → learned → lapsed

### Role-Based Access Control (RBAC)

Four role levels with granular permissions:
- **Visitor** (default) - View content only
- **Student** - Practice and track progress
- **Teacher** - Manage content within assigned subjects
- **Administrator** - Full system access

See [RBAC_GUIDE.md](./RBAC_GUIDE.md) for complete documentation.

## API Routes

The app provides RESTful APIs for:
- **Admin** - Subject, unit, and memory piece management
- **Auth** - Sign up, sign in, OAuth
- **S3** - Image upload and deletion
- **Audio** - TTS audio generation and storage
- **Search** - Full-text memory piece search
- **User** - Profile management and role assignment

See [CLAUDE.md](./CLAUDE.md) for complete API documentation.

## Deployment

### Production Build

```bash
npm run build
npm start
```

### AWS EC2 Deployment

See [scripts.md](./scripts.md) for detailed AWS EC2 deployment instructions using:
- Node.js 20.x on Ubuntu
- Caddy for reverse proxy
- PM2 for process management

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Comprehensive developer guide
- [RBAC_GUIDE.md](./RBAC_GUIDE.md) - Role-based access control documentation
- [RBAC_IMPLEMENTATION_SUMMARY.md](./RBAC_IMPLEMENTATION_SUMMARY.md) - RBAC implementation details
- [docs/S3_BUCKET_ORGANIZATION.md](./docs/S3_BUCKET_ORGANIZATION.md) - S3 bucket structure
- [docs/BULK_IMPORT_EXAMPLE.md](./docs/BULK_IMPORT_EXAMPLE.md) - Bulk content import guide
- [scripts.md](./scripts.md) - Deployment and setup scripts

## TypeScript Path Aliases

- `@/*` → `./src/*`
- `@public/*` → `./public/*`

## License

See [LICENSE](./app/other/license/page.tsx) page for details.

## Contributing

This project follows Next.js 15 conventions and uses TypeScript for type safety. Please ensure all code passes ESLint and follows the existing code style.

## Support

For issues and questions, please open an issue in the repository.
