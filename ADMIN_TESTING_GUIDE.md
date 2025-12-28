# 🧪 ADMIN DASHBOARD - TESTING GUIDE

## ✅ SERVERS STATUS

### Backend ✅ RUNNING
- **URL:** http://localhost:5000
- **Status:** Server running on port 5000
- **Database:** Atlas MongoDB Connected

### Frontend ✅ RUNNING  
- **URL:** http://localhost:3000
- **Status:** Ready (Next.js 14.2.10)

---

## 🧪 TESTING STEPS

### Step 1: Create Admin Account

**Run in Backend folder:**
```bash
npm run create-admin
```

**Expected Output:**
```
✅ Admin created successfully!

Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    admin@squadup.com
Password: Admin@123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Save these credentials!**

---

### Step 2: Navigate to Login Page

**Open browser:**
```
http://localhost:3000/auth/login
```

**Expected:** Login page loads with email/password form

---

### Step 3: Login with Admin Credentials

**Enter:**
- Email: `admin@squadup.com`
- Password: `Admin@123456`

**Click:** Login button

**Expected:** Redirected to `/dashboard/admin`

---

### Step 4: Verify Dashboard Loads

**Check for:**
- ✅ "Admin Dashboard" header with admin name
- ✅ "Logout" button in top right
- ✅ Four statistics cards visible
- ✅ User list table visible
- ✅ No console errors (F12 → Console)

---

## 📊 TEST 1: STATISTICS CARDS

### What to Check:
1. **Total Users Card**
   - Shows a number (e.g., 150)
   - Has Users icon
   - Blue background

2. **Students Card**
   - Shows student count
   - Has User icon
   - Green background

3. **Mentors Card**
   - Shows mentor count  
   - Has UserCheck icon
   - Purple background

4. **This Month Card**
   - Shows this month's signups
   - Has TrendingUp icon
   - Orange background

### Expected Result:
All 4 cards display with correct numbers and styling ✅

---

## 👥 TEST 2: USER LIST TABLE

### What to Check:
1. **Table Headers**
   - Name | Email | Role | Profile Status | Joined

2. **User Rows**
   - User name with avatar
   - User email
   - Role badge (Student/Mentor/Admin)
   - Status (Complete/Incomplete)
   - Join date

3. **Avatar Display**
   - Profile photos show
   - Fallback avatars if no photo
   - Circular image with border

### Expected Result:
Table displays users with all columns populated ✅

---

## 🔍 TEST 3: SEARCH FUNCTIONALITY

### Test Case 1: Search by Name
1. **Type:** Any user's name in search box
2. **Expected:** Table filters in real-time
3. **Result:** Only users with that name shown

### Test Case 2: Search by Email
1. **Type:** Part of an email (e.g., "john")
2. **Expected:** Instant filtering
3. **Result:** Users matching email shown

### Test Case 3: Clear Search
1. **Clear:** Delete search text
2. **Expected:** All users reappear
3. **Result:** Full user list restored

### Expected Result:
Search works instantly with real-time filtering ✅

---

## 🎯 TEST 4: ROLE FILTER

### Test Case 1: Filter by Students
1. **Click:** Role filter dropdown
2. **Select:** "Students"
3. **Expected:** Table shows only students
4. **Result:** All shown users have role="student"

### Test Case 2: Filter by Mentors
1. **Click:** Role filter dropdown
2. **Select:** "Mentors"
3. **Expected:** Table shows only mentors
4. **Result:** All shown users have role="mentor"

### Test Case 3: Filter by Admins
1. **Click:** Role filter dropdown
2. **Select:** "Admins"
3. **Expected:** Table shows only admins
4. **Result:** All shown users have role="admin"

### Test Case 4: Reset Filter
1. **Click:** Role filter dropdown
2. **Select:** "All Roles"
3. **Expected:** All users appear again
4. **Result:** No filtering applied

### Expected Result:
Role filter works instantly, correctly showing/hiding users ✅

---

## 📥 TEST 5: CSV EXPORT

### Steps:
1. **Click:** "Export CSV" button (top right)
2. **Wait:** 1-2 seconds
3. **Check:** Browser downloads file
4. **File name:** `users-YYYY-MM-DD.csv`

### Verify Downloaded File:
1. **Open:** In Excel or Google Sheets
2. **Check headers:** ID, Name, Email, Role, Created At, Profile Status
3. **Check data:** User information matches dashboard

### Expected Result:
CSV file downloads with all current users ✅

---

## 📖 TEST 6: PAGINATION

### Setup:
First, you need 10+ users in database. If not enough:
1. Register test users at `/auth/register`
2. Create as both students and mentors

### Test Steps:
1. **Check:** "Page X of Y" indicator at bottom
2. **If only 1 page:** Create more test users
3. **If 2+ pages:** Continue testing

### Test Case: Next Page
1. **Click:** "Next" button
2. **Expected:** New page loads
3. **Result:** Different users shown
4. **URL:** Page number increases

### Test Case: Previous Page
1. **Click:** "Previous" button  
2. **Expected:** Go back to page 1
3. **Result:** Original users shown

### Test Case: Button States
1. **On page 1:** "Previous" button disabled
2. **On last page:** "Next" button disabled

### Expected Result:
Pagination works correctly, loading different users ✅

---

## 📱 TEST 7: RESPONSIVE DESIGN

### Desktop (1920px)
1. **Open:** Developer tools (F12)
2. **Toggle device toolbar:** OFF
3. **Maximize:** Browser window
4. **Check:**
   - All 4 stats cards in one row
   - Full-width table
   - All columns visible
   - No horizontal scrolling

**Expected:** Clean, spacious layout ✅

### Tablet (768px)
1. **Toggle device toolbar:** ON
2. **Select:** iPad (768px)
3. **Orientation:** Portrait
4. **Check:**
   - 2 stats cards per row
   - Table still readable
   - Columns wrap if needed

**Expected:** Adjusted layout, still usable ✅

### Mobile (375px)
1. **Toggle device toolbar:** ON
2. **Select:** iPhone SE (375px)
3. **Orientation:** Portrait
4. **Check:**
   - 1 stat card per row
   - Table scrolls horizontally
   - Controls stack vertically
   - Touch-friendly buttons

**Expected:** Responsive, mobile-friendly ✅

---

## 🌙 TEST 8: DARK MODE

### Steps:
1. **Look at:** Navbar (top)
2. **Find:** Theme toggle button
3. **Click:** To switch theme

### Light Mode Check:
- Background: White/Light gray
- Text: Dark
- Cards: Light with shadow

### Dark Mode Check:
- Background: Dark gray/Black
- Text: White/Light
- Cards: Dark with borders

### Expected Result:
Smooth theme switch, all colors readable in both modes ✅

---

## 🔐 TEST 9: SECURITY - ADMIN ONLY ACCESS

### Test Case 1: Non-Admin Access
1. **Create:** Test student account at `/auth/register`
2. **Login:** As student
3. **Navigate:** To `/dashboard/admin`
4. **Expected:** Redirected to `/dashboard/student`
5. **Message:** "Admin access required" toast

### Test Case 2: Admin Access
1. **Login:** With admin@squadup.com
2. **Navigate:** To `/dashboard/admin`
3. **Expected:** Dashboard loads normally
4. **No redirect:** Stay on admin page

### Expected Result:
Only admins can access dashboard, non-admins redirected ✅

---

## 🚪 TEST 10: LOGOUT

### Steps:
1. **Click:** "Logout" button (top right)
2. **Expected:** Redirected to login page
3. **Check:** localStorage cleared (F12 → Application)

### Expected Result:
Logout clears session and redirects properly ✅

---

## ⚠️ TEST 11: ERROR HANDLING

### Test Case 1: Network Error
1. **Disconnect:** Internet (simulate)
2. **Try:** Refresh dashboard
3. **Expected:** Error toast message
4. **Message:** "Failed to load admin data"

### Test Case 2: Empty Data
1. **Database:** No users exist
2. **Dashboard:** Should show statistics
3. **Table:** Shows "No users found"

### Test Case 3: Invalid Role Filter
1. **Manually edit:** URL role parameter
2. **Expected:** Graceful fallback to "All Roles"

### Expected Result:
Errors handled gracefully with helpful messages ✅

---

## 🎨 TEST 12: VISUAL ELEMENTS

### Check:
- ✅ Icons display correctly
- ✅ Colors are consistent
- ✅ Fonts are readable
- ✅ Buttons are clickable
- ✅ Hover effects work
- ✅ Animations are smooth
- ✅ No broken images
- ✅ No console warnings

### Expected Result:
Professional, polished UI with no visual issues ✅

---

## 🔧 TEST 13: BROWSER CONSOLE

### Steps:
1. **Open:** F12 (Developer Tools)
2. **Go to:** Console tab
3. **Check:** No red error messages
4. **Expected:** Only info/log messages

### Acceptable Messages:
- "Deprecated getStorage" warnings (can ignore)
- "Firebase Config Loaded" (expected)
- API logs (expected)

### Not Acceptable:
- ❌ Uncaught errors
- ❌ Missing component errors
- ❌ API 500 errors
- ❌ Network failures

### Expected Result:
No critical errors in console ✅

---

## 📊 TEST 14: NETWORK REQUESTS

### Steps:
1. **Open:** F12 → Network tab
2. **Refresh:** Dashboard
3. **Check:** API calls

### Expected Requests:
1. `GET /api/admin/stats` → 200 OK
2. `GET /api/admin/users?page=1&limit=10` → 200 OK

### Response Format:
```javascript
Stats Response:
{
  "users": {
    "total": X,
    "students": Y,
    "mentors": Z,
    "monthlyGrowth": W
  }
}

Users Response:
{
  "users": [{ user objects }],
  "totalPages": X,
  "total": Y
}
```

### Expected Result:
All API calls successful with correct responses ✅

---

## 🎯 FINAL CHECKLIST

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Admin account created
- [ ] Can login successfully
- [ ] Dashboard loads without errors
- [ ] All 4 stats cards display
- [ ] User list shows users
- [ ] Search works (real-time)
- [ ] Role filter works
- [ ] Pagination works (if 10+ users)
- [ ] CSV export downloads
- [ ] Mobile view responsive
- [ ] Dark mode works
- [ ] Logout works
- [ ] No console errors
- [ ] API requests successful

---

## ✅ TEST RESULT

If all above tests pass: **✅ ADMIN DASHBOARD IS FULLY FUNCTIONAL**

If any test fails: Check **ADMIN_TROUBLESHOOTING.md** for solutions

---

## 📝 TEST NOTES

### Add Test Users (Optional)
To test with more data:
1. Go to `/auth/register`
2. Create 5-10 test accounts
3. Mix of students and mentors
4. Refresh admin dashboard
5. Test search/filter/pagination with multiple users

### Performance Testing
1. Time how long dashboard takes to load
2. Should be 2-3 seconds
3. Search should be instant (0ms)
4. Export CSV should be < 1 second

### Accessibility Testing
1. Tab through form (keyboard navigation)
2. Check focus indicators
3. Text contrast sufficient
4. Icons have labels

---

## 🎊 NEXT STEPS

If all tests pass:
1. ✅ Dashboard is working
2. ✅ Ready to customize (if needed)
3. ✅ Ready to deploy (if needed)
4. ✅ Ready to show users (if needed)

---

**Test Date:** December 27, 2025
**Status:** Ready for Testing
**Duration:** 20-30 minutes to complete all tests

Good luck! 🚀
