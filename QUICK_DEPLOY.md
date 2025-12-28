# Quick Deployment Setup

Follow these steps in order:

## Step 1: Prepare Your Code (5 minutes)

### 1.1 Clean up .env files
```bash
# Make sure .env files are in .gitignore (don't commit secrets!)
echo "Backend/.env" >> .gitignore
echo "Frontend/.env.local" >> .gitignore
git add .gitignore
git commit -m "Update gitignore"
```

### 1.2 Update package.json scripts

**Backend/package.json:**
```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js",
  "build": "npm install"
}
```

**Frontend/package.json:**
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

---

## Step 2: Gather Required Information (5 minutes)

Create a file `DEPLOYMENT_INFO.txt` with:

```
GITHUB INFO:
- GitHub Username: _____
- Repository URL: https://github.com/YOUR_USERNAME/squad-up

MONGODB ATLAS:
- Connection String: mongodb+srv://username:password@cluster.mongodb.net/squad-up?retryWrites=true&w=majority
- Database Name: squad-up

FIREBASE PROJECT:
- Project ID: squadup-57986
- Project Name: SquadUp - Collaborative Learning
- Private Key: (from Service Accounts)
- Client Email: (from Service Accounts)

STRIPE (if using):
- Public Key: pk_test_...
- Secret Key: sk_test_...

RENDER.COM:
- Account Email: your@email.com

VERCEL.COM:
- Account Email: your@email.com
```

---

## Step 3: Push Code to GitHub (5 minutes)

```bash
# In project root directory
cd "c:\Users\roshan rathod\OneDrive\Desktop\SQUAD UP"

# Initialize git if not done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: SquadUp Platform"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/squad-up.git

# Push to main branch
git branch -M main
git push -u origin main
```

**After this, your code is on GitHub!**

---

## Step 4: Deploy Backend to Render (10 minutes)

1. **Create Account:** https://render.com (Sign up with GitHub)
2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Select your squad-up repository
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm run start` (or `node server.js`)

3. **Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-random-secret-key-here-minimum-32-characters
   FIREBASE_PROJECT_ID=squadup-57986
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@squadup-57986.iam.gserviceaccount.com
   CORS_ORIGINS=https://squad-up-frontend.vercel.app,http://localhost:3000
   NODE_ENV=production
   PORT=5000
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for green checkmark
   - Copy backend URL: `https://squad-up-backend.onrender.com`

---

## Step 5: Deploy Frontend to Vercel (10 minutes)

1. **Create Account:** https://vercel.com (Sign up with GitHub)
2. **Import Project:**
   - Click "Import Project"
   - Select your squad-up repository
   - Framework: Next.js (auto-detected)

3. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://squad-up-backend.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://squad-up-backend.onrender.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=squadup-57986
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=squadup-57986.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://squadup-57986-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=squadup-57986.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Copy frontend URL: `https://squad-up-frontend.vercel.app`

---

## Step 6: Update MongoDB IP Whitelist (5 minutes)

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Select your cluster
3. Security → Network Access
4. Add IP Address: **0.0.0.0/0** (for development)
   - For production: Add only Render's IP range

---

## Step 7: Test Deployment (10 minutes)

### 7.1 Test Backend
```bash
curl https://squad-up-backend.onrender.com/api/health
# Should show success
```

### 7.2 Test Frontend
- Open: https://squad-up-frontend.vercel.app
- Should load login page
- No errors in console (F12)

### 7.3 Test Authentication
1. Register new account
2. Complete profile
3. Login with account
4. Navigate to dashboard

### 7.4 Test Real-Time Features
1. Open squad chat
2. Type message (should appear instantly)
3. Create booking
4. Try video call

---

## Step 8: Custom Domain (Optional)

### Add Domain to Vercel
1. Vercel Dashboard → Settings → Domains
2. Enter domain: `app.yourcompany.com`
3. Add CNAME record to DNS:
   ```
   Name: app
   Value: cname.vercel.com
   ```

### Add Domain to Render
1. Render Dashboard → Settings → Custom Domain
2. Enter domain: `api.yourcompany.com`
3. Add CNAME record to DNS:
   ```
   Name: api
   Value: onrender.com
   ```

---

## ✅ Deployment Checklist

- [ ] GitHub account created
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas connection string ready
- [ ] Firebase credentials exported
- [ ] Render.com account created
- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] Vercel.com account created
- [ ] Frontend environment variables added
- [ ] Frontend deployed to Vercel
- [ ] Backend CORS updated with frontend URL
- [ ] MongoDB IP whitelist updated
- [ ] Login test passed
- [ ] Real-time features tested
- [ ] Custom domain configured (optional)

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend blank page | Check NEXT_PUBLIC_API_URL in env vars |
| 401 errors | Verify JWT_SECRET is set in backend |
| WebSocket fails | Check NEXT_PUBLIC_SOCKET_URL matches backend |
| Database connection timeout | Add Render IP to MongoDB whitelist |
| Video calls not working | Check browser console for errors |
| Can't login | Check Firebase configuration |

---

## 📞 Need Help?

- **Vercel Support:** vercel.com/support
- **Render Support:** render.com/docs
- **Firebase Docs:** firebase.google.com/docs
- **MongoDB Atlas:** docs.mongodb.com/atlas

**You're all set! Your app is now live! 🎉**
