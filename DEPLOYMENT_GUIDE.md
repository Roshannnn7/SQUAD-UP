# SquadUp - Complete Deployment Guide (Vercel + Render)

## 📋 Prerequisites

Before starting, ensure you have:
- GitHub account with code pushed
- MongoDB Atlas account with connection string
- Firebase project setup
- Vercel account (vercel.com)
- Render account (render.com)
- All environment variables ready

---

## 🎯 Part 1: Backend Deployment (Node.js on Render)

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
cd "c:\Users\roshan rathod\OneDrive\Desktop\SQUAD UP"
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SquadUp collaborative learning platform"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/squad-up.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username.**

### Step 2: Create Render Account & Link GitHub

1. Go to **[render.com](https://render.com)**
2. Sign up with GitHub (easiest option)
3. Click **"New +"** → **"Web Service"**
4. Select **"Build and deploy from a Git repository"**
5. Click **"Connect account"** and authorize GitHub
6. Select your **squad-up** repository
7. Choose the **main** branch

### Step 3: Configure Render Service

**Service Details:**
- **Name:** `squad-up-backend` (or any name)
- **Environment:** `Node`
- **Region:** Choose closest to your users (e.g., Singapore, US-East)
- **Branch:** `main`
- **Build Command:** `npm install`
- **Start Command:** `npm run dev` (or use `node server.js`)

**Important:** Keep "Auto-Deploy" **ON**

### Step 4: Add Environment Variables

In Render dashboard, scroll to **"Environment"** section:

Add these variables:

```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/squad-up?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

FIREBASE_PROJECT_ID=squadup-57986

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"

FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@squadup-57986.iam.gserviceaccount.com

CORS_ORIGINS=https://squad-up-frontend.vercel.app,http://localhost:3000

NODE_ENV=production

PORT=5000
```

**Important Notes:**
- Get `FIREBASE_PRIVATE_KEY` from Firebase Console > Project Settings > Service Accounts > Copy Private Key
- Keep the `\n` in the key exactly as shown
- Update `CORS_ORIGINS` after frontend is deployed to Vercel

### Step 5: Deploy Backend

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Wait for deployment to complete (watch the logs)
4. Your backend URL will be: `https://squad-up-backend.onrender.com`
5. **Copy this URL** - you'll need it for frontend

### Step 6: Test Backend

```bash
# Test if backend is running
curl https://squad-up-backend.onrender.com/api/auth/me
# Should get 401 (no token) - that's correct!
```

---

## 🎨 Part 2: Frontend Deployment (Next.js on Vercel)

### Step 1: Create Vercel Project

1. Go to **[vercel.com](https://vercel.com)**
2. Sign up/Login with GitHub
3. Click **"Import Project"** or **"Add New"** → **"Project"**
4. Select your **squad-up** repository
5. Vercel will auto-detect Next.js

### Step 2: Configure Build Settings

**Framework Preset:** Next.js (auto-detected)

**Build Command:**
```
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```
npm install
```

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://squad-up-backend.onrender.com/api

NEXT_PUBLIC_SOCKET_URL=https://squad-up-backend.onrender.com

NEXT_PUBLIC_FIREBASE_PROJECT_ID=squadup-57986

NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=squadup-57986.firebaseapp.com

NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://squadup-57986-default-rtdb.firebaseio.com

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=squadup-57986.appspot.com

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_ID

NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

**Get these from:**
- Firebase Console > Project Settings > Your Apps
- Stripe Dashboard (if using payments)

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. Wait for green checkmark ✅
4. Your frontend URL: `https://squad-up-frontend.vercel.app` (or custom domain)
5. **Copy this URL**

### Step 5: Update Backend CORS

Go back to **Render Dashboard**:
1. Select your backend service
2. Go to **"Environment"**
3. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://squad-up-frontend.vercel.app,http://localhost:3000
   ```
4. Click **"Save Changes"** (auto-redeploys)

---

## 🔗 Part 3: Database & Services Configuration

### MongoDB Atlas IP Whitelist

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. Select your cluster
3. Go to **"Security"** → **"Network Access"**
4. Click **"Add IP Address"**
5. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add Render's IP range

⚠️ **For production:** Use specific IP addresses, not 0.0.0.0/0

### Firebase Configuration

1. Go to **[Firebase Console](https://console.firebase.google.com)**
2. Select your project
3. Go to **"Project Settings"**
4. Authorized domains (if using custom domain):
   - Add `squad-up-frontend.vercel.app`
   - Add your custom domain (if any)

---

## ✅ Part 4: Testing Deployment

### Test 1: Backend Health Check
```bash
curl https://squad-up-backend.onrender.com/api/health
# Should return success
```

### Test 2: Frontend Access
1. Go to `https://squad-up-frontend.vercel.app`
2. Should load SquadUp login page
3. Network tab should show API calls to backend

### Test 3: End-to-End Flow
1. **Register** new account
2. **Complete Profile** 
3. **Login** again
4. Check **Dashboard**
5. Test **Video Call** features
6. Check **Real-time Chat**

### Test 4: Mobile Responsiveness
1. Open frontend on mobile browser
2. Test touch interactions
3. Test video call on mobile

---

## 🔐 Part 5: Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production` on backend
- [ ] Use HTTPS only (Vercel/Render provide automatic)
- [ ] Enable MongoDB IP whitelist (don't use 0.0.0.0/0 in production)
- [ ] Store Firebase keys in environment variables (not in code)
- [ ] Enable CORS only for your domain
- [ ] Set secure cookies (if using sessions)
- [ ] Enable rate limiting on API
- [ ] Monitor logs for errors/attacks
- [ ] Regular backups of MongoDB

---

## 🚀 Part 6: Custom Domains (Optional)

### Add Custom Domain to Vercel

1. In Vercel Dashboard, go to **"Settings"** → **"Domains"**
2. Enter your domain (e.g., `app.squadup.com`)
3. Update DNS records at your registrar:
   ```
   Name: app
   Type: CNAME
   Value: cname.vercel.com
   ```
4. Vercel will auto-generate SSL certificate

### Add Custom Domain to Render

1. In Render Dashboard, go to **"Settings"** → **"Custom Domain"**
2. Enter domain (e.g., `api.squadup.com`)
3. Update DNS records:
   ```
   Name: api
   Type: CNAME
   Value: onrender.com
   ```

---

## 📊 Part 7: Monitoring & Logs

### Render Logs
1. Backend Service → **"Logs"** tab
2. Watch real-time server logs
3. Check for errors/warnings

### Vercel Analytics
1. Frontend Project → **"Analytics"** tab
2. Monitor build times
3. Check deployment history

### MongoDB Atlas
1. Cluster → **"Monitoring"**
2. Track database performance
3. Monitor connection count

---

## 🔄 Part 8: Continuous Deployment

Both Vercel and Render auto-deploy on GitHub push:

```bash
# Make changes locally
git add .
git commit -m "Feature: Add screen sharing"
git push origin main

# Automatic deployment starts on both platforms!
```

---

## ⚠️ Troubleshooting

### Frontend shows blank page
- **Check:** Browser console for errors
- **Solution:** Verify `NEXT_PUBLIC_API_URL` is correct in Vercel env vars
- **Rebuild:** Click Redeploy in Vercel

### 401 Unauthorized errors
- **Check:** Token expiration (7 days)
- **Solution:** Login again or use refresh token
- **Note:** Check axios interceptor in `lib/axios.js`

### WebSocket connection fails
- **Check:** `NEXT_PUBLIC_SOCKET_URL` in env vars
- **Solution:** Make sure it matches backend URL exactly
- **Note:** Socket.IO needs both WS and polling fallback

### Video calls not working
- **Check:** Browser permissions (camera/microphone)
- **Solution:** Check Network tab for ICE candidates
- **Note:** Restart browser if permissions denied initially

### Database connection timeout
- **Check:** MongoDB IP whitelist
- **Solution:** Add Render IP or use 0.0.0.0/0 (development only)
- **Note:** Check connection string in environment variables

### Email verification not working
- **Check:** Firebase email provider enabled
- **Solution:** Go to Firebase Console > Authentication > Sign-in method
- **Note:** Email templates can be customized

---

## 📱 Part 9: Mobile App (Optional Future)

When ready to build mobile apps:

```bash
# For iOS/Android via React Native or Flutter
# Use same backend API endpoints
# Update CORS_ORIGINS to include mobile app domains
```

---

## 🎉 You're Live!

**Frontend:** https://squad-up-frontend.vercel.app
**Backend:** https://squad-up-backend.onrender.com

### Next Steps:
1. ✅ Share with users
2. ✅ Monitor analytics
3. ✅ Gather feedback
4. ✅ Plan new features
5. ✅ Scale infrastructure as needed

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://docs.mongodb.com/atlas
- **Firebase Docs:** https://firebase.google.com/docs
- **Next.js Guide:** https://nextjs.org/docs

---

**Deployment Status:** Ready to go live! 🚀
