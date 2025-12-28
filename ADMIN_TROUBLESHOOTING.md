# 🔧 Admin Dashboard - Troubleshooting Guide

## Common Issues & Solutions

---

## 1. Login Issues

### Problem: "Invalid credentials" when trying to login

**Solution:**
1. Make sure you created the admin account:
   ```bash
   cd Backend
   npm run create-admin
   ```

2. Check the exact email/password output by the script

3. Verify MongoDB is connected:
   - Open Backend server console
   - Should see: `✅ MongoDB connected`

4. Clear browser cookies:
   - F12 → Application → Cookies → Delete admin site cookies
   - Try logging in again

5. Check if user exists in database:
   ```javascript
   // In MongoDB compass or via CLI:
   db.users.findOne({ email: "admin@squadup.com" })
   ```

---

## 2. Admin Page Not Loading

### Problem: Blank page or "Admin access required" error

**Causes & Solutions:**

**Cause 1: User role is not 'admin'**
```bash
# Check in MongoDB:
db.users.findOne({ email: "admin@squadup.com" })
# Should show: { role: "admin" }

# If not, recreate admin:
npm run create-admin
```

**Cause 2: Not authenticated**
- Make sure you're logged in (check Navbar)
- If logged out, login again
- Check localStorage for tokens:
  ```javascript
  // F12 → Console:
  localStorage.getItem('accessToken')  // Should exist
  localStorage.getItem('refreshToken') // Should exist
  ```

**Cause 3: Backend not running**
- Open new terminal
- Start backend:
  ```bash
  cd Backend
  npm run dev
  ```
- Verify: `http://localhost:5000` loads
- Refresh admin page

**Cause 4: CORS issues**
- Check Backend console for CORS errors
- Verify CORS is enabled in server.js:
  ```javascript
  const cors = require('cors');
  app.use(cors());  // Should be present
  ```

---

## 3. Users List Not Loading

### Problem: "No users found" or table is empty

**Solutions:**

1. **Backend API not returning users:**
   ```bash
   # Test API directly:
   curl http://localhost:5000/api/admin/users \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Should return users array (not empty)
   ```

2. **MongoDB connection issue:**
   - Check Backend console for errors
   - Verify connection string in `.env`:
     ```
     MONGODB_URI=mongodb+srv://user:pass@cluster...
     ```
   - Test connection with MongoDB Compass

3. **Registered users don't exist:**
   - Create test users first:
     - Go to `http://localhost:3000/auth/register`
     - Create a student account
     - Create a mentor account
   - Refresh admin dashboard

4. **Pagination issue:**
   - Try going to page 1
   - Check if limit is too high:
     ```javascript
     // In admin page:
     limit=10  // Should be reasonable
     ```

---

## 4. Search & Filter Not Working

### Problem: Search box or role filter doesn't update results

**Solutions:**

1. **Clear filters:**
   - Clear search box (Ctrl+A → Delete)
   - Reset role filter to "All Roles"
   - Wait for 1-2 seconds for update

2. **Refresh the page:**
   - Ctrl+R (refresh)
   - Or click Navbar → navigate away → back to admin

3. **Check browser console:**
   - F12 → Console tab
   - Look for error messages
   - Note any API errors

4. **Backend search not implemented:**
   - Verify getUsers function in adminController.js has search:
     ```javascript
     if (search) {
         query.$or = [
             { fullName: { $regex: search, $options: 'i' } },
             { email: { $regex: search, $options: 'i' } },
         ];
     }
     ```

---

## 5. Export CSV Not Working

### Problem: "Export CSV" button doesn't download file

**Solutions:**

1. **Enable popup permissions:**
   - Browser may block auto-download
   - Check for notification: "Allow popups?"
   - Allow downloads for localhost

2. **Check browser console:**
   - F12 → Console
   - Look for errors when clicking Export
   - Check for CORS/permission errors

3. **Browser download settings:**
   - Chrome: Settings → Privacy → Downloads
   - Firefox: Options → Files → Downloads location
   - Safari: Preferences → General → Downloads

4. **Manual CSV creation:**
   ```javascript
   // F12 → Console:
   console.table(filteredUsers)  // View data
   ```

---

## 6. Stats Cards Showing Wrong Numbers

### Problem: User count, stats are incorrect or 0

**Solutions:**

1. **No data in database:**
   - Create some test users first
   - Verify in MongoDB:
     ```
     db.users.find().count()  // Should be > 0
     ```

2. **API not returning stats:**
   ```bash
   curl http://localhost:5000/api/admin/stats \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Should return numbers, not 0
   ```

3. **Aggregation pipeline error:**
   - Check Backend console for MongoDB errors
   - Verify collections exist:
     ```
     db.users.find().limit(1)
     db.bookings.find().limit(1)
     db.projects.find().limit(1)
     ```

4. **Refresh data:**
   - Click page reload
   - Stats should update

---

## 7. Pagination Not Working

### Problem: Previous/Next buttons disabled or not changing page

**Solutions:**

1. **Check total page count:**
   - If `totalPages = 1`, only 1 page exists
   - Add more test users to see pagination

2. **Verify API response:**
   ```bash
   curl "http://localhost:5000/api/admin/users?page=2&limit=10" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **State not updating:**
   - Check browser console for errors
   - Try manual page change: URL edit test

4. **Backend limit issue:**
   - Verify adminController.js getUsers has pagination:
     ```javascript
     const skip = (parseInt(page) - 1) * parseInt(limit);
     const users = await User.find(query)
         .skip(skip)
         .limit(parseInt(limit));
     ```

---

## 8. Styling/Layout Broken

### Problem: Colors wrong, layout broken, text misaligned

**Solutions:**

1. **Hard refresh (clear cache):**
   - Windows: Ctrl + Shift + R
   - Mac: Cmd + Shift + R
   - Or: F12 → Network → Disable cache → Refresh

2. **Rebuild frontend:**
   ```bash
   cd Frontend
   rm -rf .next
   npm run dev
   ```

3. **Tailwind CSS not loaded:**
   - Check if TailwindCSS installed:
     ```bash
     npm list tailwindcss
     ```
   - Reinstall if needed:
     ```bash
     npm install tailwindcss@latest
     npm run dev
     ```

4. **Dark mode issue:**
   - Check theme-provider in layout.jsx
   - Toggle light/dark mode in navbar
   - Check localStorage theme setting

---

## 9. Profile Photos Not Loading

### Problem: User avatars show broken image icon

**Solutions:**

1. **Firebase Storage issue:**
   - User uploaded photo path incorrect
   - Using fallback avatar is fine:
     ```javascript
     src={u.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`}
     ```

2. **Access denied:**
   - Check Firebase Storage rules
   - Ensure public read access:
     ```
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /{allPaths=**} {
           allow read: if true;
           allow write: if request.auth != null;
         }
       }
     }
     ```

---

## 10. Performance Issues

### Problem: Dashboard slow to load, freezes

**Solutions:**

1. **Too many users:**
   - Limit is 10 per page (good)
   - Use search/filter to narrow results
   - Don't load all users at once

2. **Large file uploads in CSV:**
   - Limit CSV to current page (10 users)
   - For large data, export monthly

3. **MongoDB query slow:**
   - Check indexes in MongoDB:
     ```
     db.users.getIndexes()
     ```
   - Add index if missing:
     ```
     db.users.createIndex({ email: 1 })
     db.users.createIndex({ role: 1 })
     ```

4. **Network slow:**
   - Check F12 → Network tab
   - Look at API response time
   - Verify internet connection

---

## 11. Admin Creates But Not Showing in Dashboard

### Problem: Just created admin, but doesn't appear in user list

**Solutions:**

1. **Page not refreshed:**
   - Click Previous/Next to trigger reload
   - Or manually refresh page

2. **Filters hiding new user:**
   - Reset role filter to "All Roles"
   - Clear search box
   - Sort by newest first (done by default)

3. **Pagination on wrong page:**
   - Go to Page 1
   - New user should be at top (newest first)

4. **Database not updated:**
   - Check MongoDB directly:
     ```
     db.users.findOne({ email: "admin@squadup.com" })
     ```

---

## 12. Token Expired Issues

### Problem: "Unauthorized" error or auto-logged out

**Solutions:**

1. **Token refresh not working:**
   - Check Backend /api/auth/refresh endpoint exists
   - Verify refresh token in localStorage:
     ```javascript
     localStorage.getItem('refreshToken')
     ```

2. **Re-login:**
   - Click Logout
   - Login again
   - Admin dashboard should load

3. **Check token expiration:**
   ```javascript
   // F12 → Console:
   const token = localStorage.getItem('accessToken');
   const decoded = JSON.parse(atob(token.split('.')[1]));
   console.log(new Date(decoded.exp * 1000));
   ```

---

## 13. API Response Format Issues

### Problem: Wrong data structure in dashboard

**Solution:**
- Admin dashboard is built to handle both API formats
- If stats are shown as "0" or "undefined", check:
  ```bash
  # Terminal test:
  curl http://localhost:5000/api/admin/stats \
    -H "Authorization: Bearer YOUR_TOKEN" | json_pp
  ```

---

## Quick Diagnostic Checklist

✅ Backend running on port 5000?
✅ Frontend running on port 3000?
✅ MongoDB connected?
✅ Admin account created with `npm run create-admin`?
✅ Can login with admin credentials?
✅ See "Admin Dashboard" header?
✅ See statistics cards?
✅ See user list table?
✅ Can search/filter users?
✅ Can export CSV?

If all ✅, admin dashboard is working!

---

## Still Having Issues?

1. **Check logs:**
   ```bash
   # Backend console for API errors
   # Browser F12 → Console for frontend errors
   # Browser F12 → Network for API call status
   ```

2. **Restart everything:**
   ```bash
   # Terminal 1: Backend
   cd Backend && npm run dev

   # Terminal 2: Frontend
   cd Frontend && npm run dev
   ```

3. **Check environment variables:**
   - `Backend/.env` - MongoDB URI, ports
   - `Frontend/.env.local` - API base URL

4. **Test API directly:**
   ```bash
   # Get stats
   curl http://localhost:5000/api/admin/stats \
     -H "Authorization: Bearer TOKEN"

   # Get users
   curl http://localhost:5000/api/admin/users \
     -H "Authorization: Bearer TOKEN"
   ```

5. **Reset everything:**
   ```bash
   # Clear all data
   npm run create-admin  # Recreate admin
   # Delete test users from MongoDB manually
   ```

---

## Need More Help?

- Check Backend console for error messages
- Check Browser console (F12 → Console tab)
- Check Network tab for failed requests
- Review API response in Network tab
- Compare with MongoDB data

**Remember:** Most issues are:
- Backend not running
- MongoDB not connected
- Auth token expired
- User role not set to 'admin'

Check those first! 🚀
