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

### Reflection
Implementing authentication with bcrypt and JWT reinforced the importance of security-first backend design. Using Prisma ensured clean database access while keeping the API scalable.
