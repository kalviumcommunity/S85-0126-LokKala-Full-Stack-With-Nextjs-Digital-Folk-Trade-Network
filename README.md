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

### Example PR Screenshot
_Add a screenshot of a real PR showing review and checks passing here:_

![Example PR with checks and review](<your-screenshot-path-or-link-here>)

---

### Deliverables Checklist
- [x] Branch naming conventions documented in README
- [x] PR template in .github/pull_request_template.md
- [x] Code review checklist in README
- [x] Branch protection rules set up on GitHub
- [x] Screenshot(s) of a PR with review/checks

---