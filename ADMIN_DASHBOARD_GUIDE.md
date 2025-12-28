# Admin Dashboard Setup & Usage Guide

## 🎯 Quick Start

### 1. Create Admin Account
Run this command in the Backend folder:

```bash
cd Backend
npm run create-admin
```

**Output will show:**
- Email: `admin@squadup.com`
- Password: `Admin@123456`

### 2. Login as Admin
1. Go to `http://localhost:3000/auth/login`
2. Enter email: `admin@squadup.com`
3. Enter password: `Admin@123456`
4. Click Login

### 3. Access Admin Dashboard
After login, you will be automatically redirected to:
```
http://localhost:3000/dashboard/admin
```

---

## 📊 Admin Dashboard Features

### Statistics Cards (Top Section)
- **Total Users** - Count of all registered users
- **Students** - Count of student accounts
- **Mentors** - Count of mentor accounts  
- **Users This Month** - New signups this month

### User Management Table

#### View User Information
The table displays all users with:
- **Name** - User's full name with avatar
- **Email** - User's email address
- **Role** - User type (Student/Mentor/Admin)
- **Profile Status** - Complete or Incomplete
- **Joined Date** - When user registered

#### Search & Filter
- **Search Box** - Find users by name or email (real-time)
- **Role Filter** - Filter by All Roles, Students, Mentors, or Admins
- Filters update instantly as you type

#### Export Data
- **Export CSV Button** - Download user list as CSV file
- Useful for external reporting or analysis

#### Pagination
- **Previous/Next Buttons** - Navigate through user pages
- Shows current page and total pages
- 10 users per page

---

## 🔐 Security

All admin operations are:
- ✅ Authenticated (JWT token required)
- ✅ Role-protected (admin role required)
- ✅ Server-validated (backend verification)

Admin routes protected:
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User list with pagination
- `PUT /api/admin/mentors/:id/verify` - Verify mentor profiles
- `PUT /api/admin/users/:id/status` - Update user status

---

## 🛠️ Troubleshooting

### Admin Login Not Working
1. Make sure you ran `npm run create-admin` in Backend
2. Check if MongoDB is connected (should see "MongoDB connected" in console)
3. Verify email is exactly: `admin@squadup.com`
4. Try resetting password and recreating admin

### Admin Dashboard Shows No Users
1. Check if you're logged in as admin (check user.role === 'admin')
2. Verify backend is running on `http://localhost:5000`
3. Check browser console for API errors
4. Ensure MongoDB connection is active

### Export CSV Not Working
1. Check browser console for errors
2. Verify user permissions in database
3. Try refreshing the page

### Performance Issues with Large User Lists
- Admin dashboard shows 10 users per page
- Use search/filter to narrow results
- Consider exporting to CSV for bulk analysis

---

## 📋 API Endpoints Used

The admin dashboard makes these API calls:

### Get Platform Statistics
```
GET /api/admin/stats
Response:
{
  "totalUsers": 150,
  "totalStudents": 100,
  "totalMentors": 40,
  "verifiedMentors": 35,
  "projects": 25,
  "bookings": 120,
  "usersThisMonth": 12,
  "monthlyGrowth": [10, 12, 15, 18...]
}
```

### Get Users List
```
GET /api/admin/users?page=1&limit=10
Response:
{
  "users": [
    {
      "_id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "profilePhoto": "...",
      "isProfileComplete": true,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    ...
  ],
  "totalPages": 15,
  "currentPage": 1
}
```

---

## 🔄 Future Enhancements

Possible admin features to add:
- [ ] User blocking/banning
- [ ] Mentor verification approval flow
- [ ] Revenue analytics and charts
- [ ] Real-time activity monitoring
- [ ] User email notifications
- [ ] Bulk user actions
- [ ] Admin activity logs
- [ ] System health monitoring

---

## ❓ FAQs

**Q: Can I create multiple admins?**
A: Yes, you can run `npm run create-admin` multiple times with different emails. Each will be an admin.

**Q: How do I change admin password?**
A: Update directly in MongoDB or modify the createAdmin script with new password.

**Q: Can regular users access /dashboard/admin?**
A: No, the page automatically redirects non-admins to /dashboard/student with an error toast.

**Q: How often should I check the dashboard?**
A: As needed. Real-time stats update on each page load.

**Q: Can admins see other admins' activity?**
A: Currently shows in user list. Activity logs feature coming soon.

---

## 📞 Support

If you encounter issues:
1. Check backend console for error messages
2. Check browser console (F12 → Console tab)
3. Verify MongoDB connection
4. Ensure all dependencies are installed
5. Restart both backend and frontend servers

---

## ✅ Verification Checklist

Before going live:
- [ ] Backend `/api/admin/*` routes are working
- [ ] Admin user created with `npm run create-admin`
- [ ] Admin can login successfully
- [ ] Dashboard loads user list without errors
- [ ] Search and filter work correctly
- [ ] CSV export downloads successfully
- [ ] Pagination works with multiple pages
- [ ] Mobile view is responsive
- [ ] Dark mode styling looks correct
- [ ] All stats display correctly

---

**Last Updated:** January 2024
**Dashboard Location:** `/app/dashboard/admin/page.jsx`
**Created for:** SquadUp Platform
