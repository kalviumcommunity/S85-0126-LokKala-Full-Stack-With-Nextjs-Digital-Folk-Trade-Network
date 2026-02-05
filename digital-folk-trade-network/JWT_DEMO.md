# JWT Session Management Demo

This document demonstrates the JWT authentication system implementation and provides test scenarios to verify security features.

## 🎯 Overview

Our JWT authentication implements:

- ✅ Access tokens (15 min lifespan) for API authentication
- ✅ Refresh tokens (7 days lifespan) for renewing access
- ✅ HTTP-only, Secure cookies for storage
- ✅ Automatic token rotation on refresh
- ✅ Version-based token invalidation
- ✅ Security logging for audit trails
- ✅ Protection against XSS, CSRF, and replay attacks

## 🔐 Security Features Implemented

### 1. Token Generation (✅ Complete)

- **Location**: `src/lib/auth.ts`
- **Access Token**: HS256 signed, 15-minute expiry
- **Refresh Token**: HS256 signed, 7-day expiry, includes version number
- **Separate Secrets**: `JWT_SECRET` and `JWT_REFRESH_SECRET`

### 2. Secure Storage (✅ Complete)

- **Method**: HTTP-only cookies (not localStorage)
- **Flags**:
  - `httpOnly: true` - Prevents JavaScript access
  - `secure: true` - HTTPS only (production)
  - `sameSite: "lax"` - CSRF protection
- **Evidence**: Try `console.log(document.cookie)` in browser - tokens won't appear

### 3. Token Rotation (✅ Complete)

- **Mechanism**: `refreshTokenVersion` field in User model
- **On Login**: Version increments, old tokens invalidated
- **On Refresh**: Version increments, previous refresh token expires
- **On Logout**: Version increments, all tokens invalidated
- **Evidence**: Logs show version transitions (e.g., "Version 5 → 6")

### 4. Auto-Refresh Flow (✅ Complete)

- **Client**: `src/lib/apiClient.ts` detects 401 responses
- **Context**: `src/context/AuthContext.tsx` auto-refreshes on mount
- **Retry Logic**: One automatic retry after refresh to prevent loops
- **Evidence**: Network tab shows 401 → refresh → retry sequence

### 5. Security Logging (✅ Complete)

- **Login**: Logs user, ID, and new token version
- **Refresh**: Logs old version → new version transition
- **Logout**: Logs invalidation event
- **Evidence**: Console output during authentication operations

## 🧪 Test Scenarios

### Test 1: Token Structure Inspection

**Goal**: Verify JWT structure and payload

```bash
# Login and capture response
curl -v -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}' \
  2>&1 | grep "Set-Cookie"

# The Set-Cookie headers contain the tokens
# To decode (copy token from Set-Cookie header):
# Visit https://jwt.io and paste the token
# Or use: echo "<token>" | cut -d'.' -f2 | base64 -d
```

**Expected Payload**:

```json
{
  "sub": 1,
  "email": "rohan@example.com",
  "role": "USER",
  "ver": 6,
  "iat": 1738672800,
  "exp": 1738673700
}
```

**✅ Pass Criteria**: Token decodes to show user ID, email, role, version, and timestamps

---

### Test 2: HTTP-Only Cookie Storage

**Goal**: Prove tokens aren't accessible via JavaScript

**Steps**:

1. Login at `http://localhost:3000/login`
2. Open DevTools → Application → Cookies
3. Verify `accessToken` and `refreshToken` have `HttpOnly` ✓
4. Open Console and run: `document.cookie`

**Expected Result**: `document.cookie` returns empty or only non-httpOnly cookies

**✅ Pass Criteria**: Tokens not visible in JavaScript

---

### Test 3: Token Rotation on Refresh

**Goal**: Demonstrate old refresh tokens become invalid after rotation

```bash
# Step 1: Login (get version N)
curl -s -c cookies1.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}' | \
  jq '.data.refreshTokenVersion'
# Note the version (e.g., 10)

# Step 2: Refresh (rotate to version N+1)
curl -s -b cookies1.txt -c cookies2.txt -X POST http://localhost:3000/api/auth/refresh | \
  jq '{rotated: .data.rotatedFromVersion, new: .data.newRefreshTokenVersion}'
# Should show: {"rotated": 10, "new": 11}

# Step 3: Try to use old token (should FAIL)
curl -i -b cookies1.txt -X POST http://localhost:3000/api/auth/refresh
# Expected: 401 with "Refresh token expired or rotated"

# Step 4: New token still works (should SUCCEED)
curl -s -b cookies2.txt http://localhost:3000/api/auth/me | jq '.success'
# Expected: true
```

**Server Logs**:

```
[SECURITY] Login successful for rohan@example.com. Refresh token version rotated from 9 to 10
[SECURITY] Token rotation successful for rohan@example.com. Version 10 → 11. Old refresh tokens invalidated.
```

**✅ Pass Criteria**:

- Old cookies return 401
- New cookies work
- Logs show version increment

---

### Test 4: Automatic Access Token Refresh

**Goal**: Show client auto-refreshes expired access tokens

**Method 1: Wait for expiry (slow)**

```bash
# Login
curl -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}'

# Wait 16 minutes (access token expires at 15min)
sleep 960

# Make API call - should auto-refresh
curl -v -b cookies.txt -c cookies.txt http://localhost:3000/api/auth/me
# Look for new Set-Cookie headers (tokens refreshed)
```

**Method 2: Force expiry (fast)**
Temporarily change `ACCESS_TOKEN_EXPIRES_IN_SECONDS` to `30` in `src/lib/auth.ts`:

```typescript
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 30; // Was: 15 * 60
```

Then:

```bash
# Login
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}'

# Wait 31 seconds
sleep 31

# Make API call
curl -i -b cookies.txt -c cookies.txt http://localhost:3000/api/auth/me
# Should return 401, but client-side auto-refresh would handle this
```

**Client-Side Test** (Browser):

1. Change token expiry to 30 seconds
2. Login at `/login`
3. Open Network tab
4. Wait 31 seconds
5. Navigate to `/dashboard` or `/marketplace`
6. Observe network: 401 → /api/auth/refresh → retry original request

**✅ Pass Criteria**: Expired access token triggers refresh, user unaware

---

### Test 5: Logout Invalidation

**Goal**: Verify logout invalidates all tokens

```bash
# Step 1: Login
curl -s -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}' | \
  jq '.data.refreshTokenVersion'
# Note version (e.g., 15)

# Step 2: Verify token works
curl -s -b cookies.txt http://localhost:3000/api/auth/me | jq '.success'
# Expected: true

# Step 3: Logout
curl -s -b cookies.txt -X POST http://localhost:3000/api/auth/logout | jq

# Step 4: Try to use old token (should FAIL)
curl -i -b cookies.txt http://localhost:3000/api/auth/me
# Expected: 401 Unauthorized

# Step 5: Try to refresh (should FAIL)
curl -i -b cookies.txt -X POST http://localhost:3000/api/auth/refresh
# Expected: 401 "Refresh token expired or rotated"
```

**Server Log**:

```
[SECURITY] User rohan@example.com logged out. Refresh token version rotated to prevent replay attacks.
```

**✅ Pass Criteria**:

- Both access and refresh tokens fail after logout
- Version incremented
- Cookies cleared (maxAge=0)

---

### Test 6: Security Logging Audit Trail

**Goal**: Capture complete authentication lifecycle in logs

**Steps**:

1. Start dev server: `npm run dev`
2. Keep terminal visible
3. Run complete auth flow:

```bash
# Login
curl -s -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}' > /dev/null

# Refresh
curl -s -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/refresh > /dev/null

# Logout
curl -s -b cookies.txt -X POST http://localhost:3000/api/auth/logout > /dev/null
```

**Expected Console Output**:

```
[AUTH] Token pair generated for rohan@example.com (ID: 1, Version: 20)
[SECURITY] Login successful for rohan@example.com. Refresh token version rotated from 19 to 20

[SECURITY] Token rotation successful for rohan@example.com. Version 20 → 21. Old refresh tokens invalidated.
[AUTH] Token pair generated for rohan@example.com (ID: 1, Version: 21)

[SECURITY] User rohan@example.com logged out. Refresh token version rotated to prevent replay attacks.
```

**✅ Pass Criteria**: All security events logged with user, version, and action

---

### Test 7: CSRF Protection (SameSite Cookies)

**Goal**: Demonstrate cross-site requests are blocked

**Setup**: Create a malicious HTML file `csrf-attack.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>CSRF Attack Demo</title>
  </head>
  <body>
    <h1>Malicious Site</h1>
    <button onclick="attack()">Try to Steal Session</button>
    <div id="result"></div>

    <script>
      async function attack() {
        try {
          // This will FAIL due to SameSite=Lax
          const res = await fetch("http://localhost:3000/api/auth/me", {
            method: "GET",
            credentials: "include", // Try to send cookies
          });
          document.getElementById("result").innerHTML =
            "Attack succeeded! " + (await res.text());
        } catch (err) {
          document.getElementById("result").innerHTML =
            "Attack blocked: " + err.message;
        }
      }
    </script>
  </body>
</html>
```

**Steps**:

1. Login to `http://localhost:3000`
2. Open `csrf-attack.html` in browser (file:// URL or different domain)
3. Click button

**Expected Result**:

- Browser blocks request (CORS error)
- Even if CORS allowed, cookies won't be sent (SameSite=Lax)

**✅ Pass Criteria**: Cross-origin requests cannot use authentication cookies

---

### Test 8: Middleware Route Protection

**Goal**: Verify protected routes require valid tokens

```bash
# Without token (should FAIL)
curl -i http://localhost:3000/api/users/me
# Expected: 401 "Authentication required. No access token found."

# With valid token (should SUCCEED)
curl -s -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}' > /dev/null

curl -i -b cookies.txt http://localhost:3000/api/users/me
# Expected: 200 with user data

# With expired token (should FAIL)
# (Use Method 2 from Test 4 to force expiry)
curl -i -b cookies.txt http://localhost:3000/api/users/me
# Expected: 401 "Access token expired. Please refresh your session."
```

**✅ Pass Criteria**:

- No token → 401
- Valid token → 200
- Expired token → 401 with helpful message

---

### Test 9: Role-Based Access Control

**Goal**: Verify RBAC works with JWT roles

```bash
# Login as regular user
curl -s -c user-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}' > /dev/null

# Try to access admin route (should FAIL)
curl -i -b user-cookies.txt http://localhost:3000/api/admin/stats
# Expected: 403 "Access denied. Admin privileges required."

# Login as admin
curl -s -c admin-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"folkpass123"}' > /dev/null

# Access admin route (should SUCCEED)
curl -i -b admin-cookies.txt http://localhost:3000/api/admin/stats
# Expected: 200 with admin data
```

**✅ Pass Criteria**: Role from JWT payload enforced by middleware

---

## 📊 Evidence Checklist for Submission

Capture the following for your demo:

### Screenshots

- [ ] DevTools → Cookies showing `httpOnly` and `secure` flags
- [ ] DevTools → Console showing `document.cookie` doesn't expose tokens
- [ ] DevTools → Network tab showing 401 → refresh → retry flow
- [ ] Terminal logs showing security events

### Video / Documentation

- [ ] Complete auth flow: login → API call → refresh → logout
- [ ] Token rotation demo (Test 3)
- [ ] Auto-refresh demo (Test 4)
- [ ] Security logging demo (Test 6)

### Code References

- [ ] `src/lib/auth.ts` - Token generation and rotation
- [ ] `src/app/api/auth/refresh/route.ts` - Refresh logic
- [ ] `src/app/api/auth/logout/route.ts` - Invalidation
- [ ] `src/context/AuthContext.tsx` - Client-side integration
- [ ] `src/lib/apiClient.ts` - Auto-refresh interceptor
- [ ] `src/app/middleware.ts` - Route protection

---

## 🔒 Security Reflection

### Strengths

- **XSS Mitigation**: HTTP-only cookies prevent JavaScript token theft
- **CSRF Protection**: SameSite cookies block cross-origin requests
- **Replay Prevention**: Token rotation invalidates old tokens immediately
- **Revocation**: Version-based invalidation allows server-side logout
- **Audit Trail**: Security logging tracks all authentication events
- **Defense in Depth**: Dual tokens with separate secrets and lifespans

### Trade-offs

- **Cookie Size**: Cookies add ~500 bytes to every request vs. localStorage
- **Mobile Apps**: Requires cookie-capable HTTP client (no native apps without workarounds)
- **SameSite=Lax**: Allows some cross-site GET requests (trade-off for UX)
- **Stateful Invalidation**: Requires database check for version (not pure stateless JWT)

### Remaining Risks

- **Browser Hijacking**: If attacker controls browser, cookies are accessible
- **XSS Request Forgery**: Despite HTTP-only, XSS can make authenticated requests
- **Physical Access**: Unlocked computer = access until expiry
- **No Rate Limiting**: Unlimited login attempts (future enhancement)

### Future Enhancements

- **Rate Limiting**: Redis-based login attempt throttling
- **Device Fingerprinting**: Detect suspicious login locations
- **CSRF Tokens**: Additional header-based validation for state changes
- **IP Binding**: Optional strict device/network validation
- **WebAuthn**: Passwordless authentication as second factor

---

## 🚀 Quick Start

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env: Add JWT_SECRET and JWT_REFRESH_SECRET (32+ characters each)

# 2. Database setup
npx prisma db push
npx prisma db seed

# 3. Start server
npm run dev

# 4. Run tests
# Open new terminal and run test scripts from this document

# 5. Watch logs
# Keep dev server terminal visible to see security logs
```

---

## 📚 Documentation Reference

See `README.md` section "JWT & session hardening" for:

- Token architecture diagrams
- Security threat mitigation details
- Complete API endpoint documentation
- Implementation file references

---

**Demo Complete! 🎉**

This JWT implementation demonstrates enterprise-grade session management with:
✅ Secure token storage
✅ Automatic rotation
✅ Comprehensive security logging
✅ Protection against XSS, CSRF, and replay attacks
✅ Client-side auto-refresh
✅ Server-side token invalidation
