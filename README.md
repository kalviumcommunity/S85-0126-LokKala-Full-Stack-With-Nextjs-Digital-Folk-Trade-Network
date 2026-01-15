# 🎨 **Digital-Folk-Trade-Network** - Direct Artist Marketplace

## 📌 Problem Statement
Tribal and rural art forms often lose value due to middlemen. ArtisanBridge directly connects traditional artists with global buyers, ensuring fair trade, authenticity verification, and cultural preservation.


## ✨ Features

### 🎭 **For Artists**
- **Digital Portfolio** - Showcase artwork with high-resolution images
- **Direct Messaging** - Communicate securely with buyers
- **Fair Pricing** - Set prices directly without commission
- **Authenticity Certificates** - Digital verification of art origin
- **Analytics Dashboard** - Track views, sales, and earnings

### 🛒 **For Buyers**
- **Global Marketplace** - Discover authentic tribal art worldwide
- **Transparent Pricing** - See exactly what the artist earns
- **Authenticity Guarantee** - Blockchain-verified certificates
- **Secure Payments** - Escrow system for safe transactions
- **Artist Stories** - Learn about cultural heritage and techniques

### 🛡️ **Trust & Verification**
- **Artist Verification** - Government ID + community validation
- **Art Provenance** - Track creation to delivery
- **Quality Assurance** - Expert review for high-value items
- **Secure Escrow** - Funds released after buyer confirmation
- **Dispute Resolution** - Mediation for rare issues

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Devices                          │
│   (Web, Mobile - Next.js PWA)                              │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────────────────┐
│                  CloudFront CDN                             │
│               (Global Edge Network)                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Next.js App                              │
│      (App Router, Server Components, API Routes)           │
└─────┬──────────────────────┬───────────────────────────────┘
      │                      │
      │ API Requests         │ Static Assets
      │                      │
┌─────▼──────┐      ┌────────▼──────────┐
│   Redis    │      │     S3/Azure      │
│  (Cache)   │      │      Blob         │
└────────────┘      └───────────────────┘
      │                      │
      │                      │
┌─────▼──────────────────────▼──────────┐
│        PostgreSQL (RDS)                │
│        (Primary Database)              │
└────────────────────────────────────────┘
      │
      │ Read Replicas
┌─────▼──────────┐
│   Analytics    │
│    (Redshift)  │
└────────────────┘
```

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Maps:** Mapbox GL
- **Payments:** Stripe Integration

### **Backend**
- **Runtime:** Node.js 18+
- **ORM:** Prisma
- **Database:** PostgreSQL (RDS/Azure)
- **Cache:** Redis (ElastiCache)
- **File Storage:** AWS S3 / Azure Blob Storage
- **Search:** Algolia / ElasticSearch
- **Email:** Resend / AWS SES

### **DevOps & Cloud**
- **Containerization:** Docker + Docker Compose
- **Orchestration:** AWS ECS / Azure Container Apps
- **CI/CD:** GitHub Actions
- **Infrastructure:** Terraform / Pulumi
- **Monitoring:** Sentry + Datadog
- **Logging:** CloudWatch / Azure Monitor

## 📁 Project Structure

```
artisanbridge/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (public)/        # Public pages
│   │   ├── (protected)/     # Protected routes
│   │   ├── api/             # API routes
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── artists/         # Artist-specific components
│   │   └── marketplace/     # Marketplace components
│   ├── lib/
│   │   ├── db/              # Database utilities
│   │   ├── auth/            # Authentication utilities
│   │   ├── validations/     # Zod schemas
│   │   └── utils/           # Helper functions
│   ├── middleware/          # Next.js middleware
│   └── types/               # TypeScript definitions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
├── public/                  # Static assets
├── tests/                   # Test files
├── docker/                  # Docker configuration
├── .github/workflows/       # CI/CD pipelines
├── terraform/               # Infrastructure as Code
└── docs/                    # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/artisanbridge.git
   cd artisanbridge
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

4. **Or set up manually**
   ```bash
   # Install dependencies
   npm install

   # Set up database
   npx prisma migrate dev
   npx prisma db seed

   # Start development server
   npm run dev
   ```

5. **Access the application**
   - Web: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs
   - Adminer (DB GUI): http://localhost:8080

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit      # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e       # E2E tests

# Test coverage
npm run test:coverage
```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `NEXTAUTH_SECRET` | NextAuth secret | Yes | - |
| `NEXTAUTH_URL` | NextAuth URL | Yes | http://localhost:3000 |
| `S3_BUCKET_NAME` | AWS S3 bucket name | No | - |
| `S3_REGION` | AWS region | No | us-east-1 |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure connection string | No | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes (for payments) | - |
| `EMAIL_SERVER` | Email server configuration | Yes | - |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | No | - |

## 📊 Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  role          Role     @default(BUYER)
  artistProfile ArtistProfile?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ArtistProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  bio           String?
  community     String
  location      String
  artForms      String[]
  isVerified    Boolean  @default(false)
  verificationDocuments String[]
  artworks      Artwork[]
  createdAt     DateTime @default(now())
}

model Artwork {
  id              String   @id @default(cuid())
  title           String
  description     String
  price           Decimal
  images          String[]
  artistProfileId String
  artistProfile   ArtistProfile @relation(fields: [artistProfileId], references: [id])
  category        Category
  materials       String[]
  dimensions      String?
  weight          Float?
  authenticityId  String   @unique
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Order {
  id        String   @id @default(cuid())
  artworkId String
  artwork   Artwork  @relation(fields: [artworkId], references: [id])
  buyerId   String
  buyer     User     @relation(fields: [buyerId], references: [id])
  status    OrderStatus @default(PENDING)
  amount    Decimal
  createdAt DateTime @default(now())
}
```

## 🔐 Security Features

- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Input Validation:** Zod schemas for all inputs
- **XSS Protection:** Automatic escaping in React
- **SQL Injection Prevention:** Prisma ORM
- **Rate Limiting:** Redis-based rate limiting
- **CORS:** Strict origin policy
- **Security Headers:** CSP, HSTS, X-Frame-Options
- **File Upload:** Virus scanning with ClamAV

## 📈 Performance

- **Page Load:** < 3s first load, < 1s subsequent
- **Images:** WebP format, lazy loading
- **Caching:** Redis for API responses, CDN for assets
- **Database:** Connection pooling, read replicas
- **Monitoring:** Real-time performance metrics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions

### Commit Message Convention
```
feat: add artist verification flow
fix: resolve image upload issue
docs: update API documentation
style: format component code
refactor: simplify authentication logic
test: add unit tests for checkout
```

## 📞 Support

- **Documentation:** [docs.artisanbridge.com](https://docs.artisanbridge.com)
- **Community:** [Discord Community](https://discord.gg/artisanbridge)
- **Email:** support@artisanbridge.com
- **Issues:** [GitHub Issues](https://github.com/your-org/artisanbridge/issues)

## 🏆 Team

| Role | Name | Responsibilities |
|------|------|------------------|
| Product Lead | [Name] | Requirements, Roadmap |
| Frontend Lead | [Name] | UI/UX, Components |
| Backend Lead | [Name] | APIs, Database |
| DevOps Engineer | [Name] | Infrastructure, CI/CD |

## 📄 License

This project is licensed under the **Artisan Commons License** - see [LICENSE](LICENSE) for details.

### Special Provisions for Artists
- Artists retain full copyright of their artwork
- Zero commission on sales
- Optional cultural preservation clause
- Transparency in all transactions

## 🙏 Acknowledgments

- Tribal art communities for their guidance
- Cultural heritage preservation organizations
- Open source community for amazing tools
- Early adopters and beta testers

---

<div align="center">
  <h3>🌟 Supporting Cultural Heritage Through Technology 🌟</h3>
  <p>Every purchase helps preserve traditional art forms for future generations</p>
</div>

## 📍 Roadmap

### Phase 1: MVP (Current)
- Basic marketplace functionality
- Artist profiles and listings
- Secure payments
- Mobile-responsive design

### Phase 2: Q2 2024
- Mobile apps (React Native)
- AR preview for artworks
- Multi-language support
- Advanced search with filters

### Phase 3: Q3 2024
- Blockchain provenance tracking
- Offline capabilities for low-connectivity areas
- Bulk ordering for galleries
- Artist workshops and tutorials

### Phase 4: Q4 2024
- AI-powered authenticity verification
- Virtual gallery exhibitions
- Integration with museums
- Export documentation for international shipping

---

**Made with ❤️ for artists everywhere**