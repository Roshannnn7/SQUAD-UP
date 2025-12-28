const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            unique: true,
            sparse: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            select: false,
        },
        role: {
            type: String,
            enum: ['student', 'mentor', 'admin'],
            default: 'student',
        },
        fullName: {
            type: String,
            required: true,
        },
        profilePhoto: {
            type: String,
            default: '',
        },
        isProfileComplete: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
