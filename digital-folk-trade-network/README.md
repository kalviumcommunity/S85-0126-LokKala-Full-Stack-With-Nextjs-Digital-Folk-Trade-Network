# Digital Folk Trade Network

Prisma is configured as the type-safe data layer for this Next.js app backed by PostgreSQL.

## Layout and UI architecture

Component hierarchy

```
LayoutWrapper
├─ Header
├─ Sidebar
└─ Page content (per route)
```

- Layout shell lives in [src/components/layout/LayoutWrapper.tsx](src/components/layout/LayoutWrapper.tsx) with an accessible skip link and a dedicated `main` landmark.
- Global navigation is handled by [src/components/layout/Header.tsx](src/components/layout/Header.tsx) (primary links + call to action) and [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx) (section navigation).
- Reusable UI atoms start with [src/components/ui/Button.tsx](src/components/ui/Button.tsx) and [src/components/ui/Card.tsx](src/components/ui/Card.tsx), exported via [src/components/index.ts](src/components/index.ts).

Props contracts (excerpt)

```ts
// Button
type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Card
type CardTone = "default" | "muted" | "highlight";
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tone?: CardTone;
  children: React.ReactNode;
}
```

How to preview components

- Run `npm install` then `npm run storybook` to open the Storybook canvas on http://localhost:6006.
- Stories live at [src/components/ui/Button.stories.tsx](src/components/ui/Button.stories.tsx) and [src/components/ui/Card.stories.tsx](src/components/ui/Card.stories.tsx). The Storybook config is in [.storybook/main.ts](.storybook/main.ts).
- Use Storybook controls to toggle `variant`, `size`, and `isLoading` on Button and switch `tone` on Card.

Accessibility and visual consistency

- Semantic landmarks: header, nav, aside, and `main` are declared in layout components; `aria-current` highlights active nav links.
- Skip link in LayoutWrapper jumps directly to `#main-content` for keyboard users.
- Focus rings use high-contrast outlines (`:focus-visible` in [src/app/globals.css](src/app/globals.css)). Buttons expose `aria-busy` while loading.
- Theming uses CSS variables and gradients defined in [src/app/globals.css](src/app/globals.css) to keep Header, Sidebar, and UI atoms aligned.

## Responsive & themed design (Tailwind)

- Tailwind config: see [tailwind.config.ts](tailwind.config.ts) (dark mode via `class`). PostCSS pipeline is in [postcss.config.mjs](postcss.config.mjs); Tailwind layers are injected in [src/app/globals.css](src/app/globals.css).
- Breakpoints (mobile-first): xs 480px, sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1440px.
- Palette: brand (#fb923c/#f97316/#ea580c), surface (light #f8fafc, dark #0b1224), text (base #0f172a, muted #334155, on-dark #e5e7eb), accent gradient (orange→red→violet).
- Theme toggle: `darkMode: "class"`; [src/context/UIContext.tsx](src/context/UIContext.tsx) syncs `html.dark` with localStorage + system preference, [src/components/ui/ThemeToggle.tsx](src/components/ui/ThemeToggle.tsx) renders the control inside [src/components/layout/Header.tsx](src/components/layout/Header.tsx).
- Responsive demo: [src/components/layout/ResponsiveShowcase.tsx](src/components/layout/ResponsiveShowcase.tsx) plus the home page grid in [src/app/page.tsx](src/app/page.tsx) show hero + cards adapting across breakpoints with `dark:` variants.
- Run `npm install` (adds Tailwind) then `npm run dev`; verify theme switching and responsiveness in browser devtools device toolbar. Storybook remains available via `npm run storybook`.

## Input sanitization & OWASP hygiene

- Library: [sanitize-html](https://www.npmjs.com/package/sanitize-html) via helper [src/lib/sanitize.ts](src/lib/sanitize.ts) providing `sanitizeInput`, deep `sanitizeObject`, and `detectSqlInjection` regex guards (simple checks for `or 1=1`, inline comments, `drop table`, etc.).
- API usage: [src/app/api/users/route.ts](src/app/api/users/route.ts) and [src/app/api/tasks/route.ts](src/app/api/tasks/route.ts) sanitize request bodies and block obvious SQLi patterns before DB work. User validation also trims/scripts-strips via [src/lib/schemas/userSchema.ts](src/lib/schemas/userSchema.ts). Prisma already parameterizes queries to avoid injection.
- UI encoding: the home page shows a before/after sanitization demo in [src/app/page.tsx](src/app/page.tsx) to illustrate `<script>alert("Hacked!")</script>` and `' OR 1=1 --` being neutralized. Avoid `dangerouslySetInnerHTML`; render sanitized strings directly.
- Evidence to capture: console/logs showing SQLi blocks, screenshots of the sanitization demo, and curl attempts with malicious payloads returning 400 with the offending input echoed in error detail.
- Future hardening: add CSP headers, HTTP security headers (HSTS, X-Content-Type-Options), stricter HTML allowlists per field, and periodic OWASP ASVS reviews.

Accessibility & contrast notes

- Dark mode uses `html.dark` for consistent `dark:` styles; toggling preserves preference in localStorage and respects system defaults.
- Color choices keep text/background contrast above WCAG AA for primary surfaces; focus states remain visible in both themes.
- Buttons, cards, and navigation retain semantic tags and `aria-current`/`aria-pressed` markers for assistive tech.

Reflection prompts

- Reusable layouts lock in navigation structure, so feature teams drop pages into a consistent shell without rethinking chrome or a11y each time.
- Clear props contracts make components discoverable and safer to compose; variants encode the allowed visual states.
- Trade-off: stricter design tokens reduce ad-hoc styling freedom, but the payoff is predictable UI and faster onboarding.

Submission links (fill in your own)

- GitHub PR URL: _add reviewer-accessible link_
- Video explanation URL: _add public video link_

## Redis caching

- Connection: [src/lib/redis.ts](src/lib/redis.ts) creates a singleton using `REDIS_URL` (defaults to `redis://localhost:6379`).
- Cache-aside reads:
  - Users collection at [src/app/api/users/route.ts](src/app/api/users/route.ts) uses cache key `users:list` with a 60s TTL.
  - Single user at [src/app/api/users/[id]/route.ts](src/app/api/users/%5Bid%5D/route.ts) uses `user:<id>` with the same TTL.
- Writes and invalidation: POST `/api/users` clears `users:list` so the next read refreshes from the database.
- Read/write snippets (truncated for clarity):

```ts
const cached = await redis.get(cacheKey);
if (cached) return sendSuccess(JSON.parse(cached), "Users fetched from cache");

const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true, role: true, createdAt: true },
});
await redis.set(cacheKey, JSON.stringify(users), "EX", 60);

await redis.del("users:list"); // on POST
```

### Latency check

- Cold request (miss): `Measure-Command { curl http://localhost:3000/api/users }` logs a `[Cache] users:list miss` line and will be slower because it hits Postgres.
- Warm request (hit): run the same command again; expect a `[Cache] users:list hit` log and materially lower latency (example: 120ms miss vs 10-20ms hit on local dev). Capture console output or Postman timings for the assignment evidence.

### Coherence and stale data

- Strategy: cache-aside with short TTL (60s) plus explicit invalidation on writes keeps data fresh while still accelerating hot reads. Single-user lookups also expire quickly to avoid stale profiles.
- Risk handling: Redis failures fall back to direct DB reads so correctness wins over speed. TTL bounds staleness; invalidation on POST ensures new users appear immediately in listings.
- Reflection: A stale cache is worse than no cache when it misleads users; the short TTL plus targeted invalidation keeps responses trustworthy while still delivering fast hits.

## JWT & session hardening

Our JWT authentication system implements industry best practices for secure session management, including automatic token rotation, HTTP-only cookie storage, and comprehensive security logging.

### Token Architecture

#### Token Structure

JWTs follow the standard three-part structure:

**1. Header** (Algorithm & Token Type)

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**2. Payload** (Claims)

```json
{
  "sub": 123, // Subject: User ID
  "email": "user@example.com",
  "role": "USER", // or "ADMIN", "ARTIST", "GUEST"
  "ver": 5, // Refresh token version (for rotation)
  "iat": 1738672800, // Issued at (Unix timestamp)
  "exp": 1738673700 // Expiration (Unix timestamp)
}
```

**3. Signature** (HMAC SHA256)

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET or JWT_REFRESH_SECRET
)
```

#### Dual Token System

We use **two separate tokens** with different lifespans and secrets:

| Feature         | Access Token        | Refresh Token                             |
| --------------- | ------------------- | ----------------------------------------- |
| **Lifespan**    | 15 minutes          | 7 days                                    |
| **Secret**      | `JWT_SECRET`        | `JWT_REFRESH_SECRET`                      |
| **Cookie Name** | `accessToken`       | `refreshToken`                            |
| **Purpose**     | API authentication  | Renewing access tokens                    |
| **SameSite**    | `Lax`               | `Lax` (allows same-site form submissions) |
| **HttpOnly**    | ✅ Yes              | ✅ Yes                                    |
| **Secure**      | ✅ Yes (production) | ✅ Yes (production)                       |

**Why two secrets?**

- Separation of concerns: compromising one doesn't compromise the other
- Different rotation policies: access tokens expire frequently, refresh tokens less so
- Enhanced security: attacker needs both tokens AND the correct version number

### Secure Token Storage

#### Storage Location

**✅ HTTP-only Cookies** (Our Choice)

```typescript
response.cookies.set("accessToken", token, {
  httpOnly: true, // Not accessible via JavaScript
  secure: isProd, // HTTPS only in production
  sameSite: "lax", // CSRF protection
  path: "/",
  maxAge: 900, // 15 minutes
});
```

**❌ LocalStorage / SessionStorage** (Never Used)

- Vulnerable to XSS attacks
- Accessible by any JavaScript on the page
- No automatic expiration
- Can't restrict to HTTPS

**❌ In-Memory** (Not Suitable for Web)

- Lost on page refresh
- Doesn't persist across tabs
- Poor UX for SPAs

#### Cookie Security Flags

**HttpOnly**: Prevents JavaScript access

```javascript
// This will NOT work (returns undefined):
document.cookie; // Cannot read httpOnly cookies
```

**Secure**: HTTPS-only transmission

```typescript
// Development: secure = false (allows HTTP)
// Production: secure = true (requires HTTPS)
secure: process.env.NODE_ENV === "production";
```

**SameSite**: CSRF mitigation

```typescript
// "lax" allows cookies on top-level navigation (links, form submissions)
// "strict" would block even legitimate same-site form POSTs
sameSite: "lax";
```

### Token Lifecycle & Refresh Flow

#### 1. Login Flow

```
User                    Server                  Database
  |                       |                         |
  |--POST /api/auth/login-|                         |
  |  {email, password}    |                         |
  |                       |--Query user----------->|
  |                       |<-User data + version---|
  |                       |                         |
  |                       |--Increment version----->|
  |                       |<-New version (5→6)------|
  |                       |                         |
  |                       | Generate tokens (v6)    |
  |                       | - Access: 15min exp     |
  |                       | - Refresh: 7d exp       |
  |                       |                         |
  |<-Set-Cookie (both)----|                         |
  |  200 OK + user data   |                         |
```

**Security Log:**

```
[AUTH] Token pair generated for user@example.com (ID: 123, Version: 6)
[SECURITY] Login successful for user@example.com.
           Refresh token version rotated from 5 to 6
```

#### 2. API Request with Valid Access Token

```
Client                  Middleware              API Handler
  |                       |                         |
  |--GET /api/users/me--->|                         |
  | (accessToken cookie)  |                         |
  |                       | Verify JWT              |
  |                       | Check expiration        |
  |                       | Extract user data       |
  |                       |--Request (user data)--->|
  |                       |                         |
  |<-User data------------|<-Response---------------|
```

#### 3. Automatic Token Refresh (Access Token Expired)

```
Client                  API Client              Server
  |                       |                         |
  |--GET /api/users------>|                         |
  |                       |--Request--------------->|
  |                       |<-401 Unauthorized-------|
  |                       |                         |
  |                       | Detect 401              |
  |                       |--POST /api/auth/refresh-|
  |                       |  (refreshToken cookie)  |
  |                       |                         |
  |                       |    Verify refresh token |
  |                       |    Check version match  |
  |                       |    Increment version    |
  |                       |    Generate new pair    |
  |                       |                         |
  |                       |<-New tokens (v7)--------|
  |                       |                         |
  |                       |--Retry GET /api/users-->|
  |<-User data------------|<-200 OK----------------|
```

**Security Log:**

```
[SECURITY] Token rotation successful for user@example.com.
           Version 6 → 7. Old refresh tokens invalidated.
[AUTH] Token pair generated for user@example.com (ID: 123, Version: 7)
```

#### 4. Logout & Token Invalidation

```
Client                  Server                  Database
  |                       |                         |
  |--POST /api/auth/logout|                         |
  |                       |--Increment version----->|
  |                       |<-Version (7→8)----------|
  |                       |                         |
  |                       | Clear cookies           |
  |                       |                         |
  |<-Clear cookies--------|                         |
  |  (maxAge = 0)         |                         |
```

**Security Log:**

```
[SECURITY] User user@example.com logged out.
           Refresh token version rotated to prevent replay attacks.
```

**Result**: All existing tokens (v7) are now invalid, even if stolen.

### Token Rotation Mechanism

#### Why Rotate Tokens?

**Without Rotation:**

- Stolen refresh token valid for 7 days
- No way to invalidate specific token
- Replay attacks possible

**With Rotation:**

- Each refresh invalidates previous tokens
- Stolen token becomes useless after legitimate refresh
- Database version check prevents replay

#### Version-Based Invalidation

**Schema:**

```prisma
model User {
  id                  Int    @id @default(autoincrement())
  email               String @unique
  refreshTokenVersion Int    @default(0)  // Increments on login/refresh/logout
  // ...
}
```

**Token Payload:**

```json
{
  "sub": 123,
  "ver": 7 // Must match database version
  // ...
}
```

**Verification Logic:**

```typescript
const payload = verifyRefreshToken(token);
const user = await prisma.user.findUnique({
  where: { id: payload.sub },
});

if (user.refreshTokenVersion !== payload.ver) {
  // Token is outdated (user logged in elsewhere or logged out)
  return error("Refresh token expired or rotated", 401);
}

// Valid token - issue new pair and increment version
await prisma.user.update({
  where: { id: user.id },
  data: { refreshTokenVersion: { increment: 1 } },
});
```

### Security Threat Mitigation

#### 🛡️ XSS (Cross-Site Scripting) Protection

**Threat:** Attacker injects malicious JavaScript to steal tokens

**Mitigation:**

- ✅ **HTTP-only cookies**: Tokens not accessible via `document.cookie`
- ✅ **No localStorage/sessionStorage**: Eliminates primary XSS target
- ✅ **Input sanitization**: All user input sanitized before rendering ([src/lib/sanitize.ts](src/lib/sanitize.ts))
- ✅ **CSP headers**: Content Security Policy prevents inline scripts (future enhancement)

**Test:**

```javascript
// Try in browser console - returns undefined
console.log(document.cookie); // Cannot see httpOnly cookies
```

**Remaining Risk:** If attacker achieves XSS, they can still make authenticated requests on behalf of the user (browser auto-sends cookies). Mitigate with:

- Short access token lifetime (15 min)
- Refresh token rotation
- Suspicious activity monitoring

#### 🛡️ CSRF (Cross-Site Request Forgery) Protection

**Threat:** Malicious site tricks browser into making authenticated request

**Mitigation:**

- ✅ **SameSite=Lax cookies**: Blocks cross-site POST/PUT/DELETE requests
- ✅ **SameSite=Lax for refresh**: Allows legitimate same-site form submissions while blocking cross-origin
- ⚠️ **CSRF tokens** (Optional Enhancement): Add custom `X-CSRF-Token` header for state-changing operations

**Why Lax instead of Strict?**

- `Strict`: Blocks cookies on ALL cross-site navigations (even clicking a link from email)
- `Lax`: Allows cookies on top-level GET navigation (links) but blocks cross-site POST/PUT/DELETE
- Trade-off: Better UX while maintaining security for state-changing operations

**Future Enhancement - CSRF Tokens:**

```typescript
// Generate on page load
const csrfToken = crypto.randomUUID();
setCookie("csrf-token", csrfToken);

// Validate on state-changing requests
if (req.headers.get("x-csrf-token") !== getCookie("csrf-token")) {
  return error("CSRF token mismatch", 403);
}
```

#### 🛡️ Token Replay Attack Protection

**Threat:** Attacker intercepts and reuses stolen tokens

**Mitigation:**

- ✅ **Short access token lifetime**: 15-minute window limits damage
- ✅ **Refresh token rotation**: Each refresh invalidates previous token
- ✅ **Version checking**: Database version must match token version
- ✅ **Logout invalidation**: Immediately bumps version, killing all tokens
- ✅ **HTTPS only** (production): Prevents man-in-the-middle interception

**Attack Scenario & Defense:**

```
Day 1, 10:00 AM: User logs in (version 5 → 6)
Day 1, 10:05 AM: Attacker steals refresh token (version 6)
Day 1, 10:10 AM: User's app auto-refreshes (version 6 → 7)
Day 1, 10:15 AM: Attacker tries to use stolen token (version 6)
                 ❌ REJECTED - version mismatch (expected 7, got 6)
```

#### 🛡️ Session Fixation Prevention

**Threat:** Attacker forces user to use attacker's session ID

**Mitigation:**

- ✅ **New tokens on login**: Fresh pair generated, old ones discarded
- ✅ **Version increment**: Prevents pre-login token reuse
- ✅ **Server-side session control**: Tokens signed server-side, not client-provided

#### 🛡️ Brute Force Protection (Future Enhancement)

**Current Gap:** No rate limiting on login attempts

**Recommended Additions:**

```typescript
// Using Redis
const attempts = await redis.incr(`login:attempts:${email}`);
await redis.expire(`login:attempts:${email}`, 300); // 5 min TTL

if (attempts > 5) {
  return error("Too many login attempts. Try again in 5 minutes.", 429);
}
```

### Security Trade-offs & Reflection

#### ✅ Strengths

| Feature             | Benefit                        | Impact                            |
| ------------------- | ------------------------------ | --------------------------------- |
| HTTP-only cookies   | Immune to XSS token theft      | High security                     |
| 15-min access token | Limits damage from theft       | Moderate UX impact (auto-refresh) |
| Token rotation      | Prevents replay attacks        | High security                     |
| Version tracking    | Server-side revocation         | Easy invalidation                 |
| Dual secrets        | Separation of concerns         | Defense in depth                  |
| Security logging    | Audit trail for investigations | Compliance & debugging            |

#### ⚠️ Trade-offs

| Trade-off                    | Why We Chose This             | Alternative                                                               |
| ---------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| **Cookies vs. localStorage** | Security over flexibility     | localStorage enables CDN sites but vulnerable to XSS                      |
| **15-min access token**      | Balance between security & UX | 5 min = more secure but annoying refreshes; 1 hour = convenient but risky |
| **SameSite=Lax vs. Strict**  | Usability (email links work)  | Strict blocks legitimate cross-site navigation                            |
| **No IP binding**            | Support mobile users          | IP binding prevents token use on network switch                           |
| **Version in DB**            | Revocation support            | Stateless JWT can't be revoked server-side                                |

#### 🔴 Remaining Vulnerabilities

**1. Browser Hijacking**

- **Threat**: If attacker controls user's browser (malware), cookies are accessible
- **Mitigation**: Short expiry, device fingerprinting (future), security awareness training

**2. Session Theft via XSS**

- **Threat**: Despite HTTP-only, XSS can make requests on user's behalf
- **Mitigation**: CSP headers, input sanitization, code reviews, regular security audits

**3. Physical Access**

- **Threat**: Unlocked computer = full access until token expiry
- **Mitigation**: Short access token lifetime, automatic logout on close (future)

**4. No Rate Limiting**

- **Threat**: Unlimited login/refresh attempts
- **Mitigation**: Implement Redis-based rate limiting (see Brute Force section)

### Implementation Files

| Component        | File                                                                   | Purpose                                      |
| ---------------- | ---------------------------------------------------------------------- | -------------------------------------------- |
| Token generation | [src/lib/auth.ts](src/lib/auth.ts)                                     | `generateTokenPair()`, signing, verification |
| Login endpoint   | [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts)     | Password check, token issuance               |
| Refresh endpoint | [src/app/api/auth/refresh/route.ts](src/app/api/auth/refresh/route.ts) | Token rotation logic                         |
| Logout endpoint  | [src/app/api/auth/logout/route.ts](src/app/api/auth/logout/route.ts)   | Version bump, cookie clearing                |
| Middleware       | [src/app/middleware.ts](src/app/middleware.ts)                         | Route protection, token verification         |
| Auth context     | [src/context/AuthContext.tsx](src/context/AuthContext.tsx)             | Client-side auth state, auto-refresh         |
| API client       | [src/lib/apiClient.ts](src/lib/apiClient.ts)                           | Auto-refresh on 401 responses                |

### Testing & Demonstration

#### Setup

- Secrets required: set `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` in `.env` (32+ chars for both secrets). The Zod guard in [src/lib/env.ts](src/lib/env.ts) fails fast if any are missing.
- Seed login for demos: any seeded user (e.g., `rohan@example.com`) uses password `folkpass123`. Update seeds in [prisma/seed.mjs](prisma/seed.mjs) if you change it.

#### Quick Test Script (cURL)

```bash
# 1. Login - Get tokens in cookies
curl -i -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}'
# Look for: Set-Cookie headers for accessToken and refreshToken
# Note the refreshTokenVersion in response

# 2. Verify access token works
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/auth/me
# Returns user data

# 3. Refresh tokens (see rotation)
curl -i -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/refresh
# Look for: rotatedFromVersion → newRefreshTokenVersion (e.g., 6 → 7)

# 4. Make authenticated request
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/orders?page=1

# 5. Logout (invalidates all tokens)
curl -i -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/logout

# 6. Try to use old token (should fail)
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/auth/me
# Returns 401 Unauthorized
```

#### Observing Security Logs

Watch the terminal running `npm run dev` for security events:

```
[AUTH] Token pair generated for rohan@example.com (ID: 1, Version: 6)
[SECURITY] Login successful for rohan@example.com. Refresh token version rotated from 5 to 6
[SECURITY] Token rotation successful for rohan@example.com. Version 6 → 7. Old refresh tokens invalidated.
[SECURITY] User rohan@example.com logged out. Refresh token version rotated to prevent replay attacks.
```

#### Testing Token Rotation

**Scenario**: Prove old refresh tokens become invalid after rotation

```bash
# 1. Login and save first token
curl -c cookies1.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}'
# Note version (e.g., 10)

# 2. Refresh to rotate token
curl -b cookies1.txt -c cookies2.txt -X POST http://localhost:3000/api/auth/refresh
# Version is now 11

# 3. Try to use old cookies (should fail)
curl -i -b cookies1.txt -X POST http://localhost:3000/api/auth/refresh
# ❌ Returns: "Refresh token expired or rotated" (version mismatch)

# 4. New cookies still work
curl -i -b cookies2.txt http://localhost:3000/api/auth/me
# ✅ Success
```

#### Browser DevTools Testing

1. **Login** at `/login`
2. **Open DevTools** → Application → Cookies → `http://localhost:3000`
3. **Observe cookies**:
   - `accessToken` (HttpOnly ✓, Secure ✓ in prod)
   - `refreshToken` (HttpOnly ✓, Secure ✓ in prod)
4. **Try to access via console**:
   ```javascript
   console.log(document.cookie); // Won't show httpOnly cookies
   ```
5. **Watch Network tab** during API calls to see cookies auto-sent
6. **Wait 15 minutes** (or modify expiry to 30 seconds for testing) and see auto-refresh happen

### Evidence for Demonstration

Capture the following for your assignment submission:

✅ **Token Structure**: Console log showing JWT header.payload.signature
✅ **Cookie Storage**: DevTools screenshot showing httpOnly cookies
✅ **Rotation Logs**: Terminal output showing version increments
✅ **Security Audit**: Console logs showing XSS prevention (undefined cookie access)
✅ **CSRF Protection**: Network tab showing SameSite cookie policy
✅ **Auto-Refresh**: Network waterfall showing 401 → refresh → retry pattern

## Role-based access control (RBAC)

- Policy source: [src/lib/rbac.ts](src/lib/rbac.ts) exports the permission matrix and `checkAccess` logger used by APIs and the dashboard UI.
- Roles and permissions:

| Role   | Permissions                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------------- |
| ADMIN  | `*` (all actions)                                                                                     |
| ARTIST | `orders:read:own`, `orders:write:own`, `tasks:read`, `tasks:write`, `projects:read`, `users:read:own` |
| USER   | `orders:read:own`, `orders:write:own`, `tasks:read`, `projects:read`, `users:read:own`                |
| GUEST  | none                                                                                                  |

- Enforcement points:
  - Users API: [src/app/api/users/route.ts](src/app/api/users/route.ts) (list/create) and [src/app/api/users/[id]/route.ts](src/app/api/users/%5Bid%5D/route.ts) (self or admin) require valid access tokens and permissions.
  - Orders API: [src/app/api/orders/route.ts](src/app/api/orders/route.ts) uses `orders:write` for creation (own vs admin) and `orders:read` for listing (admin only).
  - Tasks and Projects APIs: [src/app/api/tasks/route.ts](src/app/api/tasks/route.ts) and [src/app/api/projects/route.ts](src/app/api/projects/route.ts) gate read/write according to the matrix.
  - UI guard: [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx) reads the access token cookie, evaluates permissions, and shows ALLOWED/DENIED badges plus the role’s permission list.

- Audit logging: every `checkAccess` call writes a line like `[RBAC] role=USER permission=orders:read resource=orders decision=DENIED reason=...` so you can screenshot/stream console output for allow/deny evidence.

- Quick allow/deny demo
  1.  Login to get cookies (see JWT section for sample curl). Then:

  ```
  # Allowed for admin only
  curl -i -b cookies.txt http://localhost:3000/api/orders

  # Allowed for any signed-in role
  curl -i -b cookies.txt http://localhost:3000/api/tasks

  # Create task (denied for USER, allowed for ADMIN/ARTIST)
  curl -i -b cookies.txt -X POST http://localhost:3000/api/tasks \
  	-H "Content-Type: application/json" \
  	-d '{"title":"RBAC demo"}'
  ```

  Check the server logs for the `[RBAC]` lines showing the allow/deny decisions.

- Scalability and future-proofing: the matrix is centralized for easy edits, permissions are strings so you can introduce more granular actions without code churn, and the audit log trail supports reviews. For policy-based access later, plug in an external PDP or attribute checks while keeping `checkAccess` as the enforcement hook.

## Setup

- Install tooling: `npm install --save-dev prisma` and `npm install @prisma/client` (already in `package.json`).
- Configure your database URL in `.env` (example): `DATABASE_URL="postgresql://username:password@localhost:5432/mydb"`.
- Sync schema to your dev database: `npx prisma db push` (or `npx prisma migrate dev --name init` when you want migrations).
- Generate the Prisma client after any schema change: `npx prisma generate`.

## Migrations workflow

- Create or update schema changes with `npx prisma migrate dev --name <change_name>`; generated SQL lives in [prisma/migrations](prisma/migrations).
- Reset locally with `npx prisma migrate reset` to drop, recreate, and optionally reseed while preserving migration history.
- Prefer small, descriptive migration names (for example `add_review_rating_check`) so reviewers can understand the intent from the SQL diff.
- Capture terminal output when you run migrations so the team and grading demo have evidence of successful application.

## Seed data

- Seed script lives at [prisma/seed.mjs](prisma/seed.mjs) and is wired to Prisma's `seed` hook in `package.json`.
- Run seeding after migrations: `npx prisma db seed`.
- The script truncates the seeded tables (reviews, order items, orders, artifacts, categories, users) before inserting deterministic fixtures for users, categories, artifacts, orders, and reviews. Re-runs stay idempotent in development.
- Verify results in Prisma Studio: `npx prisma studio` and inspect the tables for the expected sample rows.

## Rollback and safety notes

- Development resets: `npx prisma migrate reset` to clear and reapply every migration plus seed data.
- Production hygiene before applying a migration:
  - Take a database backup or ensure PITR snapshots are active.
  - Apply to staging first, validate `npx prisma migrate deploy`, then promote to production.
  - Prefer backward-compatible steps (add columns with defaults, avoid destructive drops) and ship application code that can handle both old and new shapes during rollout.
  - For risky changes, run during a maintenance window and watch database metrics/logs.

## What to show in your demo

- A `npx prisma migrate dev --name <change_name>` run with the generated folder visible in [prisma/migrations](prisma/migrations).
- A `npx prisma db seed` run showing the "Seed data inserted successfully." log.
- A quick Prisma Studio view of the inserted rows and a note that rerunning the seed does not duplicate data because the script resets the seeded tables first.

## Schema overview

- Models live in [prisma/schema.prisma](prisma/schema.prisma) and cover users, categories, artifacts, orders, order items, and reviews with enums for roles and order statuses.
- Relations: artifacts belong to users and categories; orders belong to users and contain order items; reviews connect users and artifacts with a uniqueness constraint.

## Runtime client reuse

- The Prisma singleton is defined in [src/lib/prisma.ts](src/lib/prisma.ts) to avoid excess connections during Next.js hot reloads.

## Health check

- GET `/api/prisma-check` to verify connectivity and see row counts. Implementation is in [src/app/api/prisma-check/route.ts](src/app/api/prisma-check/route.ts).
- Run `npm run dev` and hit the endpoint; success returns totals plus a timestamp. Logs show Prisma queries.

## Notes for the demo

- Show the schema file, the singleton, a `npx prisma generate` run, and the `/api/prisma-check` response in the terminal.
- Reflection prompt: Prisma’s generated queries bring type safety, reduced boilerplate, and safer relations; raw SQL can still be preferable for complex hand-tuned queries or DB-specific features.

## Transaction & query optimisation

- Transaction workflow: POST `/api/orders` creates an order, inserts order items, and decrements inventory inside a single `$transaction`. Pass `simulateFailure: true` in the payload to force a rollback and verify that no partial writes occur.
- Query shape: GET `/api/orders?page=1&pageSize=10` returns a paginated, select-only projection (order meta, user summary, and lightweight item data) to avoid over-fetching.
- Indexes added in [prisma/schema.prisma](prisma/schema.prisma): `User.createdAt`, `Artifact.categoryId`, `Artifact.sellerId+createdAt`, `Order.status`, `Order.createdAt`, `Order.userId+status`, `Review.artifactId` (the unique constraint on `userId+artifactId` covers `userId`). Generate and apply with `npx prisma migrate dev --name add_indexes_for_optimisation`.
- Benchmarking: run `DEBUG="prisma:query" npm run dev`, call the same GET `/api/orders` before and after the index migration, and compare timings/plan output (use `EXPLAIN` if you have DB access). Capture logs/screenshots for evidence.
- Anti-patterns avoided: N+1 (batch fetch via relations in a single query), full-table scans on frequent filters (indexes), and over-fetching (explicit `select` plus pagination). In production, monitor Postgres query duration, lock wait time, and error rate; add alerting on slow queries and use Prisma query logging in lower environments.

## REST API structure

- Hierarchy lives under `src/app/api` using Next.js file-based routing with plural resource folders.
- Collections: `GET` (paginated, filterable) and `POST` for creation at `/api/users`, `/api/tasks`, `/api/projects`.
- Single resources: `GET`, `PUT`, `DELETE` at `/api/users/:id`, `/api/tasks/:id`, `/api/projects/:id`.
- Pagination query params: `page` (default 1), `limit` (default 10). Filters: `search` across name/title/owner and optional `status` for tasks/projects.

### Sample requests

- List users (page 2, 5 per page): `curl "http://localhost:3000/api/users?page=2&limit=5"`
- Filter tasks by status: `curl "http://localhost:3000/api/tasks?status=in-progress"`
- Create user: `curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Charlie","email":"charlie@example.com","age":25}'`
- Get single project: `curl http://localhost:3000/api/projects/1`
- Update task: `curl -X PUT http://localhost:3000/api/tasks/2 -H "Content-Type: application/json" -d '{"status":"done"}'`
- Delete user: `curl -X DELETE http://localhost:3000/api/users/3`

### Response conventions

- Success shape: `{ success: true, message, data, timestamp, pagination? }`.
- Error shape: `{ success: false, message, error: { code, details }, timestamp }`.
- Common codes: `E400` bad request/validation, `E002` not found, `E500` internal. Invalid pagination returns `400`; missing fields return `400`; not found returns `404`.

### Why the naming matters

- Consistent plural nouns and mirrored verbs keep the client mental model simple and speed up frontend integration.
- Predictable pagination and query params allow reusable frontend data hooks and SDK functions.
- File-based structure under `app/api` makes ownership clear per entity and keeps maintenance scoped as the project grows.

## Loading Skeletons & Error Boundaries

Next.js provides built-in support for loading states and error handling through special files that enhance user experience during data fetching and when errors occur.

### Loading States (`loading.tsx`)

Loading skeletons provide immediate visual feedback while data is being fetched, improving perceived performance and reducing user anxiety during wait times.

#### Implementation

Loading files have been added to data-fetching routes:

- [src/app/dashboard/loading.tsx](src/app/dashboard/loading.tsx) - Dashboard statistics skeleton
- [src/app/marketplace/loading.tsx](src/app/marketplace/loading.tsx) - Artworks list skeleton
- [src/app/art/[id]/loading.tsx](src/app/art/%5Bid%5D/loading.tsx) - Artwork detail skeleton

Each loading component uses:

- **Tailwind's `animate-pulse`** utility for smooth pulsing animations
- **Neutral gray tones** (`bg-gray-300`, `bg-gray-200` in light mode; `bg-gray-700`, `bg-gray-600` in dark mode)
- **Layout matching** the actual page structure so the transition feels seamless
- **Responsive grid layouts** that adapt to screen sizes just like the real content

#### Testing Loading States

To visualize loading skeletons:

1. **Built-in delays**: Data-fetching pages include simulated 1.5-2 second delays:
   ```ts
   await new Promise((resolve) => setTimeout(resolve, 2000));
   ```
2. **Network throttling**: Use Chrome DevTools → Network tab → Throttling dropdown → "Slow 3G" or "Fast 3G"
3. **Navigate between routes**: Visit `/dashboard`, `/marketplace`, or `/art/1` to see loading skeletons in action

#### Why Loading Skeletons Matter

- **User trust**: Immediate feedback shows the app is working, not frozen
- **Perceived performance**: Visual activity makes waits feel shorter than blank screens
- **Reduced bounce rate**: Users are less likely to abandon when they see progress
- **Professional polish**: Matches patterns from modern apps (LinkedIn, Facebook, YouTube)

### Error Boundaries (`error.tsx`)

Error boundaries catch runtime errors during rendering and provide graceful fallback UI with recovery options.

#### Implementation

Error files have been added alongside data-fetching routes:

- [src/app/dashboard/error.tsx](src/app/dashboard/error.tsx) - Dashboard error handler
- [src/app/marketplace/error.tsx](src/app/marketplace/error.tsx) - Marketplace error handler
- [src/app/art/[id]/error.tsx](src/app/art/%5Bid%5D/error.tsx) - Artwork detail error handler

Each error component provides:

- **Visual error indicator**: Icon in a colored circle for immediate recognition
- **Friendly error message**: User-facing explanation without technical jargon
- **Technical details** (conditionally): Error message displayed for debugging
- **Retry functionality**: `reset()` function re-renders the route without page reload
- **Alternative navigation**: Links to home or related pages as escape routes
- **Client-side only**: Must use `"use client"` directive since error boundaries are interactive

#### Testing Error States

To trigger and test error boundaries:

1. **Simulated errors**: Uncomment the error throws in page files:
   ```ts
   // In marketplace/page.tsx, art/[id]/page.tsx
   throw new Error("Failed to fetch artworks from the database");
   ```
2. **Network failures**: Disconnect network or use DevTools offline mode
3. **Invalid routes**: Visit `/art/999` for non-existent IDs
4. **Retry functionality**: Click "Try Again" button to test the `reset()` function

#### Why Error Boundaries Matter

- **Resilience**: Prevents entire app crashes when one component fails
- **User clarity**: Shows what went wrong without cryptic stack traces
- **Recovery path**: Retry button lets users fix transient issues themselves
- **Trust and transparency**: Honest error messages with helpful actions build confidence
- **Debugging aid**: Logs errors to console while showing friendly UI to users

### Evidence of Implementation

#### Loading States

When navigating to routes with data fetching, you'll see:

1. **Skeleton screens** with pulsing gray blocks matching the layout
2. **Smooth transitions** from skeleton to actual content after ~2 seconds
3. **Responsive behavior** where skeletons adapt to screen size changes

#### Error States

When errors occur (either simulated or real), you'll see: 4. **Error UI** with icon, message, and retry button 5. **Reset functionality** where clicking "Try Again" re-attempts the render 6. **Console logging** of the error for developer awareness

### Testing Checklist

- [ ] Visit `/dashboard` and observe loading skeleton before stats appear
- [ ] Visit `/marketplace` and see artworks list skeleton
- [ ] Visit `/art/1` and watch artwork detail skeleton
- [ ] Enable network throttling (Slow 3G) to extend loading visibility
- [ ] Uncomment error throws and verify error boundaries catch them
- [ ] Click "Try Again" buttons to test reset functionality
- [ ] Check browser console for error logs
- [ ] Verify dark mode styling on both loading and error states

### Reflection

**Loading skeletons** and **error boundaries** are essential patterns for production-ready applications:

- They transform technical challenges (network latency, failures) into positive UX
- They provide transparency without overwhelming users with technical details
- They enable self-service recovery, reducing support burden
- They demonstrate thoughtful engineering that respects user time and attention
- They're expected standards in modern web apps—their absence feels unpolished

By implementing both patterns, the Digital Folk Trade Network delivers a professional, resilient experience that handles the unpredictable nature of network requests gracefully while keeping users informed and in control.
