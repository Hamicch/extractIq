# 🚀 ExtractIQ

> **Flow from upload to insight**

AI-native document intelligence platform that transforms your documents into actionable insights.

---

## 📦 Monorepo Structure

This is a TypeScript monorepo powered by npm workspaces and Turborepo.

```
extractiq/
├── packages/
│   ├── core/                 # Domain logic & use cases (Clean Architecture)
│   ├── infrastructure/       # Database, AI, Queue implementations
│   ├── db/                   # Database schema & migrations (Drizzle ORM)
│   ├── web/                  # Next.js 14 App (Frontend + API + Background Worker)
│   ├── shared/               # Shared TypeScript types & Zod schemas
│   └── ui/                   # Shared React component library
├── monitoring/               # Prometheus, Grafana configs
├── docker-compose.yml        # Local development services
├── docker-compose.prod.yml   # Production deployment
└── turbo.json
```

## 📚 Documentation

For detailed architecture and implementation guides:

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete system architecture and package documentation
- **[CI_CD_OBSERVABILITY.md](CI_CD_OBSERVABILITY.md)** - CI/CD pipelines, deployment, and monitoring
- **[AI_EXTRACTION_IMPLEMENTATION.md](AI_EXTRACTION_IMPLEMENTATION.md)** - AI-powered document extraction features
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Latest implementation details

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, JWT authentication
- **Architecture**: Clean Architecture with Domain-Driven Design
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Job Queue**: BullMQ with Redis (integrated background worker)
- **AI**: OpenAI GPT-4o-mini, Anthropic Claude, or Ollama (configurable)
- **Observability**: OpenTelemetry, Jaeger, Prometheus, Grafana
- **Build System**: Turborepo
- **Type Safety**: TypeScript, Zod
- **Code Quality**: ESLint, Prettier, Husky

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose

### Quick Start (5 minutes)

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd extractiq
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your **required** configuration:

```bash
# Required: Add your OpenAI API key
OPENAI_API_KEY=sk-your-key-here

# Required: Generate secure secrets (use: openssl rand -base64 32)
JWT_SECRET=your-generated-secret-here
API_KEY_SECRET=your-generated-secret-here
```

4. **Start Docker services**

```bash
docker-compose up -d
```

This starts all infrastructure services:

- **PostgreSQL** (port 5433)
- **Redis** (port 6379)
- **Jaeger** - Tracing UI at http://localhost:16686
- **Prometheus** - Metrics at http://localhost:9090
- **Grafana** - Dashboards at http://localhost:3002 (admin/admin)

5. **Set up the database**

```bash
npm run db:push
```

Optional - seed with sample data:

```bash
npm run db:seed
```

6. **Start the development server**

```bash
npm run dev
```

Your application is now running:

- **Web App**: http://localhost:3000
- **API Routes**: http://localhost:3000/api/*
- **Background Worker**: Running automatically via instrumentation

## 📜 Available Scripts

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Start development server (Next.js + worker)    |
| `npm run build`      | Build all packages for production              |
| `npm run lint`       | Lint all packages                              |
| `npm run type-check` | Type check all packages                        |
| `npm run test`       | Run all tests                                  |
| `npm run format`     | Format code with Prettier                      |
| `npm run db:push`    | Push database schema changes                   |
| `npm run db:studio`  | Open Drizzle Studio (database GUI)             |
| `npm run db:seed`    | Seed database with sample data                 |

## 📦 Package Development

Each package has its own scripts. Navigate to a package to work on it individually:

```bash
# Web application
cd packages/web
npm run dev        # Start Next.js dev server
npm run build      # Build for production
npm run test       # Run tests

# Core business logic
cd packages/core
npm run build      # Build the package
npm run test       # Run unit tests

# Database
cd packages/db
npm run db:studio  # Open database GUI
npm run db:push    # Push schema changes
```

## 🗄️ Database Management

### Drizzle Studio (Recommended)

Open a visual database browser at http://localhost:4983:

```bash
npm run db:studio
```

### Schema Management

```bash
# Push schema changes to database
npm run db:push

# Generate migrations (for production)
npm run db:generate

# Seed database with sample data
npm run db:seed
```

### Direct PostgreSQL Access

```bash
# Connect via Docker
docker exec -it extractiq-postgres psql -U extractiq -d extractiq

# Or use connection string
psql postgresql://extractiq:extractiq_dev@localhost:5433/extractiq
```

## 🐳 Docker Services

### Start all services

```bash
docker-compose up -d
```

### Check status

```bash
docker ps
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Stop services

```bash
docker-compose down
```

### Reset everything (⚠️ deletes data)

```bash
docker-compose down -v
```

## 📊 Observability

All services are instrumented with OpenTelemetry. Access the monitoring tools:

### Jaeger - Distributed Tracing
- **URL**: http://localhost:16686
- **Purpose**: View request traces across services
- **Login**: None required

### Prometheus - Metrics Database
- **URL**: http://localhost:9090
- **Purpose**: Query metrics and health data
- **Login**: None required

### Grafana - Dashboards
- **URL**: http://localhost:3002
- **Login**: `admin` / `admin`
- **Purpose**: Visualize metrics and create dashboards

## 🎨 Design Tokens

The application uses a consistent design system:

- **Primary**: Blue (`#3b82f6`)
- **Secondary**: Purple (`#a855f7`)
- **Success**: Green (`#22c55e`)
- **Font**: Inter (optimized with next/font)
- **Dark Mode**: Fully supported

## 📝 API Documentation

The API is built with Next.js API Routes. Key endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents` - List documents
- `GET /api/documents/[id]` - Get document details
- `POST /api/documents/[id]/extract` - Extract data from document
- `GET /api/analytics` - Get analytics data

View the full API implementation in `packages/web/src/app/api/`

## 🔐 Environment Variables

See [.env.example](.env.example) for all required environment variables.

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://extractiq:extractiq_dev@localhost:5433/extractiq

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Provider (choose one)
OPENAI_API_KEY=sk-your-key-here          # For OpenAI
# ANTHROPIC_API_KEY=your-key-here        # For Anthropic
# OLLAMA_BASE_URL=http://localhost:11434 # For Ollama

# Authentication (generate with: openssl rand -base64 32)
JWT_SECRET=your-secure-secret-min-32-chars
API_KEY_SECRET=your-secure-secret-min-32-chars
```

### Optional Variables

```bash
# Storage (default: local filesystem)
STORAGE_TYPE=local
# AWS_ACCESS_KEY_ID=...     # For S3 storage
# AWS_SECRET_ACCESS_KEY=... # For S3 storage

# Observability
ENABLE_TELEMETRY=true
ENABLE_METRICS=true
ENABLE_TRACING=true
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run type-check`
4. Commit your changes (pre-commit hooks will run automatically)
5. Push and create a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

Built with:

- [Next.js](https://nextjs.org/) - React framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [BullMQ](https://bullmq.io/) - Background job queue
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Turborepo](https://turbo.build/) - Monorepo build system
- [OpenTelemetry](https://opentelemetry.io/) - Observability

---

**ExtractIQ** - Transform documents into insights, effortlessly.
