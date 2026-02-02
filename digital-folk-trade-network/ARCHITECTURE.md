# Architecture Overview: Loading & Error States

## File Structure

```
digital-folk-trade-network/
├── src/app/
│   ├── dashboard/
│   │   ├── page.tsx          ← Main component (updated with delay)
│   │   ├── loading.tsx       ← NEW: Shows while page.tsx loads
│   │   └── error.tsx         ← NEW: Shows if page.tsx errors
│   │
│   ├── marketplace/
│   │   ├── page.tsx          ← Main component (updated with delay)
│   │   ├── loading.tsx       ← NEW: Shows while page.tsx loads
│   │   └── error.tsx         ← NEW: Shows if page.tsx errors
│   │
│   └── art/[id]/
│       ├── page.tsx          ← Main component (updated with delay)
│       ├── loading.tsx       ← NEW: Shows while page.tsx loads
│       └── error.tsx         ← NEW: Shows if page.tsx errors
│
├── README.md                  ← Updated with new section
├── TESTING_GUIDE.md          ← NEW: Step-by-step testing
├── IMPLEMENTATION_SUMMARY.md ← NEW: Complete overview
└── QUICK_REFERENCE.md        ← NEW: Quick reference card
```

## How Next.js Handles These Files

### Loading Flow

```
User navigates to /dashboard
         ↓
Next.js checks: Is page.tsx ready?
         ↓
    ┌─── NO ───┐
    │          │
    ↓          ↓ YES
Show          Show
loading.tsx   page.tsx
    │          ↑
    │          │
    └─ Data loaded ─┘
```

### Error Flow

```
page.tsx starts rendering
         ↓
Error occurs (network, code, etc.)
         ↓
Next.js catches error
         ↓
Shows error.tsx with:
  - Error message
  - Retry button
  - Alternative links
         ↓
User clicks "Try Again"
         ↓
Calls reset() function
         ↓
Re-renders page.tsx
```

## Component Hierarchy

### Dashboard Route (`/dashboard`)

```
┌─────────────────────────────────────┐
│ Route Segment: /dashboard          │
├─────────────────────────────────────┤
│                                     │
│  ┌─── Loading State ────┐          │
│  │ loading.tsx           │          │
│  │ • Skeleton header     │          │
│  │ • 3 pulsing cards     │          │
│  └───────────────────────┘          │
│           OR                        │
│  ┌─── Success State ────┐          │
│  │ page.tsx              │          │
│  │ • Real header         │          │
│  │ • Real data cards     │          │
│  └───────────────────────┘          │
│           OR                        │
│  ┌─── Error State ──────┐          │
│  │ error.tsx             │          │
│  │ • Error message       │          │
│  │ • Retry button        │          │
│  │ • Navigation links    │          │
│  └───────────────────────┘          │
│                                     │
└─────────────────────────────────────┘
```

### Marketplace Route (`/marketplace`)

```
┌─────────────────────────────────────┐
│ Route Segment: /marketplace        │
├─────────────────────────────────────┤
│                                     │
│  ┌─── Loading State ────┐          │
│  │ loading.tsx           │          │
│  │ • Title skeleton      │          │
│  │ • 5 list skeletons    │          │
│  └───────────────────────┘          │
│           OR                        │
│  ┌─── Success State ────┐          │
│  │ page.tsx              │          │
│  │ • Artworks list       │          │
│  │ • ISR info            │          │
│  └───────────────────────┘          │
│           OR                        │
│  ┌─── Error State ──────┐          │
│  │ error.tsx             │          │
│  │ • Marketplace error   │          │
│  │ • Retry option        │          │
│  └───────────────────────┘          │
│                                     │
└─────────────────────────────────────┘
```

### Art Detail Route (`/art/[id]`)

```
┌─────────────────────────────────────┐
│ Route Segment: /art/[id]           │
├─────────────────────────────────────┤
│                                     │
│  ┌─── Loading State ────┐          │
│  │ loading.tsx           │          │
│  │ • Image skeleton      │          │
│  │ • Title skeleton      │          │
│  │ • Description blocks  │          │
│  │ • Metadata blocks     │          │
│  └───────────────────────┘          │
│           OR                        │
│  ┌─── Success State ────┐          │
│  │ page.tsx              │          │
│  │ • Artwork details     │          │
│  │ • Real image          │          │
│  │ • Description         │          │
│  └───────────────────────┘          │
│           OR                        │
│  ┌─── Error State ──────┐          │
│  │ error.tsx             │          │
│  │ • Artwork load error  │          │
│  │ • Multiple nav links  │          │
│  └───────────────────────┘          │
│                                     │
└─────────────────────────────────────┘
```

## State Machine Diagram

```
                    ┌─────────────┐
                    │   Initial   │
                    │   (Idle)    │
                    └──────┬──────┘
                           │
                    User navigates
                           ↓
                    ┌──────────────┐
              ┌─────┤   Loading    │
              │     │  (Skeleton)  │
              │     └──────┬───────┘
              │            │
    Network   │      Data fetch
    failure   │      completes
              │            │
              ↓            ↓
        ┌─────────┐  ┌─────────┐
        │  Error  │  │ Success │
        │  (UI)   │  │ (Data)  │
        └────┬────┘  └─────────┘
             │
        User clicks
        "Try Again"
             │
             ↓
          reset()
             │
             └──────> (Back to Loading)
```

## Data Flow

### Loading State

```
1. User → Navigate to route
2. Next.js → Detect async data fetching
3. React → Suspend component rendering
4. Next.js → Render loading.tsx
5. User → See skeleton UI
6. Server → Fetch completes
7. Next.js → Replace loading.tsx with page.tsx
8. User → See real content
```

### Error State

```
1. page.tsx → Throw error (or async error)
2. React → Catch error in boundary
3. Next.js → Render error.tsx
4. User → See error UI
5. User → Click "Try Again"
6. error.tsx → Call reset()
7. React → Clear error state
8. Next.js → Re-render page.tsx
9. (Loop back to loading or success)
```

## Key Concepts

### React Suspense (Automatic)

- Next.js automatically wraps async components in Suspense
- `loading.tsx` is the Suspense fallback
- No manual `<Suspense>` wrapper needed
- Works with async Server Components

### Error Boundaries

- `error.tsx` must be Client Component (`"use client"`)
- Catches errors in child components
- Provides `error` and `reset` props
- Does NOT catch errors in layouts or error.tsx itself

### File Naming Convention

- `loading.tsx` or `loading.js` (TypeScript or JavaScript)
- `error.tsx` or `error.js`
- Must be in the same folder as `page.tsx`
- Next.js recognizes these special files automatically

## Styling Strategy

### Tailwind Classes Used

**Loading Skeletons:**

- `animate-pulse` - Creates pulsing animation
- `bg-gray-300/200` - Light mode skeleton colors
- `dark:bg-gray-700/600` - Dark mode skeleton colors
- `rounded-lg/md` - Rounded corners matching content
- `h-*` and `w-*` - Height and width to match layout

**Error Boundaries:**

- `bg-red-50` / `dark:bg-red-950` - Error background
- `border-red-200` / `dark:border-red-900` - Error border
- `text-red-*` - Error text colors
- `hover:bg-red-700` - Interactive button states
- `focus:ring-*` - Accessibility focus states

## Browser DevTools Integration

### Network Tab

```
Network Tab → Throttling
├── No throttling (default)
├── Fast 3G (560ms latency)
├── Slow 3G (2000ms latency)
└── Offline (network disabled)
```

### Console Tab

```
Console → Filter by:
├── All (see everything)
├── Errors (see error boundary logs)
├── Warnings (see React warnings)
└── Info (see custom logs)
```

## Performance Metrics

### What to Measure

- **Time to First Skeleton**: How quickly loading state appears
- **Skeleton Display Duration**: How long users see skeleton
- **Error Recovery Time**: Time from error → retry → success
- **Layout Shift**: CLS score should be low (skeleton matches content)

### Expected Results

- Loading state: Appears immediately (< 100ms)
- Skeleton duration: 1.5-2 seconds (simulated delay)
- Error UI: Appears immediately on error
- Layout shift: Minimal (skeleton matches final layout)

## Accessibility Features

### Loading States

- Semantic HTML (divs with proper roles)
- Screen reader considerations (content is hidden, not removed)
- No confusing interactive elements during loading

### Error Boundaries

- Clear heading hierarchy (`<h2>` for error title)
- Descriptive button text ("Try Again" is clear action)
- Links have descriptive text
- Focus management on retry button
- Color is not the only indicator (icons + text)

## Security Considerations

### Error Messages

- ✅ DO: Show friendly, generic messages to users
- ✅ DO: Log detailed errors to console for developers
- ❌ DON'T: Expose database queries or stack traces to users
- ❌ DON'T: Show sensitive data in error messages

### Error Logging

- Console logs for development
- Should integrate with error monitoring (Sentry, etc.) in production
- Never log sensitive user data
- Include error digest for tracking

---

This architecture provides a robust, user-friendly experience that handles both loading states and errors gracefully while maintaining security and accessibility standards.
