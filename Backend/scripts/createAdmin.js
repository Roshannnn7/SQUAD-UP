const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');

// Define AdminProfile schema inline (model doesn't need to exist separately)
const adminProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    permissions: [String],
    department: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

let AdminProfileModel;
try {
    AdminProfileModel = mongoose.model('AdminProfile');
} catch (e) {
    AdminProfileModel = mongoose.model('AdminProfile', adminProfileSchema);
}

const createAdmin = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/squad-up');
        console.log('✅ Connected to database');

        // Admin credentials
        const adminEmail = 'admin@squadup.com';
        const adminPassword = 'Admin@123456';
        const adminName = 'SquadUp Admin';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: Use your existing password`);
            await mongoose.disconnect();
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        const adminUser = await User.create({
            email: adminEmail,
            fullName: adminName,
            password: hashedPassword,
            role: 'admin',
            isProfileComplete: true,
            profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            firebaseUid: `admin_${Date.now()}`,
        });

        console.log('✅ Admin user created successfully!');
        console.log('\n');
        console.log('╔════════════════════════════════════════════════╗');
        console.log('║        SQUADUP ADMIN CREDENTIALS              ║');
        console.log('╠════════════════════════════════════════════════╣');
        console.log(`║ Email:    ${adminEmail.padEnd(35)}║`);
        console.log(`║ Password: ${adminPassword.padEnd(35)}║`);
        console.log('╠════════════════════════════════════════════════╣');
        console.log('║ ⚠️  SAVE THESE CREDENTIALS SECURELY!           ║');
        console.log('║ Change password after first login!             ║');
        console.log('╚════════════════════════════════════════════════╝');
        console.log('\n');

        // Create admin profile
        await AdminProfileModel.create({
            user: adminUser._id,
            permissions: [
                'manage_users',
                'manage_mentors',
                'manage_bookings',
                'manage_projects',
                'view_analytics',
                'manage_content',
                'system_settings',
            ],
            department: 'Administration',
        });

        console.log('✅ Admin profile created successfully!');
        console.log('\n✅ Admin setup complete!');
        console.log('\nYou can now login with:');
        console.log(`   Email: admin@squadup.com`);
        console.log(`   Password: Admin@123456`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
