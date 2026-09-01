/**
 * ═══════════════════════════════════════════════════════════════════
 *  SQUADUP — SAFE ADMIN CREATION SCRIPT
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Creates the administrator account using environment variables.
 *  Credentials are NEVER hardcoded in this script.
 *
 *  REQUIRED ENVIRONMENT VARIABLES:
 *    ADMIN_EMAIL       — Admin email address
 *    ADMIN_PASSWORD    — Admin password (will be bcrypt-hashed)
 *    ADMIN_FULL_NAME   — Admin display name
 *
 *  OPTIONAL:
 *    ADMIN_FIREBASE_UID — Firebase UID for the admin account.
 *                         If using Firebase Auth, set this to the
 *                         UID from Firebase Console.
 *
 *  USAGE:
 *    # Set variables in .env or inline:
 *    ADMIN_EMAIL=admin@squadup.com \
 *    ADMIN_PASSWORD=YourSecurePassword \
 *    ADMIN_FULL_NAME="SquadUp Admin" \
 *    node scripts/createAdminSafe.js
 *
 *    # Or use npm script (reads from .env):
 *    npm run create-admin-safe
 *
 *  SAFETY:
 *    - If an admin already exists, it will NOT be deleted.
 *    - It will only report that the admin exists.
 *    - Use --force to update the existing admin's password.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dotenv   = require('dotenv');

dotenv.config();

const User = require('../models/User');

// ── Configuration (from environment) ──────────────────────────────
const ADMIN_EMAIL      = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD   = process.env.ADMIN_PASSWORD;
const ADMIN_FULL_NAME  = process.env.ADMIN_FULL_NAME || 'SquadUp Admin';
const ADMIN_FIREBASE_UID = process.env.ADMIN_FIREBASE_UID || null;
const FORCE_UPDATE     = process.argv.includes('--force');

async function main() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║      SQUADUP — SAFE ADMIN CREATION                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // ── Validate required variables ───────────────────────────────
    if (!ADMIN_EMAIL) {
        console.error('  ❌ ADMIN_EMAIL environment variable is required.');
        console.error('     Set it in .env or pass it inline:');
        console.error('     ADMIN_EMAIL=admin@squadup.com node scripts/createAdminSafe.js');
        process.exit(1);
    }

    if (!ADMIN_PASSWORD) {
        console.error('  ❌ ADMIN_PASSWORD environment variable is required.');
        console.error('     Set it in .env or pass it inline:');
        console.error('     ADMIN_PASSWORD=YourSecurePassword node scripts/createAdminSafe.js');
        process.exit(1);
    }

    if (ADMIN_PASSWORD.length < 8) {
        console.error('  ❌ ADMIN_PASSWORD must be at least 8 characters.');
        process.exit(1);
    }

    // ── Connect ───────────────────────────────────────────────────
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('  ❌ MONGODB_URI is not set.');
        process.exit(1);
    }

    console.log('  ℹ️  Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('  ✅ Connected to MongoDB');

    // ── Check existing admin ──────────────────────────────────────
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
        if (!FORCE_UPDATE) {
            console.log(`\n  ⚠️  Admin account already exists: ${ADMIN_EMAIL}`);
            console.log('     Role:', existingAdmin.role);
            console.log('     Created:', existingAdmin.createdAt);
            console.log('\n     To update the password, run with --force flag.');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Force update password
        console.log('  ℹ️  Updating existing admin password (--force)...');
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
        existingAdmin.password = hashedPassword;
        existingAdmin.role = 'admin'; // Ensure role is admin
        existingAdmin.isActive = true;
        existingAdmin.isProfileComplete = true;
        if (ADMIN_FIREBASE_UID) {
            existingAdmin.firebaseUid = ADMIN_FIREBASE_UID;
        }
        await existingAdmin.save();
        console.log('  ✅ Admin password updated successfully.');
    } else {
        // Create new admin
        console.log('  ℹ️  Creating new admin account...');
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        const adminData = {
            email: ADMIN_EMAIL,
            fullName: ADMIN_FULL_NAME,
            password: hashedPassword,
            role: 'admin',
            isProfileComplete: true,
            isActive: true,
        };

        if (ADMIN_FIREBASE_UID) {
            adminData.firebaseUid = ADMIN_FIREBASE_UID;
        }

        await User.create(adminData);
        console.log('  ✅ Admin account created successfully!');
    }

    // ── Summary ───────────────────────────────────────────────────
    console.log('\n  ╔═══════════════════════════════════════════════╗');
    console.log('  ║  Admin Account Ready                          ║');
    console.log('  ╠═══════════════════════════════════════════════╣');
    console.log(`  ║  Email: ${ADMIN_EMAIL.padEnd(38)}║`);
    console.log(`  ║  Name:  ${ADMIN_FULL_NAME.padEnd(38)}║`);
    console.log('  ║  Password: (as set in ADMIN_PASSWORD env)     ║');
    console.log('  ╚═══════════════════════════════════════════════╝\n');

    await mongoose.disconnect();
    console.log('  ✅ Done.\n');
    process.exit(0);
}

main().catch(async (err) => {
    console.error('\n  ❌ Admin creation failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
});
