# 🚀 Admin Dashboard - Get Started in 5 Minutes

## Step 1: Create Admin Account (Backend)

Open terminal in the `Backend` folder and run:

```bash
npm run create-admin
```

You should see output like:
```
✅ Admin created successfully!

Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    admin@squadup.com
Password: Admin@123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use these credentials to login to the admin dashboard.
```

**Save these credentials somewhere safe!**

---

## Step 2: Start Backend Server

Make sure backend is running:

```bash
cd Backend
npm run dev
# or
node server.js
```

You should see:
```
✅ Server running on http://localhost:5000
✅ MongoDB connected
```

---

## Step 3: Start Frontend Server

In a new terminal, in the `Frontend` folder:

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.10
  - Local: http://localhost:3000
  - Ready in X.Xs
```

---

## Step 4: Login to Admin Dashboard

1. Open browser: `http://localhost:3000`
2. Click **Login** button
3. Enter credentials:
   - **Email:** `admin@squadup.com`
   - **Password:** `Admin@123456`
4. Click **Login**

---

## Step 5: View Admin Dashboard

After login, you'll be taken to:
```
http://localhost:3000/dashboard/admin
```

You should see:
- ✅ Admin Dashboard header with your name
- ✅ Statistics cards showing user counts
- ✅ Table with all registered users
- ✅ Search and filter options
- ✅ Export CSV button

---

## 🎉 Done! You Now Have:

✅ **Statistics Dashboard** - See total users, students, mentors
✅ **User List** - View all registered users with details
✅ **Search** - Find users by name or email
✅ **Filter** - Filter by user role
✅ **Export** - Download user data as CSV
✅ **Pagination** - Browse through user list

---

## 📊 What You Can Do

### View Statistics
- Total users registered
- Breakdown by student/mentor
- Users joined this month

### Search Users
- Type any name in search box
- Find by email address
- Results update instantly

### Filter by Role
- All Roles (default)
- Students only
- Mentors only
- Admins only

### Download Data
- Click **Export CSV** button
- Saves as `users-YYYY-MM-DD.csv`
- Use in Excel or Google Sheets

### View User Details
- Name with avatar
- Email address
- Role (Student/Mentor/Admin)
- Profile completion status
- Join date

---

## ❌ If Something Goes Wrong

### Login fails
```bash
# Make sure backend is running
# Check: http://localhost:5000/api/health (if endpoint exists)

# Recreate admin
npm run create-admin
```

### Dashboard shows no users
```bash
# Check backend console for errors
# Check browser console (F12 → Console)
# Verify MongoDB is connected
# Restart both servers
```

### Search/filter not working
- Refresh page (Ctrl+R)
- Check browser console for errors
- Restart frontend server

### CSS/styling looks broken
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Rebuild frontend:
  ```bash
  rm -r .next
  npm run dev
  ```

---

## 🔐 Security Reminder

⚠️ **Important:**
- Change default password after first login (if you implement password change feature)
- Don't share admin credentials publicly
- Only give admin access to trusted people
- All admin actions are logged (implement logging if needed)

---

## 📱 Mobile Access

The admin dashboard is **fully responsive** and works on:
- ✅ Desktop (full featured)
- ✅ Tablet (optimized layout)
- ✅ Mobile (condensed view)

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "Admin access required" error | Make sure role is set to 'admin' in database |
| Users list is empty | Backend might not be returning users, check console |
| Search not working | Refresh page, check browser console |
| CSV export broken | Check file permissions, try different browser |
| Stats showing 0 | Might need actual users in database |
| Page loading forever | Verify backend is running on port 5000 |

---

## ✨ Features Coming Soon

These features are ready on backend but not yet in dashboard UI:
- 🔄 User status toggle (activate/deactivate)
- ✅ Mentor verification approval
- 📊 Revenue analytics
- 📈 Growth charts
- 🔔 Notification system
- 📝 Activity logs

---

**Enjoy your admin dashboard! 🎉**

For full documentation, see: `ADMIN_DASHBOARD_GUIDE.md`
