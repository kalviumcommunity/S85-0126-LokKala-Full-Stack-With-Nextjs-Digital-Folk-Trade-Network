# Project README: Environment Segregation & Secret Management

## Overview
This project demonstrates robust environment segregation and secure secret management practices to prevent deployment failures like the "ShopLite incident" where staging credentials accidentally overwrote production data.

## The Problem: "The Staging Secret That Broke Production"
At ShopLite, during a major sale weekend deployment, a developer accidentally used staging database credentials in production, causing:
- Live product data overwritten with test entries
- Service downtime during peak traffic
- Loss of customer trust
- Costly rollback procedures

## Our Solution

### 1. Environment Segregation
We maintain strict separation between environments using dedicated configuration files:

```
├── .env.development    # Local development
├── .env.staging        # Staging/QA environment
├── .env.production     # Production environment
├── .env.test           # Testing environment
└── config/
    ├── development.js
    ├── staging.js
    ├── production.js
    └── test.js
- Automatic environment detection via `NODE_ENV`
- Validation prevents cross-environment contamination
- Separate database instances per environment

### 2. Secure Secret Management

#### GitHub Secrets Integration
```yaml
# .github/workflows/deploy.yml
name: Deploy with Environment Safety
on:
  push:
    branches: [main, staging]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    environment: staging
    env:
  deploy-production:
    if: github.ref == 'refs/heads/main'
    environment: production  
    env:
      DB_HOST: ${{ secrets.PROD_DB_HOST }}
      DB_PASSWORD: ${{ secrets.PROD_DB_PASSWORD }}
      API_KEY: ${{ secrets.PROD_API_KEY }}
```

#### AWS Parameter Store (Alternative)
For production-grade applications:
```javascript
// Load environment-specific secrets
const loadSecrets = async (env) => {
  const params = {
    Path: `/myapp/${env}/`,
    WithDecryption: true
  };
  // Secrets retrieved at runtime, never stored in code
};
```

## How We Prevent ShopLite-Type Incidents

### Safety Mechanism 1: Environment Validation
```javascript
// scripts/validate-environment.js
const env = process.env.NODE_ENV;

// Block deployment if production uses staging markers
if (env === 'production') {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.includes('staging')) {
    console.error('❌ CRITICAL: Production DB URL contains "staging"');
    process.exit(1);
  }
}
```

### Safety Mechanism 2: Pre-commit Hooks
Using GitGuardian to prevent secret commits:
```bash
# .pre-commit-config.yaml
- repo: https://github.com/gitguardian/ggshield
  rev: v1.14.1
  hooks:
    - id: ggshield
      stages: [commit]
```

### Safety Mechanism 3: Docker Secret Protection
```dockerfile
# Multi-stage build to exclude secrets from final image
FROM node:18-alpine as builder
ARG BUILD_ENV
COPY .env.${BUILD_ENV} .env
# Build application

FROM node:18-alpine as runtime
# Only built application, no .env files
# Secrets injected at runtime via:
# docker run -e DB_PASSWORD=... or docker secrets
```
## Project Structure
```
project/
├── .github/
│   └── workflows/
│       ├── ci.yml          # CI pipeline
│       └── cd.yml          # CD pipeline with environment checks
├── src/
│   ├── config/
│   │   ├── index.js        # Environment config loader
│   │   └── validate.js     # Configuration validator
│   └── server.js
├── scripts/
│   ├── deploy-staging.sh
│   └── deploy-production.sh
├── docker-compose.yml      # Environment-specific compose files
├── docker-compose.prod.yml
└── docker-compose.staging.yml
```

## Deployment Workflow

### Staging Deployment
```bash
# Triggered by push to staging branch
NODE_ENV=staging \
DEPLOY_ENV=staging \
DATABASE_URL=$STAGING_DB_URL \
npm run deploy
```

### Production Deployment
```bash
# Triggered by push to main branch
NODE_ENV=production \
DEPLOY_ENV=production \
DATABASE_URL=$PROD_DB_URL \
npm run deploy
```

## Key Security Practices

1. **Never Commit Secrets**
   - All secrets stored in GitHub Secrets/AWS Parameter Store
   - `.env*` files in `.gitignore`
   - Automated secret scanning

2. **Environment Isolation**
   - Separate AWS accounts/VPCs per environment
   - Different database instances
   - Isolated network configurations

3. **Access Control**
   - Production secrets: Limited to CI/CD and ops team
   - Staging secrets: Available to developers
   - Development: Local/mock values only

4. **Audit Trail**
   - All secret access logged
   - Deployment history tracked
   - Rollback capability for each environment

## Setup Instructions

### Local Development
```bash
cp .env.example .env.development
# Edit with local values
npm install
npm run dev
```

### Staging Deployment
1. Set GitHub Secrets:
   - `STAGING_DB_HOST`
   - `STAGING_DB_PASSWORD`
   - `STAGING_API_KEY`

2. Push to staging branch
3. GitHub Actions deploys automatically

### Production Deployment
1. Set GitHub Secrets:
   - `PROD_DB_HOST`
   - `PROD_DB_PASSWORD`
   - `PROD_API_KEY`

2. Create PR from staging → main
3. After approval, merge triggers production deploy

## Testing the Safety Features

### Test 1: Prevent Staging Credentials in Production
```bash
# This will fail
NODE_ENV=production \
DATABASE_URL="postgres://staging-user@staging-db" \
npm start
```

<<<<<<< Updated upstream
### Test 2: Validate Environment Configuration
```bash
npm run validate-config
# Checks for:
# - Missing required variables
# - Environment mismatches
# - Insecure configurations
```

## Benefits Achieved

- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Input Validation:** Zod schemas for all inputs
- **File Upload:** Virus scanning with ClamAV

- **Database:** Connection pooling, read replicas
- **Monitoring:** Real-time performance metrics


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

>>>>>>> Stashed changes

## Video Demonstration
[Link to Video] - Shows:
1. Environment-specific deployments
2. Secret injection without exposure
3. Safety validation in action
4. Recovery procedures

<<<<<<< Updated upstream
## Conclusion
This implementation provides a bulletproof system that would have prevented the ShopLite incident through:
1. **Mandatory environment segregation**
2. **Secure secret management at the platform level**
3. **Automated validation gates**
4. **Clear separation of concerns**

By adopting these practices, teams can deploy with confidence, knowing that staging configurations will never accidentally reach production.
| Frontend Lead | [Sejal] | UI/UX, Components |
| Backend Lead | [Rajeev] | APIs, Database |
| DevOps Engineer | [Shivang] | Infrastructure, CI/CD |

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

---

**Made with ❤️ for artists everywhere**
![alt text](<Screenshot 2026-01-15 at 2.59.34 PM.png>)
>>>>>>> Stashed changes



Understanding Cloud Deployments: Docker → CI/CD → AWS/Azure
Docker

Docker is used to containerize the application along with its dependencies. This ensures the app runs consistently across different environments such as development and production.

CI/CD

A CI/CD pipeline using GitHub Actions automates the build process. Whenever code is pushed to the main branch, dependencies are installed and the project is built automatically, reducing manual errors.

Cloud Deployment (AWS/Azure)

The containerized application can be deployed to cloud platforms like AWS or Azure using managed services such as AWS Elastic Beanstalk or Azure App Service. These platforms handle infrastructure, scaling, and availability.

Environment Variables & Secrets

Sensitive values such as API keys and database URLs are managed using environment variables and secret managers instead of being committed to the repository. This supports secure configuration across development, staging, and production environments.

Reflection

Understanding how Docker, CI/CD, and cloud services work together was the most challenging part. Docker simplified environment consistency, and CI/CD improved reliability. In future deployments, I would explore full automation and infrastructure-as-code tools.
