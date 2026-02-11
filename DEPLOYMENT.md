# Deployment Guide - Digital Folk Trade Network

## 🚀 Netlify Deployment

### Prerequisites

1. **Database Setup** (Required)
   - Set up a PostgreSQL database (recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
   - Get your `DATABASE_URL` connection string

2. **External Services** (Optional but recommended)
   - **SendGrid**: For email functionality
   - **AWS S3**: For file uploads
   - **Stripe**: For payment processing

### Step 1: Configure Netlify Build Settings

The `netlify.toml` file at the root already configures:

- ✅ Base directory: `digital-folk-trade-network`
- ✅ Build command: `npx prisma generate && npm run build`
- ✅ Publish directory: `.next`
- ✅ Next.js plugin enabled

### Step 2: Set Environment Variables in Netlify

In your Netlify dashboard (Site settings → Environment variables), add:

#### Required Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/dbname

# JWT Authentication
JWT_SECRET=your-32-character-jwt-secret-key-here
JWT_REFRESH_SECRET=your-32-character-refresh-secret-here

# Node Environment
NODE_ENV=production

# Next.js Base URL (replace with your Netlify domain)
NEXTAUTH_URL=https://your-site.netlify.app
NEXT_PUBLIC_API_BASE_URL=https://your-site.netlify.app
```

#### Optional Variables (add as needed)

```bash
# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@yourdomain.com

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Stripe
STRIPE_SECRET_KEY=sk_live_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key

# Feature Flags
NEXT_PUBLIC_APP_NAME=Digital Folk Trade Network
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production
```

### Step 3: Database Migration

After your first deployment, you need to run Prisma migrations:

#### Option A: Netlify CLI (recommended)

```bash
netlify link
netlify env:import .env.production
netlify build
```

#### Option B: Manual Migration

If your database provider supports running migrations:

1. Connect to your database
2. Run: `npx prisma migrate deploy`

Or set up a post-build hook in `netlify.toml`:

```toml
[build]
  command = "npx prisma generate && npx prisma migrate deploy && npm run build"
```

⚠️ **Note**: Automatic migrations in production should be used with caution. Consider using your database provider's migration tools instead.

### Step 4: Deploy

#### Via Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository in Netlify
3. Netlify will automatically deploy on every push to main

#### Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Step 5: Verify Deployment

After deployment, test these endpoints:

- ✅ Homepage: `https://your-site.netlify.app`
- ✅ Health check: `https://your-site.netlify.app/api/health`
- ✅ Database check: `https://your-site.netlify.app/api/prisma-check`

## 🔧 Troubleshooting

### Build Fails with "Cannot find package.json"

- ✅ Fixed: `netlify.toml` sets the correct base directory

### Prisma Client Generation Fails

- Add `npx prisma generate` to build command
- Ensure `DATABASE_URL` is set in environment variables

### API Routes Return 404

- Check that `@netlify/plugin-nextjs` is installed
- Verify Next.js version compatibility (currently using 16.1.2)

### Database Connection Fails

- Ensure `DATABASE_URL` is correctly set
- Check if your database allows connections from Netlify IPs
- For better security, use connection pooling (PgBouncer)

## 📊 Production Checklist

- [ ] Set all required environment variables
- [ ] Set up production database
- [ ] Run database migrations
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (automatic with Netlify)
- [ ] Enable Netlify Analytics (optional)
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test file upload functionality
- [ ] Configure email templates

## 🔐 Security Notes

1. **Never commit** `.env.local` or `.env.production` files
2. Use strong, unique secrets for JWT tokens
3. Enable HTTPS-only cookies in production
4. Review and update CSP headers in `next.config.ts`
5. Set up rate limiting for API routes
6. Enable Netlify's built-in DDoS protection

## 📈 Performance Optimization

- Enable Netlify's CDN and asset optimization
- Consider using Edge Functions for geo-specific content
- Monitor build times and optimize dependencies
- Use Incremental Static Regeneration (ISR) where applicable
- Enable image optimization in Next.js config

## 🆘 Support

If you encounter issues:

1. Check Netlify build logs
2. Review application logs in Netlify Functions
3. Test locally with production environment variables
4. Check [Netlify Next.js documentation](https://docs.netlify.com/integrations/frameworks/next-js/)

---

**Last Updated**: February 11, 2026
