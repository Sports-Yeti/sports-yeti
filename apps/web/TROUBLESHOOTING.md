# Troubleshooting Guide - Recharts Import Error

## Issue
```
Failed to resolve import "recharts" from "src/pages/AnalyticsPage.tsx"
```

## Solution

The dependencies are installed correctly in package.json. The issue is that the Vite dev server needs to be restarted to pick up the new dependencies.

### Quick Fix:

1. **Stop the current dev server** (Ctrl+C in terminal)

2. **Clear the Vite cache** (optional but recommended):
```bash
cd apps/web
rm -rf node_modules/.vite
```

3. **Restart the dev server**:
```bash
npm run dev
```

### Alternative: Force reinstall

If the above doesn't work, try:

```bash
cd apps/web
rm -rf node_modules
npm install
npm run dev
```

### Verify Installation

Check that recharts is installed:
```bash
cd apps/web
npm list recharts
```

Expected output:
```
@sports-yeti/web@0.0.1 /path/to/apps/web
└── recharts@3.4.1
```

## Current Dependencies

The following enhancement packages are installed:

- ✅ `recharts@3.4.1` - Charts and analytics
- ✅ `papaparse@5.5.3` - CSV export
- ✅ `jspdf@3.0.4` - PDF generation
- ✅ `jspdf-autotable@5.0.2` - PDF tables
- ✅ `react-i18next@16.3.5` - Internationalization
- ✅ `i18next@25.6.3` - i18n core
- ✅ `@types/papaparse@5.5.0` - TypeScript types

## Why This Happens

When you install new packages while the dev server is running, Vite doesn't automatically detect them. You need to restart the server to rebuild the dependency graph.

## If Still Not Working

1. Check if you're in the correct directory:
```bash
pwd  # Should show: /workspace/apps/web
```

2. Verify package.json has recharts:
```bash
cat package.json | grep recharts
```

3. Check node_modules exists:
```bash
ls -la node_modules/recharts
```

4. Try building instead of dev:
```bash
npm run build
npm run preview
```

## Success!

Once the dev server restarts successfully, you should be able to:
- Navigate to `/analytics` route
- See all charts rendering correctly
- No import errors in console

---

**Note**: This is a common issue with Vite hot reload. Always restart the dev server after installing new packages.
