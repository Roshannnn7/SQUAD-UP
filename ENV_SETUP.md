# Environment Setup Guide

## Quick Start (3 Steps)

### 1. Add Your IP to MongoDB Atlas

Your MongoDB connection keeps failing because your IP isn't whitelisted.

**Quick Fix (1 minute):**
1. Go to https://cloud.mongodb.com
2. Navigate to Network Access
3. Click "+ ADD IP ADDRESS"
4. Select "Add Current IP Address" 
5. Click Confirm
6. Wait 30 seconds and restart the backend

---

## Backend Environment Variables

Create `Backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://squaduser:vishal2004@squadup.j1hjciv.mongodb.net/?appName=SQUADUP

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production

# Firebase Admin SDK
FIREBASE_PROJECT_ID=squadup-57986
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<PASTE_YOUR_KEY_HERE>\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@squadup-57986.iam.gserviceaccount.com

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# URLs
FRONTEND_URL=http://localhost:3000

# Socket.IO
ALLOWED_ORIGINS=http://localhost:3000
```

---

## Frontend Environment Variables

Create `Frontend/.env.local`:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBFg0DmZOh6O7KEbYNFVUY4h0QpWJcEnLg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=squadup-57986.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=squadup-57986
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=squadup-57986.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=727487377088
NEXT_PUBLIC_FIREBASE_APP_ID=1:727487377088:web:e7aad0741ed4bb434e4725

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your_key>

# App
NEXT_PUBLIC_APP_NAME=SquadUp
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## How to Get Firebase Credentials

### For Backend (Admin SDK):
1. Go to https://console.firebase.google.com
2. Select "squadup-57986" project
3. Click Settings ⚙️ → Service Accounts
4. Click "Generate New Private Key"
5. Copy the key file contents:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY
   - `client_email` → FIREBASE_CLIENT_EMAIL

### For Frontend (Web SDK):
1. Firebase Console → Project Settings ⚙️
2. Under "Your apps", select the Web app
3. Copy the `firebaseConfig` object:
   - `apiKey` → NEXT_PUBLIC_FIREBASE_API_KEY
   - `authDomain` → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - etc.

---

## How to Get Stripe Keys

1. Go to https://dashboard.stripe.com
2. Enable Test Mode (toggle in top right)
3. Go to Developers → API Keys
4. Copy:
   - **Secret Key** → STRIPE_SECRET_KEY
   - **Publishable Key** → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

---

## How to Get MongoDB Connection String

1. Go to https://cloud.mongodb.com
2. Select "SQUADUP" cluster
3. Click "Connect"
4. Select "Drivers"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Paste into `MONGODB_URI`

---

## Running the Application

### Option A: Run Both (Recommended)
```bash
npm run dev
```

### Option B: Run Separately
```bash
# Terminal 1
cd Backend
npm run dev

# Terminal 2
cd Frontend
npm run dev
```

Then visit: **http://localhost:3000**

---

## Verification Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] MongoDB connected (check backend logs)
- [ ] Can load http://localhost:3000
- [ ] Firebase login works
- [ ] Can complete profile onboarding

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot reach database" | Add IP to MongoDB whitelist |
| "Firebase not initialized" | Check NEXT_PUBLIC_FIREBASE_* vars |
| "API 404" | Backend not running or wrong NEXT_PUBLIC_API_URL |
| "Socket timeout" | Check NEXT_PUBLIC_SOCKET_URL points to running backend |

---

## For Production (Vercel + Render)

See `DEPLOYMENT.md` for full instructions on deploying to Vercel (frontend) and Render (backend).

**Key changes:**
- Use Render backend URL instead of localhost:5000
- Use production Firebase/Stripe keys
- Update MongoDB whitelist with Render's IP
- Set `NODE_ENV=production`
