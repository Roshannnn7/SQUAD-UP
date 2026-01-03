# URGENT FIX - Environment Variable Configuration

## 🚨 THE PROBLEM

Your frontend is trying to call itself instead of the backend!

**Current behavior**: Frontend calls `https://squadup-roshannnn7.vercel.app/api/auth/verify`
**Expected behavior**: Frontend should call `https://YOUR-BACKEND.onrender.com/api/auth/verify`

## 🔧 THE FIX

### Step 1: Find Your Render Backend URL

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Copy the URL (should look like: `https://squadup-XXXXX.onrender.com`)

### Step 2: Update Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Click on your **squadup** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)
5. Look for `NEXT_PUBLIC_API_URL`:
   - If it exists: Click **Edit** and update the value
   - If it doesn't exist: Click **Add New**
6. Set the value to: `https://YOUR-BACKEND-URL.onrender.com/api`
   - Example: `https://squadup-ftz9.onrender.com/api`
7. Make sure it's enabled for **Production**, **Preview**, and **Development**
8. Click **Save**

### Step 3: Redeploy Frontend

After saving the environment variable:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **⋮** (three dots) menu
4. Click **Redeploy**
5. Wait for deployment to complete (1-2 minutes)

## ✅ VERIFICATION

After redeployment:

1. Open your site: https://squadup-roshannnn7.vercel.app/auth/login
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try to login with Google
5. Check the request URL - it should now point to your Render backend, not Vercel

## 📋 CHECKLIST

- [ ] Found Render backend URL
- [ ] Added/Updated `NEXT_PUBLIC_API_URL` on Vercel
- [ ] Redeployed frontend on Vercel
- [ ] Verified Network requests go to Render backend
- [ ] Login works successfully

## 🔍 COMMON RENDER BACKEND URLS

Based on your previous conversations, your backend URL might be:
- `https://squadup-ftz9.onrender.com`

If you're not sure, check your Render dashboard or look at your previous deployment logs.

## ⚠️ IMPORTANT NOTES

1. **Don't forget the `/api` suffix** in the environment variable
2. **Make sure to redeploy** after changing environment variables
3. **Check both Render and Vercel** are fully deployed before testing
4. The backend URL should be **HTTPS**, not HTTP

## 🆘 STILL NOT WORKING?

If you still see errors after this:

1. Check Render logs to see if requests are reaching the backend
2. Verify `ALLOWED_ORIGINS` on Render includes your Vercel URL
3. Share the Network tab screenshot showing the failed request
