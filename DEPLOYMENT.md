# SquadUp Deployment Guide

## Current Status
✅ **Local Development:** Backend & Frontend running on localhost  
✅ **Database:** MongoDB Atlas configured  
✅ **Auth:** Firebase enabled  

---

## Quick MongoDB IP Fix (30 seconds)

Your IP address changes when you restart or switch networks.

### Option 1: Add "Allow Anywhere" (Dev Only)
1. Go to https://cloud.mongodb.com → Network Access
2. Click "+ ADD IP ADDRESS"
3. Click "ALLOW ACCESS FROM ANYWHERE" button
4. Click "Confirm"
5. **Restart backend:** Ctrl+C in backend terminal, then `npm run dev`

### Option 2: Add Current IP (More Secure)
1. Visit https://whatismyipaddress.com/ to see your public IP
2. Go to https://cloud.mongodb.com → Network Access  
3. Click "+ ADD IP ADDRESS"
4. Paste your IP in the field
5. Click "Confirm"
6. Restart backend

---

## Deploy to Vercel + Render (Production)

### Step 1: Prepare GitHub Repository

```bash
# From project root
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

**Important:** Ensure `.env` and `.env.local` are in `.gitignore` (they already are)

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select "Next.js" as framework
4. Set **Root Directory:** `Frontend`
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://squadup-backend.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://squadup-backend.onrender.com
   NEXT_PUBLIC_FIREBASE_API_KEY=<from .env.local>
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=squadup-57986.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=squadup-57986
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=squadup-57986.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=727487377088
   NEXT_PUBLIC_FIREBASE_APP_ID=1:727487377088:web:e7aad0741ed4bb434e4725
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your stripe key>
   ```
6. Click "Deploy"
7. **Copy the Vercel URL** (e.g., `https://squadup.vercel.app`)

### Step 3: Deploy Backend to Render

1. Go to https://render.com/new
2. Select "Web Service"
3. Import your GitHub repository
4. Configure:
   - **Name:** squadup-backend
   - **Environment:** Node
   - **Root Directory:** `Backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<from Backend/.env>
   JWT_SECRET=<from Backend/.env>
   FIREBASE_PROJECT_ID=squadup-57986
   FIREBASE_PRIVATE_KEY=<from Backend/.env>
   FIREBASE_CLIENT_EMAIL=<from Backend/.env>
   STRIPE_SECRET_KEY=<your stripe secret>
   ALLOWED_ORIGINS=https://squadup.vercel.app,https://www.squadup.vercel.app
   ```
6. Click "Create Web Service"
7. Wait for deployment (~5 min)
8. **Copy the Render URL** (e.g., `https://squadup-backend.onrender.com`)

### Step 4: Update Vercel with Backend URL

1. Go to Vercel dashboard → Your Project Settings
2. Go to "Environment Variables"
3. Update:
   ```
   NEXT_PUBLIC_API_URL=https://squadup-backend.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://squadup-backend.onrender.com
   ```
4. Click "Redeploy" to rebuild frontend

### Step 5: Update MongoDB Atlas Whitelist

1. Go to https://cloud.mongodb.com → Network Access
2. Add Render's IP:
   - Click "+ ADD IP ADDRESS"
   - Add `0.0.0.0/0` (allows all IPs - fine for dev/staging)
   - OR use Render's static IP if available in settings
3. Click "Confirm"

---

## Production Checklist

- [ ] MongoDB Atlas whitelist includes Render's IP
- [ ] Vercel & Render environment variables set correctly
- [ ] Firebase credentials valid for production
- [ ] Stripe keys are **live** (not test) keys
- [ ] `ALLOWED_ORIGINS` includes Vercel domain
- [ ] SSL/HTTPS enabled (automatic on both platforms)
- [ ] Database backups enabled (MongoDB Atlas → Backup)
- [ ] Error logging configured (optional: Sentry/LogRocket)

---

## Testing Deployed App

1. Visit https://squadup.vercel.app
2. Test login with Firebase (Google/Email)
3. Complete student/mentor profile
4. Try creating a project/booking
5. Check backend logs in Render dashboard

---

## Troubleshooting Deployment

### "Connection Refused" Error
- Check Render backend URL is correct in Vercel env vars
- Verify MongoDB IP whitelist includes Render
- Check backend logs in Render dashboard

### "Firebase Initialization Failed"
- Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches your Firebase project
- Check API keys in Vercel env vars
- Clear browser cache & reload

### "API 401 Unauthorized"
- Check `JWT_SECRET` matches in backend `.env` and Render
- Clear localStorage and re-login
- Verify token is being stored correctly

### "Socket.IO Connection Timeout"
- Verify `NEXT_PUBLIC_SOCKET_URL` points to Render backend
- Check Render allows WebSocket connections (should be automatic)
- Try restarting Render app

---

## Local Development Commands

```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev

# Visit http://localhost:3000
```

---

## Environment Variables Reference

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/squadup
JWT_SECRET=super-secret-key-change-in-production
FIREBASE_PROJECT_ID=squadup-57986
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@squadup-57986.iam.gserviceaccount.com
STRIPE_SECRET_KEY=sk_test_...
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=squadup-57986.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=squadup-57986
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=squadup-57986.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=727487377088
NEXT_PUBLIC_FIREBASE_APP_ID=1:727487377088:web:...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Support

For deployment issues:
1. Check Render & Vercel logs
2. Verify environment variables exactly match
3. Clear browser cache and local storage
4. Restart both services

Questions? Check the main README.md for architecture details.
