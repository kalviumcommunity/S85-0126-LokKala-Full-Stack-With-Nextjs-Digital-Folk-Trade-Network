# Testing Guide: Loading States & Error Boundaries

This guide will help you test and capture evidence of the loading skeletons and error boundaries implementation.

## Prerequisites

1. Make sure your development server is running:

   ```bash
   npm run dev
   ```

2. Open the app in your browser: `http://localhost:3000`

## Part 1: Testing Loading States

### Test 1: Dashboard Loading Skeleton

1. **Navigate to Dashboard**: Go to `http://localhost:3000/dashboard`
2. **Observe**: You should see a loading skeleton with pulsing gray blocks for ~2 seconds
3. **What to capture**:
   - Screenshot of the skeleton screen showing animated gray blocks
   - The skeleton should show placeholders for title, subtitle, and 3 stat cards

### Test 2: Marketplace Loading Skeleton

1. **Navigate to Marketplace**: Go to `http://localhost:3000/marketplace`
2. **Observe**: You should see skeleton placeholders for the artwork list
3. **What to capture**:
   - Screenshot showing list of skeleton items with pulsing animations
   - Note how the layout matches the final content structure

### Test 3: Art Detail Loading Skeleton

1. **Navigate to Art Detail**: Go to `http://localhost:3000/art/1`
2. **Observe**: Skeleton showing placeholder for image, title, description, and metadata
3. **What to capture**:
   - Screenshot of the art detail skeleton
   - Shows how a detailed page handles loading state

### Test 4: Network Throttling (Extended Loading)

1. **Open Chrome DevTools**: Press F12
2. **Go to Network Tab**: Click "Network" at the top
3. **Enable Throttling**:
   - Click the "No throttling" dropdown
   - Select "Slow 3G" or "Fast 3G"
4. **Navigate to any route**: Visit `/dashboard`, `/marketplace`, or `/art/1`
5. **Observe**: Loading skeleton will be visible for much longer
6. **What to capture**:
   - Screenshot showing DevTools with throttling enabled
   - Video/GIF of the loading skeleton animation (optional but impressive)
   - Note the smooth transition from skeleton → real content

### Test 5: Dark Mode Loading States

1. **Toggle Dark Mode**: Use the theme toggle in the header
2. **Navigate to routes**: Visit dashboard, marketplace, or art pages
3. **Observe**: Skeletons use dark gray tones instead of light gray
4. **What to capture**:
   - Screenshot showing loading skeleton in dark mode
   - Demonstrates responsive theming

## Part 2: Testing Error Boundaries

### Test 1: Simulate Marketplace Error

1. **Open the file**: `src/app/marketplace/page.tsx`
2. **Uncomment the error line**:
   ```ts
   // Find this line and uncomment it:
   throw new Error("Failed to fetch artworks from the database");
   ```
3. **Save the file** (Next.js will hot reload)
4. **Navigate**: Go to `http://localhost:3000/marketplace`
5. **Observe**: You should see the error boundary UI with:
   - Red-themed error card
   - Error icon
   - Friendly message: "Unable to Load Marketplace"
   - Technical error details
   - "Try Again" button
   - "Return to Home" link
6. **What to capture**:
   - Screenshot of the full error screen
   - Note the helpful messaging and recovery options

### Test 2: Test Retry Functionality

1. **With error still active**: On the marketplace error screen
2. **Click "Try Again"**: Click the retry button
3. **Observe**: The error should re-appear (because the error is still in the code)
4. **Comment out the error**: Go back to `marketplace/page.tsx` and comment the error line
5. **Click "Try Again" again**: The page should now load successfully
6. **What to capture**:
   - Screenshot showing successful recovery after fixing the error
   - Demonstrates the reset() functionality

### Test 3: Simulate Dashboard Error

1. **Open the file**: `src/app/dashboard/page.tsx`
2. **Uncomment the error line** in the `loadUsers` function:
   ```ts
   throw new Error("Simulated error: Unable to connect to the server");
   ```
3. **Save and navigate**: Go to `http://localhost:3000/dashboard`
4. **Observe**: Dashboard-specific error boundary
5. **What to capture**:
   - Screenshot showing different error context for dashboard
   - Shows how errors are contextual to the page

### Test 4: Simulate Art Detail Error

1. **Open the file**: `src/app/art/[id]/page.tsx`
2. **Uncomment the error line**:
   ```ts
   throw new Error("Failed to load artwork details");
   ```
3. **Navigate**: Go to `http://localhost:3000/art/1`
4. **Observe**: Art detail error boundary with additional "Browse All Artworks" link
5. **What to capture**:
   - Screenshot showing contextual error handling
   - Note the multiple recovery paths offered

### Test 5: Dark Mode Error States

1. **Toggle to dark mode**
2. **Trigger any error** (using steps above)
3. **Observe**: Error UI adapts to dark theme
4. **What to capture**:
   - Screenshot of error boundary in dark mode
   - Shows consistent theming even in error states

### Test 6: Browser Console Logging

1. **Open DevTools Console**: Press F12, click "Console" tab
2. **Trigger any error**: Use any of the error simulation methods above
3. **Observe**: Error details logged to console for debugging
4. **What to capture**:
   - Screenshot of console showing error log
   - Demonstrates error tracking for developers

## Part 3: Testing Complete User Journey

### Scenario: Full Recovery Flow

1. **Start**: User visits homepage at `http://localhost:3000`
2. **Navigate**: Click to `/marketplace`
3. **See Loading**: Observe skeleton for 2 seconds
4. **Content Loads**: Marketplace artworks appear
5. **Simulate Error**: Uncomment error in marketplace page
6. **Refresh**: Reload the page to trigger error
7. **See Error**: Error boundary displays
8. **Attempt Retry**: Click "Try Again" (error persists)
9. **Fix Issue**: Comment out the error
10. **Retry Again**: Click "Try Again" - success!

**What to capture**: A video or series of screenshots showing this entire flow demonstrates the complete user experience.

## Evidence Checklist

Create a folder to organize your evidence:

```
evidence/
  loading-states/
    ✓ dashboard-loading-light.png
    ✓ dashboard-loading-dark.png
    ✓ marketplace-loading.png
    ✓ art-detail-loading.png
    ✓ network-throttling-devtools.png
    ✓ loading-to-content-transition.gif (optional)

  error-boundaries/
    ✓ marketplace-error-light.png
    ✓ marketplace-error-dark.png
    ✓ dashboard-error.png
    ✓ art-detail-error.png
    ✓ retry-success.png
    ✓ console-error-log.png

  video/
    ✓ complete-user-journey.mp4 (optional but impressive)
```

## Important Reminders

1. **Clean up after testing**: Make sure to comment out all the error throws before committing:
   - `src/app/marketplace/page.tsx`
   - `src/app/art/[id]/page.tsx`
   - `src/app/dashboard/page.tsx`

2. **Keep the delays**: The `setTimeout` delays are helpful for development and demos. They can be reduced or removed in production.

3. **Test both themes**: Capture screenshots in both light and dark modes to show comprehensive theming.

4. **Real-world testing**: Also test with actual slow network conditions (not just throttling) if possible.

## Bonus: Advanced Testing

### Test Network Offline Mode

1. **Open DevTools**: Press F12
2. **Go to Network Tab**
3. **Check "Offline"** checkbox
4. **Navigate**: Try to visit any route
5. **Observe**: How the app handles complete network failure

### Test Rapid Navigation

1. **Quickly navigate** between routes (dashboard → marketplace → art → home)
2. **Observe**: Loading states appear and disappear smoothly
3. **Check for**: No layout shifts or content flashing

### Test on Mobile

1. **Open DevTools**: Press F12
2. **Toggle Device Toolbar**: Ctrl+Shift+M (or Cmd+Shift+M on Mac)
3. **Select a mobile device**: iPhone, Pixel, etc.
4. **Navigate routes**: Test loading and error states on mobile viewport
5. **Observe**: Responsive skeleton layouts

## Questions to Reflect On

Include these reflections in your documentation:

1. **How do loading skeletons improve perceived performance compared to blank screens?**
2. **Why is the retry button important for user autonomy?**
3. **How do these patterns reduce support requests?**
4. **What happens to user trust when errors are handled gracefully vs. showing raw error messages?**
5. **How does the implementation demonstrate defensive programming?**

---

Happy testing! These patterns show professional-grade UX engineering. 🎨✨
