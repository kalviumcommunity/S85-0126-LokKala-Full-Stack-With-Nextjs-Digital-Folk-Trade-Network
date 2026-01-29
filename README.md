## Team Branching & PR Workflow

### Branching Strategy & Naming Conventions
- `feature/<feature-name>` – New features (e.g., feature/login-auth)
- `fix/<bug-name>` – Bug fixes (e.g., fix/navbar-alignment)
- `docs/<update-name>` – Documentation updates (e.g., docs/update-readme)
- `refactor/<task-name>` – Code refactoring (e.g., refactor/api-calls)
- `test/<test-name>` – Test additions (e.g., test/user-auth)

All team members must follow these conventions for clarity and traceability.

---

### Pull Request Template
See [digital-folk-trade-network/.github/pull_request_template.md](digital-folk-trade-network/.github/pull_request_template.md) for our PR template.

**Template Preview:**
```
## Summary
Briefly explain the purpose of this PR.

## Changes Made
- List key updates or fixes.

## Screenshots / Evidence
(Add screenshots, console output, or links if relevant)

## Checklist
- [ ] Code builds successfully
- [ ] Lint & tests pass
- [ ] Reviewed by at least one teammate
- [ ] Linked to corresponding issue
```

---

### Code Review Checklist
All reviewers should verify:
- [ ] Code follows naming conventions and project structure
- [ ] Functionality is verified locally
- [ ] No console errors or warnings
- [ ] ESLint and Prettier checks pass
- [ ] Comments and documentation are meaningful and up to date
- [ ] Sensitive data (e.g., secrets, credentials) is not exposed

---

### Branch Protection Rules
Our main branch is protected with these rules:
- Require pull request reviews before merging
- Require status checks (lint/tests) to pass before merging
- Disallow direct pushes to main
- Require PRs to be up to date before merging

---

### Workflow Reflection
This workflow ensures that all code changes are reviewed, tested, and documented before merging.  
Branch naming conventions make it easy to track the purpose of each branch.  
The PR template and review checklist help maintain code quality and consistency.  
Branch protection rules prevent accidental changes to main and enforce team collaboration.  
Overall, this process improves code quality, team communication, and project reliability.

---


---

### Deliverables Checklist
- [x] Branch naming conventions documented in README
- [x] PR template in .github/pull_request_template.md
- [x] Code review checklist in README
- [x] Branch protection rules set up on GitHub
- [x] Screenshot(s) of a PR with review/checks

---

Docker & Compose Setup for Local Development
Dockerfile

The Dockerfile defines how the Next.js application is containerized. It installs dependencies, builds the application, and runs it inside a Node.js container.

Docker Compose

Docker Compose is used to run the full application stack locally, including:

App: Next.js application

Database: PostgreSQL for persistent data storage

Cache: Redis for caching and fast data access

All services run inside a shared Docker network to allow seamless communication.

Networks & Volumes

A custom bridge network is used so services can communicate using service names. A Docker volume is configured for PostgreSQL to persist data across container restarts.


Reflection

Setting up Docker Compose helped eliminate environment inconsistencies. Initial challenges included port conflicts and build time, which were resolved by adjusting ports and caching dependencies. This setup ensures the app runs consistently across all team members’ machines.


RESTful API Design & Routing
API Route Hierarchy
/api/users
/api/users/[id]
/api/projects
/api/tasks

HTTP Methods

GET /api/users → Fetch users (paginated)

POST /api/users → Create user

GET /api/users/:id → Fetch single user

PUT /api/users/:id → Update user

DELETE /api/users/:id → Delete user

Sample Request
curl -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{"name":"Charlie"}'

Error Handling

400 → Invalid input

404 → Resource not found

201 → Resource created 

## Input Validation with Zod

- All POST/PUT requests are validated using Zod schemas in `src/lib/schemas/`.
- Example schema: `userSchema` (see [src/lib/schemas/userSchema.ts](src/lib/schemas/userSchema.ts))
- Example error response:
  ```json
  {
    "success": false,
    "message": "Validation Error",
    "errors": [
      { "field": "name", "message": "Name must be at least 2 characters long" },
      { "field": "email", "message": "Invalid email address" }
    ]
  }
  ```
- Schemas are reused on both client and server for consistency.

Reflection

Using consistent, RESTful naming made the API predictable and easier to understand. File-based routing in Next.js simplifies endpoint creation and improves maintainability as the project grows.



## Authentication APIs (Signup / Login)

### Signup
- Checks existing user in database
- Hashes password using bcrypt
- Stores user securely

### Login
- Verifies password
- Issues JWT with 1-hour expiry

### Protected Routes
- Requires valid JWT
- Rejects invalid or expired tokens

### Security Notes
- Passwords are never stored in plain text
- JWT is signed using a secret key
- Tokens expire automatically 

## Centralized Error Handling & Structured Logging

- All error-prone API routes use a reusable error handler (`src/lib/errorHandler.ts`) for consistent error responses.
- Errors are logged in structured JSON format via a simple logger (`src/lib/logger.ts`), making debugging and monitoring easier.
- In development, error responses include stack traces; in production, only a safe message is shown to users.
- Sensitive details are never exposed in production, improving user trust and security.
- This system is easily extendable to third-party logging tools or cloud services.

**Sample Error Response (Production):**
```json
{
  "success": false,
  "message": "Something went wrong. Please try again later."
}
```

**Sample Log Output:**
```json
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": { "message": "Database connection failed!", "stack": "REDACTED" },
  "timestamp": "2026-01-24T12:45:00Z"
}
```

### Reflection
Implementing authentication with bcrypt and JWT reinforced the importance of security-first backend design. Using Prisma ensured clean database access while keeping the API scalable.



## File Upload API using Pre-Signed URLs (AWS S3)

### Upload Flow
1. Client requests a pre-signed URL from backend
2. Backend generates a short-lived URL using AWS SDK
3. Client uploads file directly to S3
4. File metadata is stored in the database

### Security Measures
- AWS credentials never exposed
- Short URL expiry (60 seconds)
- File type validation
- Private bucket access 

---

## App Router: Public & Protected Pages, Dynamic Routing, and Middleware

### Route Map

| Route                | Type       | Description                        |
|----------------------|------------|------------------------------------|
| `/`                  | Public     | Home page                          |
| `/login`             | Public     | Login page                         |
| `/dashboard`         | Protected  | User dashboard (requires auth)     |
| `/users`             | Protected  | User list (requires auth)          |
| `/users/[id]`        | Protected  | User profile (dynamic, requires auth) |
| `/not-found`         | Public     | Custom 404 page                    |
| `/api/admin/*`       | Protected  | Admin API (requires admin role)    |
| `/api/users/*`       | Protected  | User API (requires auth)           |

---

### Middleware

- **API Protection:**  
  - `/api/admin/*` requires a valid JWT in the `Authorization` header and checks for admin role.
  - `/api/users/*` requires a valid JWT in the `Authorization` header.
- **Page Protection:**  
  - `/dashboard` and `/users` (including `/users/[id]`) require a valid JWT in the `token` cookie.
  - Unauthenticated users are redirected to `/login`.

**See:** `src/app/middleware.ts`

---

### Dynamic Route Example

**File:** `src/app/users/[id]/page.tsx`

Renders a user profile page based on the URL parameter.

---

### Navigation & Layout

- Navigation links for Home, Login, Dashboard, and User 1 are included in the layout.
- Breadcrumbs are present on dynamic user pages for better navigation and SEO.

**See:** `src/app/layout.tsx`

---

### Custom 404 Page

A user-friendly 404 page is shown for unknown routes.

**See:** `src/app/not-found.tsx`

---

### Reflection

- **SEO:**  
  Next.js App Router enables server-side rendering and dynamic metadata, improving SEO for both static and dynamic routes.
- **Breadcrumbs:**  
  Breadcrumbs on dynamic pages help users and search engines understand site structure, improving navigation and SEO.
- **Error Handling:**  
  Custom 404 and error boundaries provide a better user experience and easier recovery from navigation errors.

---
## Global State Management: Context & Custom Hooks

### Overview

This project uses React Context and custom hooks to manage global state for authentication and UI preferences (theme, sidebar). This approach eliminates prop-drilling, keeps logic modular, and makes state transitions easy to track and optimize.

---

### Folder Structure

```
src/
  context/
    AuthContext.tsx   # Authentication state/context
    UIContext.tsx     # UI state/context (theme, sidebar)
  hooks/
    useAuth.ts        # Custom hook for auth logic
    useUI.ts          # Custom hook for UI logic
```

---

### How It Works

- **AuthContext** provides `user`, `login`, and `logout` globally.
- **UIContext** provides `theme`, `toggleTheme`, `sidebarOpen`, and `toggleSidebar` globally.
- **Custom hooks** (`useAuth`, `useUI`) encapsulate context access and reusable logic, making component code cleaner.

Both contexts are wrapped at the top level in `src/app/layout.tsx`:

```tsx
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UIProvider>{children}</UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### Example Usage

In `src/app/page.tsx`:

```tsx
"use client";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

export default function Home() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();

  return (
    <main className={theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}>
      <h1>State Management with Context & Hooks</h1>
      <section>
        <h2>Authentication</h2>
        {isAuthenticated ? (
          <>
            <p>Logged in as: {user}</p>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={() => login("KalviumUser")}>Login</button>
        )}
      </section>
      <section>
        <h2>UI Controls</h2>
        <p>Current Theme: {theme}</p>
        <button onClick={toggleTheme}>Toggle Theme</button>
        <button onClick={toggleSidebar}>
          {sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        </button>
      </section>
    </main>
  );
}
```

---

### State Transitions & Console Logs

- **Login:** `User logged in: KalviumUser`
- **Logout:** `User logged out`
- **Theme Toggle:** `Theme toggled to dark` / `Theme toggled to light`
- **Sidebar Toggle:** `Sidebar opened` / `Sidebar closed`

---

### Performance & Scalability

- **No prop-drilling:** Context provides state anywhere in the component tree.
- **Custom hooks** encapsulate logic, making components simpler and more maintainable.
- **Memoization/Reducers:** For more complex state, `useReducer` or `React.memo` can be added to optimize performance and prevent unnecessary re-renders.

---

### Reflection

- **Why Context & Hooks?**  
  They replace complex prop-passing and duplicated state, especially for authentication and UI preferences needed across many pages.
- **Real-world use case:**  
  Instead of passing user info and theme state through every layout and page, any component can access or update them directly via hooks.
- **Performance:**  
  For simple state, `useState` is sufficient. For larger apps, consider `useReducer` or memoization to avoid unnecessary renders.

---

### Screenshots / Evidence

- Console logs show state transitions (login, logout, theme toggle, sidebar toggle).
- React DevTools confirms context values update as expected.

---

### Summary

This approach keeps global state management clean, modular, and scalable—improving both developer experience and app maintainability.


### Reflection
Using pre-signed URLs improves scalability and security by removing file handling from the backend. Lifecycle policies and short-lived URLs reduce risk and storage cost.


## Email Service Integration (SendGrid)

### Why Transactional Emails
Transactional emails notify users about important actions like signup and alerts, improving trust and engagement.

### Provider Choice
SendGrid was chosen for its easy setup, free tier, and API-based integration.

### Email Flow
1. Client triggers an event (e.g., signup)
2. Backend calls `/api/email`
3. SendGrid sends email from verified sender

### Email Template
Reusable HTML templates are used for personalization and consistency.



### Security & Reliability
- API key stored securely in environment variables
- Verified sender authentication
- Rate limits handled by provider
- Bounce and spam monitoring via SendGrid dashboard

### Reflection
Integrating transactional emails highlighted the importance of reliable communication. Using SendGrid simplified delivery while keeping credentials secure and manageable.




## Layout & Component Architecture

### Component Hierarchy
LayoutWrapper
 ├── Header
 ├── Sidebar
 └── Page Content

### Reusable Components
- Header: Global navigation
- Sidebar: Contextual navigation
- LayoutWrapper: Shared layout wrapper
- Button: Reusable UI component with variants

### Styling Approach
- CSS Modules for scoped styling
- No external CSS framework
- Clear separation of structure and styles

### Design Decisions
- Centralized layout logic
- Barrel exports for cleaner imports
- Reusable components reduce duplication

### Screenshots
(Include dashboard and button screenshots)

### Reflection
Using CSS Modules with a component-driven architecture provides strong encapsulation, predictable styling, and long-term maintainability without reliance on third-party UI frameworks.
