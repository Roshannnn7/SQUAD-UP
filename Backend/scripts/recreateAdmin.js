const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');

const recreateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/squad-up');
        console.log('Connected to database');
        
        // Delete old admin
        const deleted = await User.deleteOne({ email: 'admin@squadup.com' });
        console.log('Deleted old admin:', deleted.deletedCount);
        
        // Create new admin with password
        const adminEmail = 'admin@squadup.com';
        const adminPassword = 'Admin@123456';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        const adminUser = await User.create({
            email: adminEmail,
            fullName: 'SquadUp Admin',
            password: hashedPassword,
            role: 'admin',
            isProfileComplete: true,
            profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        });
        
        console.log('Admin recreated with password!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

recreateAdmin();
