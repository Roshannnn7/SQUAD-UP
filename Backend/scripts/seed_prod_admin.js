const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// PRODUCTION MONGODB URI
const MONGODB_URI = 'mongodb+srv://squaduser:vishal2004@squadup.j1hjciv.mongodb.net/?appName=SQUADUP';

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
    fullName: { type: String, required: true },
    profilePhoto: { type: String, default: '' },
    isProfileComplete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const adminProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permissions: [String],
    department: String,
    createdAt: { type: Date, default: Date.now },
});

const AdminProfile = mongoose.model('AdminProfile', adminProfileSchema);

const createProdAdmin = async () => {
    try {
        console.log('⏳ Connecting to Production MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to Production Database');

        const adminEmail = 'admin@squadup.com';
        const adminPassword = 'Admin@123456';
        const adminName = 'SquadUp Admin';

        // Check if admin exists
        let adminUser = await User.findOne({ email: adminEmail });

        if (adminUser) {
            console.log('⚠️  Admin user already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);
            adminUser.password = hashedPassword;
            await adminUser.save();
            console.log('✅ Admin password updated to: Admin@123456');
        } else {
            console.log('Creating new Admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            adminUser = await User.create({
                email: adminEmail,
                fullName: adminName,
                password: hashedPassword,
                role: 'admin',
                isProfileComplete: true,
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
                firebaseUid: `admin_${Date.now()}`,
            });
            console.log('✅ New Admin user created!');
        }

        // Ensure Admin Profile exists
        const existingProfile = await AdminProfile.findOne({ user: adminUser._id });
        if (!existingProfile) {
            await AdminProfile.create({
                user: adminUser._id,
                permissions: ['manage_users', 'manage_mentors', 'manage_bookings', 'manage_projects', 'view_analytics', 'manage_content', 'system_settings'],
                department: 'Administration',
            });
            console.log('✅ Admin Profile created!');
        } else {
            console.log('ℹ️  Admin Profile already exists.');
        }

        console.log('\n=============================================');
        console.log('✅ SUCCESS! You can now login with:');
        console.log(`📧 Email:    ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log('=============================================');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createProdAdmin();