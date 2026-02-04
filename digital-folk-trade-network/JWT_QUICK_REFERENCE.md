# JWT Authentication Quick Reference

## 🚀 Quick Start

```bash
# 1. Ensure environment variables are set
# .env file must contain:
JWT_SECRET=your-32-char-secret-here-minimum
JWT_REFRESH_SECRET=different-32-char-secret-here

# 2. Start development server
npm run dev

# 3. Test authentication
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}'
```

---

## 📡 API Endpoints

### POST /api/auth/login

Login with email and password.

**Request**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "role": "USER"
    },
    "accessExpiresInSeconds": 900,
    "refreshExpiresInSeconds": 604800,
    "refreshTokenVersion": 6
  }
}
```

**Cookies Set**: `accessToken`, `refreshToken` (HTTP-only, Secure)

---

### POST /api/auth/refresh

Refresh expired access token using refresh token.

**Request**: No body (uses cookies)

**Response**:

```json
{
  "success": true,
  "message": "Refresh token rotated",
  "data": {
    "user": { ... },
    "rotatedFromVersion": 6,
    "newRefreshTokenVersion": 7,
    "accessExpiresInSeconds": 900,
    "refreshExpiresInSeconds": 604800
  }
}
```

**Cookies Updated**: New `accessToken` and `refreshToken`

---

### POST /api/auth/logout

Logout and invalidate all tokens.

**Request**: No body (uses cookies)

**Response**:

```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Cookies Cleared**: Both tokens removed

---

### GET /api/auth/me

Get current authenticated user.

**Request**: No body (uses cookies)

**Response**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  }
}
```

**Requires**: Valid access token

---

## 🎨 Client-Side Usage

### React Context Hook

```tsx
import { useAuthContext } from "@/context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout, refreshSession } =
    useAuthContext();

  // Login
  const handleLogin = async () => {
    try {
      await login("user@example.com", "password123");
      // Redirect or update UI
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    // Redirect to login
  };

  // Manual refresh (usually automatic)
  const handleRefresh = async () => {
    const success = await refreshSession();
    if (!success) {
      // Redirect to login
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

---

### API Client with Auto-Refresh

```tsx
import { api } from "@/lib/apiClient";

// GET request
const response = await api.get("/api/users/me");
const data = await response.json();

// POST request
const response = await api.post("/api/tasks", {
  title: "New task",
  status: "pending",
});

// PUT request
const response = await api.put("/api/tasks/1", {
  status: "completed",
});

// DELETE request
const response = await api.delete("/api/tasks/1");

// All methods automatically:
// 1. Include credentials (cookies)
// 2. Refresh on 401 responses
// 3. Retry original request after refresh
```

---

## 🔐 Security Features

### Token Storage

- ✅ **HTTP-only cookies**: Not accessible via JavaScript
- ✅ **Secure flag**: HTTPS only in production
- ✅ **SameSite=Lax**: CSRF protection

### Token Rotation

- ✅ **On login**: Version increments, old tokens invalid
- ✅ **On refresh**: Version increments, old refresh token invalid
- ✅ **On logout**: Version increments, all tokens invalid

### Automatic Refresh

- ✅ **API Client**: Detects 401, refreshes, retries
- ✅ **Auth Context**: Restores session on mount
- ✅ **One retry**: Prevents infinite loops

---

## 🛡️ Security Checklist

### ✅ XSS Protection

- HTTP-only cookies (not localStorage)
- Input sanitization
- No `dangerouslySetInnerHTML` with user data

### ✅ CSRF Protection

- SameSite=Lax cookies
- No cross-origin POST/PUT/DELETE

### ✅ Replay Protection

- Short access token (15 min)
- Token rotation on refresh
- Version checking

### ✅ Session Management

- Server-side token invalidation
- Logout invalidates all tokens
- Security logging for audit

---

## 📊 Security Logging

All authentication events are logged to console:

```
[AUTH] Token pair generated for user@example.com (ID: 1, Version: 6)
[SECURITY] Login successful for user@example.com. Refresh token version rotated from 5 to 6
[SECURITY] Token rotation successful for user@example.com. Version 6 → 7. Old refresh tokens invalidated.
[SECURITY] User user@example.com logged out. Refresh token version rotated to prevent replay attacks.
```

Watch terminal running `npm run dev` to see security events.

---

## 🧪 Testing Commands

```bash
# Login and save cookies
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}'

# Get current user
curl -b cookies.txt http://localhost:3000/api/auth/me

# Refresh tokens
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/refresh

# Logout
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout

# Test token rotation (should fail after refresh)
curl -c cookies1.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@example.com","password":"folkpass123"}'
curl -b cookies1.txt -c cookies2.txt -X POST http://localhost:3000/api/auth/refresh
curl -i -b cookies1.txt -X POST http://localhost:3000/api/auth/refresh
# ❌ Should return 401 - token rotated
```

---

## 📁 File Reference

| Component        | File Path                           |
| ---------------- | ----------------------------------- |
| Token generation | `src/lib/auth.ts`                   |
| Login endpoint   | `src/app/api/auth/login/route.ts`   |
| Refresh endpoint | `src/app/api/auth/refresh/route.ts` |
| Logout endpoint  | `src/app/api/auth/logout/route.ts`  |
| Auth context     | `src/context/AuthContext.tsx`       |
| API client       | `src/lib/apiClient.ts`              |
| Middleware       | `src/app/middleware.ts`             |
| Documentation    | `README.md` (JWT section)           |
| Test guide       | `JWT_DEMO.md`                       |

---

## ⚠️ Common Issues

### Issue: "JWT_SECRET is not set"

**Solution**: Add `JWT_SECRET` and `JWT_REFRESH_SECRET` to `.env` file (32+ characters each)

### Issue: Cookies not being sent

**Solution**:

- Ensure `credentials: 'include'` in fetch requests
- Check browser allows cookies for localhost
- Verify domain matches (http://localhost:3000)

### Issue: 401 after refresh

**Solution**:

- Check refresh token hasn't expired (7 days)
- Verify `refreshTokenVersion` in database matches token
- User may have logged out elsewhere (version bumped)

### Issue: CORS errors

**Solution**:

- Frontend and backend must be on same domain for cookies
- Use proxy in development if needed
- Check SameSite cookie policy

### Issue: Tokens in DevTools but API returns 401

**Solution**:

- Check token expiration time
- Verify middleware is checking cookies, not just Authorization header
- Ensure `JWT_SECRET` matches between generation and verification

---

## 🎯 Key Takeaways

1. **Tokens are in cookies**: Never access via JavaScript
2. **Auto-refresh is automatic**: Use `api` client or `useAuthContext`
3. **Version = security**: Increments invalidate old tokens
4. **Short access tokens**: 15 min = less risk if stolen
5. **Watch the logs**: Security events show what's happening

---

## 📚 Further Reading

- **Main Documentation**: `README.md` - "JWT & session hardening"
- **Test Scenarios**: `JWT_DEMO.md` - 9 detailed test cases
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY_JWT.md`

---

**Quick Reference Version 1.0**
**Last Updated**: Implementation Complete
