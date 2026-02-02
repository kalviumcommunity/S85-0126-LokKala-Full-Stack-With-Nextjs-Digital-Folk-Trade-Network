# Quick Reference Card: Loading & Error States

## 🚀 Quick Test Commands

```bash
# Start dev server
npm run dev

# Visit routes to see loading states (with 1.5-2s delay)
# http://localhost:3000/dashboard
# http://localhost:3000/marketplace
# http://localhost:3000/art/1
```

## 📁 Files Created

### Loading Skeletons

- `src/app/dashboard/loading.tsx` - Dashboard stats skeleton
- `src/app/marketplace/loading.tsx` - Artworks list skeleton
- `src/app/art/[id]/loading.tsx` - Artwork detail skeleton

### Error Boundaries

- `src/app/dashboard/error.tsx` - Dashboard error handler
- `src/app/marketplace/error.tsx` - Marketplace error handler
- `src/app/art/[id]/error.tsx` - Art detail error handler

### Documentation

- `README.md` - Updated with Loading & Error Boundaries section
- `TESTING_GUIDE.md` - Step-by-step testing instructions
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation overview

## 🧪 Testing Shortcuts

### See Loading States

1. Navigate to any route listed above
2. Watch skeleton appear for 1.5-2 seconds
3. See smooth transition to real content

**Pro tip:** Enable Network throttling (Slow 3G) in DevTools for longer visibility

### See Error Boundaries

1. Open page file (e.g., `src/app/marketplace/page.tsx`)
2. Uncomment this line:
   ```ts
   throw new Error("Failed to fetch artworks from the database");
   ```
3. Navigate to that route
4. See error UI with retry button
5. Click "Try Again" to test retry
6. Comment out error and retry again to see recovery

## 🎨 Key Features

### Loading Skeletons

- ✨ `animate-pulse` Tailwind utility
- 🎨 Gray tones (light/dark mode)
- 📱 Responsive layouts
- ⚡ Instant feedback

### Error Boundaries

- 🔴 Visual error icons
- 💬 Friendly messages
- 🔄 Retry button (`reset()`)
- 🏠 Alternative navigation
- 📝 Console logging

## 📸 Evidence Checklist

### Loading States (Screenshots)

- [ ] Dashboard loading (light mode)
- [ ] Dashboard loading (dark mode)
- [ ] Marketplace loading
- [ ] Art detail loading
- [ ] DevTools with network throttling enabled

### Error States (Screenshots)

- [ ] Dashboard error (light mode)
- [ ] Dashboard error (dark mode)
- [ ] Marketplace error
- [ ] Art detail error
- [ ] Console showing error logs
- [ ] Successful retry after fixing error

### Optional (Bonus)

- [ ] Video/GIF of loading animation
- [ ] Video of complete error → retry → success flow
- [ ] Mobile viewport testing screenshots

## 🔍 Where to Find Things

### Routes with loading states:

- Dashboard: `/dashboard`
- Marketplace: `/marketplace`
- Art detail: `/art/1` or `/art/2`

### Delay locations (for adjustment):

- `src/app/marketplace/page.tsx` (line ~9)
- `src/app/art/[id]/page.tsx` (line ~22)
- `src/app/dashboard/page.tsx` (line ~19)

### Error simulation (commented out):

- `src/app/marketplace/page.tsx` (line ~11)
- `src/app/art/[id]/page.tsx` (line ~25)
- `src/app/dashboard/page.tsx` (line ~22)

## ⚡ Browser DevTools Shortcuts

### Network Throttling

1. F12 → Network tab
2. Click "No throttling" dropdown
3. Select "Slow 3G" or "Fast 3G"

### Mobile View

1. F12 → Ctrl+Shift+M (Cmd+Shift+M on Mac)
2. Select device (iPhone, Pixel, etc.)
3. Navigate routes to test responsive skeletons

### Console

1. F12 → Console tab
2. See error logs when boundaries trigger
3. Useful for debugging

## 🎯 What Each Route Shows

| Route          | Loading Shows            | Error Shows                  |
| -------------- | ------------------------ | ---------------------------- |
| `/dashboard`   | 3 stat cards skeleton    | "Oops! Something went wrong" |
| `/marketplace` | 5 artwork list items     | "Unable to Load Marketplace" |
| `/art/1`       | Image + details skeleton | "Failed to Load Artwork"     |

## 💡 Pro Tips

1. **Test both themes:** Toggle dark mode to see skeleton/error styling in both themes
2. **Use throttling:** Makes loading states more visible during development
3. **Check console:** Error boundaries log to console for debugging
4. **Mobile testing:** Skeletons are responsive - test on mobile viewports
5. **Clean up:** Comment out error throws before committing code

## 📚 Learn More

- **Detailed testing:** See [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Implementation details:** See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **User experience:** See README.md "Loading Skeletons & Error Boundaries" section

## ✅ Pre-Submission Checklist

- [ ] All loading states tested and working
- [ ] All error boundaries tested and working
- [ ] Retry functionality verified
- [ ] Screenshots captured (light & dark mode)
- [ ] Error throws are commented out (not active)
- [ ] Documentation reviewed
- [ ] README updated with evidence section
- [ ] Reflection questions answered

---

**Status:** Implementation complete ✅  
**Ready for:** Testing & evidence collection 📸  
**Time to test:** ~15-20 minutes for comprehensive testing
