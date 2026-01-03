# Environment Variables - Correct Configuration

## FRONTEND (Vercel)

### ❌ WRONG (Current):
NEXT_PUBLIC_API_URL = /api

### ✅ CORRECT (Should be):
NEXT_PUBLIC_API_URL = https://squad-up-3fh0nrender.com/api

## BACKEND (Render)

### Required Variables:

1. FRONTEND_URL = https://squadup-roshannnn7.vercel.app

2. ALLOWED_ORIGINS = https://squadup-roshannnn7.vercel.app,http://localhost:3000
   (This tells the backend which origins can make requests)

3. All your Firebase variables (already set ✓)

4. MONGODB_URI (already set ✓)

5. JWT_SECRET (already set ✓)

6. NODE_ENV = production

7. PORT = 5000

## How to Fix:

### Step 1: Fix Vercel NEXT_PUBLIC_API_URL
1. Go to Vercel dashboard
2. Click on NEXT_PUBLIC_API_URL
3. Click Edit (three dots menu)
4. Change value to: https://squad-up-3fh0nrender.com/api
5. Save
6. Redeploy

### Step 2: Verify Render ALLOWED_ORIGINS
1. Go to Render dashboard
2. Check if ALLOWED_ORIGINS exists
3. If not, add it with value: https://squadup-roshannnn7.vercel.app,http://localhost:3000
4. If it exists, make sure it includes your Vercel URL

### Step 3: Redeploy Both
1. Redeploy Vercel (after changing env var)
2. Redeploy Render (if you changed ALLOWED_ORIGINS)

## After Fixing:

Your login flow will be:
1. User clicks "Sign in with Google" on: https://squadup-roshannnn7.vercel.app
2. Frontend makes request to: https://squad-up-3fh0nrender.com/api/auth/verify
3. Backend checks ALLOWED_ORIGINS and allows the request
4. User is logged in successfully!
