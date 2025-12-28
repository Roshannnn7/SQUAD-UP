# Environment Variables - Complete Reference

## 🔐 Backend Environment Variables (.env)

### Production (Render)
```env
# ========== DATABASE ==========
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/squad-up?retryWrites=true&w=majority

# ========== JWT/SECURITY ==========
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-change-this

# ========== FIREBASE ==========
FIREBASE_PROJECT_ID=squadup-57986
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@squadup-57986.iam.gserviceaccount.com

# ========== CORS ==========
CORS_ORIGINS=https://squad-up-frontend.vercel.app,http://localhost:3000

# ========== SERVER CONFIG ==========
NODE_ENV=production
PORT=5000
```

### Development (Local)
```env
# ========== DATABASE ==========
MONGODB_URI=mongodb://localhost:27017/squad-up
# OR
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/squad-up?retryWrites=true&w=majority

# ========== JWT/SECURITY ==========
JWT_SECRET=dev-secret-key-change-in-production

# ========== FIREBASE ==========
FIREBASE_PROJECT_ID=squadup-57986
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@squadup-57986.iam.gserviceaccount.com

# ========== CORS ==========
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ========== SERVER CONFIG ==========
NODE_ENV=development
PORT=5000
```

---

## 🎨 Frontend Environment Variables (.env.local)

### Production (Vercel)
```env
# ========== API CONFIGURATION ==========
NEXT_PUBLIC_API_URL=https://squad-up-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://squad-up-backend.onrender.com

# ========== FIREBASE CONFIGURATION ==========
NEXT_PUBLIC_FIREBASE_PROJECT_ID=squadup-57986
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=squadup-57986.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://squadup-57986-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=squadup-57986.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd1234efgh5678

# ========== STRIPE CONFIGURATION (Optional) ==========
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51234567890...

# ========== ENVIRONMENT ==========
NODE_ENV=production
```

### Development (Local)
```env
# ========== API CONFIGURATION ==========
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# ========== FIREBASE CONFIGURATION ==========
NEXT_PUBLIC_FIREBASE_PROJECT_ID=squadup-57986
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=squadup-57986.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://squadup-57986-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=squadup-57986.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd1234efgh5678

# ========== STRIPE CONFIGURATION (Optional) ==========
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51234567890...

# ========== ENVIRONMENT ==========
NODE_ENV=development
```

---

## 📋 How to Get Each Variable

### MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click on "Clusters"
3. Click "Connect" button
4. Choose "Drivers" tab
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `myFirstDatabase` with `squad-up`

**Example:**
```
mongodb+srv://squadup_admin:myPassword123@cluster0.j1hjciv.mongodb.net/squad-up?retryWrites=true&w=majority
```

---

### JWT Secret

Generate a random 32+ character string:

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

### Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "squadup-57986" project
3. Click "⚙️ Settings" (gear icon) → "Project Settings"
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Copy the JSON file content

**Extract from JSON:**

```json
{
  "type": "service_account",
  "project_id": "squadup-57986",           ← FIREBASE_PROJECT_ID
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  ← FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xxxxx@squadup-57986.iam.gserviceaccount.com",  ← FIREBASE_CLIENT_EMAIL
  ...
}
```

**Important:** When adding to .env, ensure `\n` characters are preserved:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

---

### Firebase Public Configuration

For frontend, you need the **Web SDK config**:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "squadup-57986" project
3. Click "⚙️ Settings" → "Project Settings"
4. Scroll down to "Your apps"
5. Find or create "Web" app
6. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",                    ← NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "squadup-57986.firebaseapp.com",  ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  databaseURL: "https://squadup-57986-default-rtdb.firebaseio.com",  ← NEXT_PUBLIC_FIREBASE_DATABASE_URL
  projectId: "squadup-57986",              ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "squadup-57986.appspot.com",  ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",          ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abcd1234efgh5678"   ← NEXT_PUBLIC_FIREBASE_APP_ID
};
```

---

### Stripe Keys (If Using Payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to "Developers" → "API Keys"
3. Copy **Publishable Key** (public, safe to expose)
4. Copy **Secret Key** (keep private, backend only)

**Frontend (.env.local):**
```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz
```

**Backend (.env):**
```env
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz
```

---

## 🔐 Security Best Practices

### ✅ DO:
- [ ] Keep secrets in .env files
- [ ] Never commit .env to git
- [ ] Use different secrets for dev/prod
- [ ] Rotate secrets regularly
- [ ] Use strong random strings for JWT
- [ ] Prefix frontend vars with `NEXT_PUBLIC_`
- [ ] Keep backend secrets private

### ❌ DON'T:
- [ ] Hardcode secrets in code
- [ ] Share .env files
- [ ] Commit secrets to git
- [ ] Use weak passwords
- [ ] Expose private keys in frontend
- [ ] Use same secret for dev and prod
- [ ] Share private keys via email/chat

---

## 📝 Variable Validation Checklist

Before deploying, verify:

### Backend Variables
```
MONGODB_URI:
  ✅ Starts with "mongodb+srv://" or "mongodb://"
  ✅ Contains username:password
  ✅ Contains database name (squad-up)

JWT_SECRET:
  ✅ At least 32 characters long
  ✅ Unique and random
  ✅ Not a common word

FIREBASE_PROJECT_ID:
  ✅ Equals "squadup-57986"

FIREBASE_PRIVATE_KEY:
  ✅ Starts with "-----BEGIN PRIVATE KEY-----"
  ✅ Ends with "-----END PRIVATE KEY-----\n"
  ✅ Contains \n escapes for newlines

FIREBASE_CLIENT_EMAIL:
  ✅ Contains "firebase-adminsdk"
  ✅ Contains "squadup-57986.iam.gserviceaccount.com"

CORS_ORIGINS:
  ✅ Contains your frontend URL
  ✅ Comma-separated if multiple
  ✅ HTTPS (not HTTP) for production

NODE_ENV:
  ✅ Set to "production" on Render
  ✅ Set to "development" locally

PORT:
  ✅ Set to 5000 (or leave for Render to assign)
```

### Frontend Variables
```
NEXT_PUBLIC_API_URL:
  ✅ Points to backend service
  ✅ Ends with "/api"
  ✅ Uses HTTPS (not HTTP) for production

NEXT_PUBLIC_SOCKET_URL:
  ✅ Points to backend service (without /api)
  ✅ Uses HTTPS for production

NEXT_PUBLIC_FIREBASE_PROJECT_ID:
  ✅ Equals "squadup-57986"

NEXT_PUBLIC_FIREBASE_API_KEY:
  ✅ Starts with "AIzaSy"

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
  ✅ Contains "squadup-57986.firebaseapp.com"

NEXT_PUBLIC_FIREBASE_APP_ID:
  ✅ Format: "1:XXXXX:web:XXXXX"
```

---

## 🔄 Environment Setup Quick Reference

### Local Development
```bash
# Backend
cd Backend
echo "MONGODB_URI=mongodb://localhost:27017/squad-up" > .env
echo "JWT_SECRET=dev-secret-key" >> .env
# ... add other vars

# Frontend
cd ../Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
# ... add other vars

# Run servers
cd ../Backend && npm run dev
# In another terminal
cd Frontend && npm run dev
```

### Render Deployment
1. Add all variables in Render dashboard
2. Auto-reload on save
3. Service redeploys automatically

### Vercel Deployment
1. Add all variables in Vercel dashboard
2. Redeploy to apply changes
3. Changes take effect in new build

---

## 🆘 Troubleshooting Environment Variables

### "MONGODB_URI is undefined"
**Solution:** Ensure .env file exists and MONGODB_URI is set

### "Firebase initialization failed"
**Solution:** Verify FIREBASE_PRIVATE_KEY has \n escapes

### "Socket connection failed"
**Solution:** Check NEXT_PUBLIC_SOCKET_URL matches backend URL

### "CORS error" on frontend
**Solution:** Verify CORS_ORIGINS includes frontend URL

### "401 Unauthorized" errors
**Solution:** Verify JWT_SECRET is set and identical on all instances

---

## 📚 Complete Sample Files

### Backend/.env (Production)
```env
MONGODB_URI=mongodb+srv://squadup:password123@cluster0.j1hjciv.mongodb.net/squad-up?retryWrites=true&w=majority
JWT_SECRET=aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3
FIREBASE_PROJECT_ID=squadup-57986
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/gzx5...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc12@squadup-57986.iam.gserviceaccount.com
CORS_ORIGINS=https://squad-up-frontend.vercel.app,http://localhost:3000
NODE_ENV=production
PORT=5000
```

### Frontend/.env.local (Production)
```env
NEXT_PUBLIC_API_URL=https://squad-up-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://squad-up-backend.onrender.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=squadup-57986
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxPqxZzZxKxLxMxNxOxPxQxRxSxTxUxVx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=squadup-57986.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://squadup-57986-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=squadup-57986.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51234567890123456789012345678901234567890123
```

---

**All environment variables configured and verified!** ✅
