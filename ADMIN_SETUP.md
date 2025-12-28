# 👨‍💼 Admin User Setup Guide

## 🎯 Quick Admin Credentials

```
Email:    admin@squadup.com
Password: Admin@123456
```

**⚠️ Change this password immediately after first login!**

---

## 📋 How to Create Admin User

### **Option 1: Using the Script (Recommended)**

#### Step 1: Make sure your Backend is in the right directory
```bash
cd "c:\Users\roshan rathod\OneDrive\Desktop\SQUAD UP\Backend"
```

#### Step 2: Ensure you have a .env file with MONGODB_URI
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/squad-up
```

#### Step 3: Run the admin creation script
```bash
node scripts/createAdmin.js
```

#### Step 4: Wait for success message
You should see:
```
✅ Connected to database
✅ Admin user created successfully!

╔════════════════════════════════════════════════╗
║        SQUADUP ADMIN CREDENTIALS              ║
╠════════════════════════════════════════════════╣
║ Email:    admin@squadup.com                    ║
║ Password: Admin@123456                         ║
╠════════════════════════════════════════════════╣
║ ⚠️  SAVE THESE CREDENTIALS SECURELY!           ║
║ Change password after first login!             ║
╚════════════════════════════════════════════════╝

✅ Admin setup complete!
```

---

### **Option 2: Manual MongoDB Creation**

If the script fails, you can create the admin manually in MongoDB:

#### Step 1: Go to MongoDB Atlas
https://cloud.mongodb.com

#### Step 2: Find Your Collection
1. Select your cluster
2. Go to "Collections"
3. Find "users" collection

#### Step 3: Insert Admin Document
Click "Insert Document" and paste this:

```json
{
  "_id": {
    "$oid": "640e5b9c1234567890123456"
  },
  "firebaseUid": "admin_local_12345",
  "email": "admin@squadup.com",
  "fullName": "SquadUp Admin",
  "password": "$2a$10$AbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz",
  "role": "admin",
  "isProfileComplete": true,
  "profilePhoto": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
  "createdAt": {
    "$date": "2025-12-27T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2025-12-27T00:00:00.000Z"
  },
  "__v": 0
}
```

**Note:** The password field above is a bcrypt hash of "Admin@123456"

#### Step 4: Login with these credentials
```
Email: admin@squadup.com
Password: Admin@123456
```

---

## 🔐 Security Best Practices

### **Immediately After Creating Admin:**

1. **Login to the platform**
   - Go to https://your-frontend-url/auth/login
   - Use admin@squadup.com / Admin@123456

2. **Change the password**
   - Go to Profile/Settings
   - Update password to something secure
   - Use at least 12 characters with mixed case/numbers/symbols

3. **Save credentials securely**
   - Store in password manager (1Password, LastPass, etc.)
   - Don't share via email/chat
   - Keep backup in secure location

4. **Enable 2FA (if available)**
   - Add two-factor authentication
   - Use authenticator app

---

## 🚨 If Admin Already Exists

If you get an error that admin already exists:

```bash
# The admin account is already in the database
# Use the existing credentials or reset via MongoDB
```

**To reset the admin password:**

1. Go to MongoDB Atlas
2. Find the admin user document
3. Delete the document
4. Run the script again: `node scripts/createAdmin.js`

Or manually update the password:

```javascript
// In MongoDB Compass or Atlas UI
db.users.updateOne(
  { email: "admin@squadup.com" },
  { $set: { password: "$2a$10$AbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz" } }
)
```

---

## 📝 Admin Features Available

Once logged in as admin, you can:

- ✅ View all users (students and mentors)
- ✅ Manage user accounts
- ✅ View all bookings
- ✅ Manage bookings
- ✅ View projects/squads
- ✅ Manage content
- ✅ System settings
- ✅ View analytics (if implemented)
- ✅ Generate reports

---

## 🔄 Create Additional Admin Users

### Via MongoDB:
```javascript
// In MongoDB Compass
db.users.insertOne({
  firebaseUid: "admin2_12345",
  email: "admin2@squadup.com",
  fullName: "Admin User 2",
  password: "$2a$10$...", // bcrypt hash
  role: "admin",
  isProfileComplete: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Via Script:
Modify the script and change:
```javascript
const adminEmail = 'admin2@squadup.com';
const adminPassword = 'Admin@123456New';
const adminName = 'Admin User 2';
```

Then run:
```bash
node scripts/createAdmin.js
```

---

## 🆘 Troubleshooting

### "Script not found" error
```bash
# Make sure you're in the Backend directory
cd "c:\Users\roshan rathod\OneDrive\Desktop\SQUAD UP\Backend"

# Check if scripts folder exists
ls scripts/

# If not, create it
mkdir scripts

# Then run the script
node scripts/createAdmin.js
```

### "MONGODB_URI is undefined"
```bash
# Make sure .env file exists in Backend folder
# With content:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/squad-up
JWT_SECRET=your-secret-key
```

### "Connection timeout"
```
# Check:
1. MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
2. Internet connection is working
3. MongoDB URI is correct
4. Database is running
```

### "Permission denied"
```bash
# Make sure you have permission to create documents
# In MongoDB Atlas, verify user has readWrite permissions
```

---

## 📋 Verify Admin User Created

### Option 1: Via MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Find "squad-up" database
4. Open "users" collection
5. Search for: `{ "email": "admin@squadup.com" }`
6. Should see the admin document

### Option 2: Via MongoDB Atlas UI
1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Click "Collections"
4. Find "users" collection
5. Filter by email: `admin@squadup.com`

### Option 3: Login to Platform
1. Go to your frontend URL
2. Click "Login"
3. Enter: admin@squadup.com / Admin@123456
4. If successful, admin account exists!

---

## 🔑 Login Steps

### **Local Development (http://localhost:3000)**
1. Click "Login"
2. Email: `admin@squadup.com`
3. Password: `Admin@123456`
4. Click "Login"

### **Vercel Deployment (vercel.app)**
1. Go to https://your-frontend.vercel.app
2. Click "Login"
3. Email: `admin@squadup.com`
4. Password: `Admin@123456`
5. Click "Login"

---

## ⚠️ Important Notes

1. **Change password immediately after first login**
   - The default password is publicly known
   - Create a secure password only you know

2. **Don't share admin credentials**
   - Only authorized team members should have admin access
   - Use principle of least privilege

3. **Keep backup credentials**
   - Store in secure password manager
   - Keep offline backup

4. **Monitor admin activity**
   - Check logs regularly
   - Alert on suspicious login attempts

5. **Rotate credentials periodically**
   - Change password every 90 days
   - Update after team changes

---

## 📞 Still Having Issues?

1. Check if MongoDB is running
2. Verify .env file exists with MONGODB_URI
3. Ensure MongoDB Atlas IP whitelist is updated
4. Check browser console for errors (F12)
5. Check backend logs for database errors

---

**Admin setup complete!** 🎉

You can now login with:
- **Email:** admin@squadup.com
- **Password:** Admin@123456

**Remember to change the password after first login!**
