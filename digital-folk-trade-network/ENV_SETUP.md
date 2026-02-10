# Environment Variables

## Required Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Database

- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database?schema=public`
  - Example: `postgresql://postgres:postgres@localhost:5432/digital_folk_trade?schema=public`

### JWT Authentication

- `JWT_SECRET` - Secret key for access tokens (use a long random string)
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens (use a different long random string)

**Generate secure secrets:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

### Optional Services

#### AWS S3 (File Uploads)

- `AWS_REGION` - AWS region (e.g., `us-east-1`)
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_S3_BUCKET` - S3 bucket name

#### SendGrid (Email Service)

- `SENDGRID_API_KEY` - Your SendGrid API key
- `SENDGRID_FROM_EMAIL` - Sender email address

#### Redis (Caching)

- `REDIS_URL` - Redis connection URL (default: `redis://localhost:6379`)

## Development Setup

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Set up PostgreSQL database:

```bash
# Create database
createdb digital_folk_trade

# Run migrations
npx prisma migrate dev
```

3. Seed database (optional):

```bash
npx prisma db seed
```

4. Start development server:

```bash
npm run dev
```

## Memory Issues

If you encounter out-of-memory errors, increase Node's memory limit:

```bash
# Windows
set NODE_OPTIONS=--max-old-space-size=4096 && npm run dev

# Linux/Mac
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

Or add to your `package.json` scripts:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
  }
}
```

## Production

⚠️ **Important:** Change all secret keys before deploying to production!

Use environment variables from your hosting provider (Vercel, Railway, etc.) and never commit `.env` to version control.

## Troubleshooting

### "Invalid environment variables" error

- Ensure all required variables are set in `.env`
- Restart the dev server after changing `.env`
- Check for typos in variable names

### Database connection errors

- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Redis connection errors (if using)

- Redis is optional - comment out REDIS_URL if not using
- Verify Redis is running on specified port
