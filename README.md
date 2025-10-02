# 🚀 Docuflow

> **Flow from upload to insight**

AI-native document intelligence platform that transforms your documents into actionable insights.

---

## 📦 Monorepo Structure

This is a TypeScript monorepo powered by npm workspaces and Turborepo.

```
docuflow/
├── packages/
│   ├── api/          # Express REST API with OpenAPI
│   ├── worker/       # BullMQ background job processor
│   ├── web/          # Next.js 14 App Router frontend
│   ├── shared/       # Shared TypeScript types & Zod schemas
│   ├── db/           # Drizzle ORM database layer
│   └── ui/           # Shared React component library
├── docker-compose.yml
└── turbo.json
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, OpenAPI, JWT authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Job Queue**: BullMQ with Redis
- **Observability**: OpenTelemetry + Jaeger
- **Build System**: Turborepo
- **Type Safety**: TypeScript, Zod
- **Code Quality**: ESLint, Prettier, Husky

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd docuflow
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration (database credentials, API keys, etc.)

4. **Start infrastructure services**

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Jaeger (UI on port 16686)

5. **Set up the database**

```bash
cd packages/db
npm run db:push
```

6. **Start development servers**

```bash
npm run dev
```

This starts all services concurrently:
- Web app: http://localhost:3000
- API: http://localhost:3001
- Worker: Background process

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in development mode |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run type-check` | Type check all packages |
| `npm run test` | Run all tests |
| `npm run format` | Format code with Prettier |

## 📦 Package Scripts

Each package has its own scripts. Navigate to a package and run:

```bash
cd packages/api
npm run dev        # Start API in watch mode
npm run build      # Build the package
npm run type-check # TypeScript type checking
npm run lint       # ESLint
```

## 🗄️ Database Management

```bash
cd packages/db

# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## 🐳 Docker Services

Start services:
```bash
docker-compose up -d
```

Stop services:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

## 📊 Observability

Access Jaeger UI for distributed tracing:
- http://localhost:16686

All services are instrumented with OpenTelemetry.

## 🎨 Design Tokens

The application uses a consistent design system:

- **Primary**: Blue (`#3b82f6`)
- **Secondary**: Purple (`#a855f7`)
- **Success**: Green (`#22c55e`)
- **Font**: Inter (optimized with next/font)
- **Dark Mode**: Fully supported

## 📝 API Documentation

The API follows OpenAPI 3.0 specification. View the full API documentation:

```bash
cd packages/api
cat openapi.yaml
```

## 🔐 Environment Variables

See [.env.example](.env.example) for all required environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `OPENAI_API_KEY`: OpenAI API key for document intelligence
- `AWS_*`: AWS credentials for S3 document storage

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
- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [BullMQ](https://bullmq.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Turborepo](https://turbo.build/)

---

**Docuflow** - Transform documents into insights, effortlessly.
