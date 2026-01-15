# Digital Folk Trade Network

## Environment Variables Setup

### Required Variables

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| DATABASE_URL | Server | Yes | PostgreSQL connection string |
| JWT_SECRET | Server | Yes | JWT signing secret (32+ chars) |
| NEXT_PUBLIC_API_BASE_URL | Client | Yes | API base URL |
| NEXT_PUBLIC_APP_NAME | Client | Yes | Application name |
| NODE_ENV | Server | Yes | development/production |

### Setup Instructions

1. Copy the template:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Edit \`.env.local\` with your values

3. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Security Notes

- **Never commit** \`.env.local\` to version control
- Use \`NEXT_PUBLIC_\` prefix for client-safe variables
- Server secrets are automatically protected in Next.js
- \`.gitignore\` prevents accidental commits of \`.env.local\`

### Common Pitfalls Avoided

1. **Secret Exposure**: Used proper prefixing (NEXT_PUBLIC_)
2. **Missing Documentation**: Comprehensive \`.env.example\`
3. **Accidental Commits**: \`.gitignore\` protection
4. **Type Safety**: TypeScript with strict mode

---
*Assignment 2.10: Environment Variable Management*
