# SquadUp - Pre-Deployment Checklist

## ✅ Code Quality & Security

### Backend Security
- [ ] No hardcoded secrets in code (all in .env)
- [ ] .env file is in .gitignore
- [ ] Helmet middleware enabled (CORS, XSS, CSRF protection)
- [ ] Rate limiting enabled (100 requests per 15 minutes)
- [ ] JWT secret is strong (minimum 32 characters)
- [ ] CORS only allows specific origins
- [ ] Error messages don't expose sensitive info
- [ ] SQL injection prevention (using Mongoose ORM)

### Frontend Security
- [ ] No API keys in code (use NEXT_PUBLIC_* only)
- [ ] Firebase config doesn't expose secrets
- [ ] .env.local not committed to git
- [ ] No hardcoded URLs (use env vars)
- [ ] Content Security Policy ready
- [ ] XSS protection enabled

---

## ✅ Code Validation

### Backend
- [ ] All routes have error handling
- [ ] Async/await properly used with error handling
- [ ] Database models validated
- [ ] API responses consistent format
- [ ] Status codes correct (201 for create, 200 for success, 400/401/404/500 for errors)

### Frontend
- [ ] No console errors in build
- [ ] All imports resolved
- [ ] Next.js build passes without warnings
- [ ] All env vars referenced use NEXT_PUBLIC_ prefix
- [ ] Loading states implemented
- [ ] Error boundaries implemented
- [ ] Mobile responsive tested

---

## ✅ Environment Configuration

### Backend Environment Variables
```
MONGODB_URI: ✅ Should be MongoDB Atlas URI
JWT_SECRET: ✅ Should be 32+ character random string
FIREBASE_PROJECT_ID: ✅ Should be squadup-57986
FIREBASE_PRIVATE_KEY: ✅ Should include \n escapes
FIREBASE_CLIENT_EMAIL: ✅ Should be firebase service account
CORS_ORIGINS: ✅ Should include Vercel frontend URL
NODE_ENV: ✅ Should be "production" on Render
PORT: ✅ Should be 5000 or leave empty for Render
```

### Frontend Environment Variables
```
NEXT_PUBLIC_API_URL: ✅ Should point to Render backend
NEXT_PUBLIC_SOCKET_URL: ✅ Should point to Render backend
NEXT_PUBLIC_FIREBASE_*: ✅ All Firebase config variables set
NEXT_PUBLIC_STRIPE_PUBLIC_KEY: ✅ Stripe test key if using payments
```

---

## ✅ Database & Services

### MongoDB Atlas
- [ ] Cluster created and running
- [ ] Database "squad-up" exists
- [ ] Collections created (Users, StudentProfiles, MentorProfiles, etc.)
- [ ] IP whitelist configured (0.0.0.0/0 for dev, specific IPs for prod)
- [ ] Connection string tested locally
- [ ] Backups enabled
- [ ] User permissions set correctly

### Firebase
- [ ] Project created (squadup-57986)
- [ ] Firebase Authentication enabled
- [ ] Email/Password provider enabled
- [ ] Google provider enabled
- [ ] GitHub provider enabled
- [ ] Service account created
- [ ] Private key exported and stored securely
- [ ] Web app registered
- [ ] Config copied to code

### Stripe (if using payments)
- [ ] Stripe account created
- [ ] Test keys obtained
- [ ] API keys stored in env vars only
- [ ] Webhooks configured for production

---

## ✅ GitHub Repository

- [ ] Git initialized
- [ ] All files added (git add .)
- [ ] .gitignore properly configured
  ```
  Backend/.env
  Frontend/.env.local
  node_modules/
  .next/
  dist/
  build/
  *.log
  ```
- [ ] Initial commit made
- [ ] Remote added: https://github.com/YOUR_USERNAME/squad-up
- [ ] Code pushed to main branch
- [ ] Repository is public
- [ ] README.md created
- [ ] .gitignore in root directory

---

## ✅ Render.com Setup

- [ ] Account created (with GitHub connection)
- [ ] Repository authorized
- [ ] Web Service created
- [ ] Service name: "squad-up-backend"
- [ ] Environment: Node
- [ ] Region selected (closest to users)
- [ ] Branch: main
- [ ] Build Command: npm install
- [ ] Start Command: npm run start
- [ ] All environment variables added
- [ ] Auto-deploy enabled
- [ ] Service deployed successfully
- [ ] Backend URL copied

---

## ✅ Vercel Setup

- [ ] Account created (with GitHub connection)
- [ ] Repository authorized
- [ ] Project created
- [ ] Framework: Next.js detected
- [ ] Build Command: npm run build
- [ ] All environment variables added
- [ ] Output directory: .next
- [ ] Project deployed successfully
- [ ] Frontend URL copied

---

## ✅ Post-Deployment Configuration

### Update Backend CORS
- [ ] Go to Render > Backend Service > Environment
- [ ] Update CORS_ORIGINS with Vercel frontend URL
- [ ] Save changes (triggers redeploy)

### Update Frontend API URLs (if needed)
- [ ] Frontend env vars point to Render backend
- [ ] Redeploy frontend if URLs changed

### MongoDB IP Whitelist
- [ ] IP whitelist includes Render backend
- [ ] (Optional) Add specific Render IP range instead of 0.0.0.0/0

### Firebase Console
- [ ] Add Vercel domain to authorized domains
- [ ] Verify CORS settings
- [ ] Test authentication flow

---

## ✅ Testing Checklist

### Authentication
- [ ] Can register new account
- [ ] Can login with email/password
- [ ] Can login with Google
- [ ] Can login with GitHub
- [ ] Token persists after refresh
- [ ] Token auto-refreshes after 7 days
- [ ] Logout clears all data
- [ ] Redirect to login if unauthorized

### User Profiles
- [ ] Can complete student profile
- [ ] Can complete mentor profile
- [ ] Can view own profile
- [ ] Can update profile
- [ ] Profile photo uploads correctly
- [ ] Skills/interests save correctly

### Dashboard
- [ ] Student dashboard loads
- [ ] Mentor dashboard loads
- [ ] Can navigate between pages
- [ ] Data loads correctly

### Real-Time Features
- [ ] Socket.IO connects successfully
- [ ] Messages send in real-time
- [ ] Typing indicators work
- [ ] Online/offline status updates
- [ ] Notifications received instantly

### Video Calls
- [ ] Can initiate call
- [ ] Can receive call
- [ ] Can accept/reject call
- [ ] Video streams work
- [ ] Audio works
- [ ] Can mute/unmute
- [ ] Can turn camera on/off
- [ ] Screen sharing works
- [ ] Call recording works
- [ ] In-call chat works
- [ ] Can end call

### Database
- [ ] Data persists after refresh
- [ ] Messages saved in database
- [ ] User profiles saved
- [ ] Bookings created correctly

### Performance
- [ ] Page load time < 3 seconds
- [ ] No network errors
- [ ] No memory leaks
- [ ] Responsive on mobile
- [ ] Video quality acceptable

---

## ✅ Production Monitoring

### Render Logs
- [ ] Check backend logs for errors
- [ ] Monitor for 5xx errors
- [ ] Monitor database connection issues
- [ ] Monitor JWT validation errors

### Vercel Analytics
- [ ] Track page load times
- [ ] Monitor build success rate
- [ ] Check deployment history
- [ ] Monitor error rates

### MongoDB Atlas
- [ ] Monitor connection count
- [ ] Check query performance
- [ ] Verify storage usage
- [ ] Monitor error logs

### Firebase Console
- [ ] Monitor authentication success rate
- [ ] Check API quota usage
- [ ] Review security rules

---

## ✅ Security Hardening (Optional)

- [ ] Enable 2FA on all accounts
- [ ] Set up email alerts for deployments
- [ ] Enable MongoDB Atlas backup
- [ ] Set up API rate limiting
- [ ] Enable request logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable database auditing
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable DDoS protection
- [ ] Regular security audits

---

## ✅ Custom Domain (Optional)

### Domain Registration
- [ ] Domain purchased from registrar
- [ ] Domain DNS management unlocked

### Vercel Domain
- [ ] Domain added to Vercel project
- [ ] CNAME record added to DNS
- [ ] SSL certificate issued
- [ ] Domain accessible via HTTPS

### Render Domain (Backend)
- [ ] Domain added to Render service
- [ ] CNAME record added to DNS
- [ ] SSL certificate issued
- [ ] API accessible via custom domain

---

## 📋 Final Verification

**Before Going Live:**

```bash
# 1. Test Backend API
curl https://squad-up-backend.onrender.com/api/health

# 2. Test Frontend
Open https://squad-up-frontend.vercel.app in browser

# 3. Complete end-to-end flow
- Register account
- Complete profile
- Login
- Navigate dashboard
- Test video call
- Test messages
```

**All tests passing?** ✅ You're ready to announce!

---

## 🎉 Launch Checklist

- [ ] Testing complete and passing
- [ ] All features working in production
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Monitoring set up
- [ ] Support plan ready
- [ ] Documentation complete
- [ ] Team trained on system
- [ ] Ready for users! 🚀

---

**Deployment Date:** _______
**Deployed By:** _______
**Status:** ✅ LIVE

---

For any issues, refer to:
- DEPLOYMENT_GUIDE.md
- QUICK_DEPLOY.md
- FEATURES.md
