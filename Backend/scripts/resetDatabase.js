/**
 * ═══════════════════════════════════════════════════════════════════
 *  SQUADUP — SAFE DATABASE RESET SCRIPT
 * ═══════════════════════════════════════════════════════════════════
 *
 *  PURPOSE:
 *    Removes ALL user-generated data from the database so the
 *    application starts from a clean state.
 *
 *  SAFETY GUARANTEES:
 *    1. NEVER runs automatically — requires explicit confirmation.
 *    2. PRESERVES the admin account (admin@squadup.com) unless
 *       you pass --include-admin.
 *    3. Does NOT run at server startup.
 *    4. Logs every collection it clears and how many docs were removed.
 *    5. Prints a dry-run summary first and asks for confirmation
 *       (unless headless confirmation is provided via env/flag).
 *
 *  USAGE:
 *
 *    # Interactive (will prompt for confirmation):
 *    node scripts/resetDatabase.js
 *
 *    # Non-interactive (CI / scripted):
 *    CONFIRM_RESET=yes node scripts/resetDatabase.js
 *
 *    # npm script shortcut:
 *    npm run reset-data
 *
 *    # Also remove the admin account:
 *    node scripts/resetDatabase.js --include-admin
 *
 *    # Dry-run only (see what WOULD be deleted):
 *    node scripts/resetDatabase.js --dry-run
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

// ── Models ────────────────────────────────────────────────────────
const User            = require('../models/User');
const StudentProfile  = require('../models/StudentProfile');
const MentorProfile   = require('../models/MentorProfile');
const Availability    = require('../models/Availability');
const Booking         = require('../models/Booking');
const Project         = require('../models/Project');
const Message         = require('../models/Message');
const Notification    = require('../models/Notification');
const VideoCall       = require('../models/VideoCall');
const RefreshToken    = require('../models/RefreshToken');
const AuditLog        = require('../models/AuditLog');
const Connection      = require('../models/Connection');
const JoinRequest     = require('../models/JoinRequest');
const Report          = require('../models/Report');

// Optional models — require safely in case they don't exist
const safeRequire = (path) => { try { return require(path); } catch { return null; } };
const Post              = safeRequire('../models/Post');
const PostComment       = safeRequire('../models/PostComment');
const PostLike          = safeRequire('../models/PostLike');
const PostShare         = safeRequire('../models/PostShare');
const Poll              = safeRequire('../models/Poll');
const Resource          = safeRequire('../models/Resource');
const CodeSnippet       = safeRequire('../models/CodeSnippet');
const Task              = safeRequire('../models/Task');
const Event             = safeRequire('../models/Event');
const StandUp           = safeRequire('../models/StandUp');
const Milestone         = safeRequire('../models/Milestone');
const SkillChallenge    = safeRequire('../models/SkillChallenge');
const ChallengeSubmission = safeRequire('../models/ChallengeSubmission');
const SquadActivityLog  = safeRequire('../models/SquadActivityLog');
const SquadRule         = safeRequire('../models/SquadRule');
const SquadTemplate     = safeRequire('../models/SquadTemplate');
const MessageBookmark   = safeRequire('../models/MessageBookmark');
const MessageReaction   = safeRequire('../models/MessageReaction');
const MessageThread     = safeRequire('../models/MessageThread');
const UserEducation     = safeRequire('../models/UserEducation');
const UserExperience    = safeRequire('../models/UserExperience');

// ── CLI Flags ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FLAG_DRY_RUN       = args.includes('--dry-run');
const FLAG_INCLUDE_ADMIN = args.includes('--include-admin');
const FLAG_CONFIRMED     = process.env.CONFIRM_RESET === 'yes' || args.includes('--confirm');

// ── Admin Email ───────────────────────────────────────────────────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@squadup.com';

// ── Helpers ───────────────────────────────────────────────────────
function banner(text) {
    const line = '═'.repeat(60);
    console.log(`\n╔${line}╗`);
    console.log(`║  ${text.padEnd(58)}║`);
    console.log(`╚${line}╝`);
}

function warn(text) {
    console.log(`  ⚠️  ${text}`);
}

function info(text) {
    console.log(`  ℹ️  ${text}`);
}

function success(text) {
    console.log(`  ✅ ${text}`);
}

async function countDocs(Model) {
    if (!Model) return 0;
    try { return await Model.countDocuments(); } catch { return 0; }
}

async function clearCollection(Model, label, filter = {}) {
    if (!Model) {
        info(`${label}: model not found, skipping`);
        return 0;
    }
    const count = await countDocs(Model);
    if (count === 0) {
        info(`${label}: already empty`);
        return 0;
    }
    if (FLAG_DRY_RUN) {
        warn(`${label}: would delete ${count} document(s)`);
        return count;
    }
    const result = await Model.deleteMany(filter);
    success(`${label}: deleted ${result.deletedCount} document(s)`);
    return result.deletedCount;
}

async function promptConfirmation() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question('\n  Type "RESET" to confirm database reset: ', (answer) => {
            rl.close();
            resolve(answer.trim() === 'RESET');
        });
    });
}

// ── Main Reset Logic ──────────────────────────────────────────────
async function main() {
    banner('SQUADUP — DATABASE RESET');

    // Validate MongoDB URI
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('  ❌ MONGODB_URI is not set in environment variables.');
        console.error('     Create a .env file or set the variable before running.');
        process.exit(1);
    }

    // Connect
    info(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    success('Connected to MongoDB');

    // Identify the database name for display
    const dbName = mongoose.connection.db.databaseName;
    info(`Database: ${dbName}`);

    // ── Pre-flight: Count everything ──────────────────────────────
    banner('PRE-FLIGHT SUMMARY');

    const collections = [
        { Model: User,               label: 'Users' },
        { Model: StudentProfile,     label: 'StudentProfiles' },
        { Model: MentorProfile,      label: 'MentorProfiles' },
        { Model: Availability,       label: 'Availability' },
        { Model: Booking,            label: 'Bookings' },
        { Model: Project,            label: 'Projects' },
        { Model: Message,            label: 'Messages' },
        { Model: Notification,       label: 'Notifications' },
        { Model: VideoCall,          label: 'VideoCalls' },
        { Model: RefreshToken,       label: 'RefreshTokens' },
        { Model: AuditLog,           label: 'AuditLogs' },
        { Model: Connection,         label: 'Connections' },
        { Model: JoinRequest,        label: 'JoinRequests' },
        { Model: Report,             label: 'Reports' },
        { Model: Post,               label: 'Posts' },
        { Model: PostComment,        label: 'PostComments' },
        { Model: PostLike,           label: 'PostLikes' },
        { Model: PostShare,          label: 'PostShares' },
        { Model: Poll,               label: 'Polls' },
        { Model: Resource,           label: 'Resources' },
        { Model: CodeSnippet,        label: 'CodeSnippets' },
        { Model: Task,               label: 'Tasks' },
        { Model: Event,              label: 'Events' },
        { Model: StandUp,            label: 'StandUps' },
        { Model: Milestone,          label: 'Milestones' },
        { Model: SkillChallenge,     label: 'SkillChallenges' },
        { Model: ChallengeSubmission, label: 'ChallengeSubmissions' },
        { Model: SquadActivityLog,   label: 'SquadActivityLogs' },
        { Model: SquadRule,          label: 'SquadRules' },
        { Model: SquadTemplate,      label: 'SquadTemplates' },
        { Model: MessageBookmark,    label: 'MessageBookmarks' },
        { Model: MessageReaction,    label: 'MessageReactions' },
        { Model: MessageThread,      label: 'MessageThreads' },
        { Model: UserEducation,      label: 'UserEducation' },
        { Model: UserExperience,     label: 'UserExperience' },
    ];

    let totalDocs = 0;
    for (const { Model, label } of collections) {
        const count = await countDocs(Model);
        if (count > 0) {
            console.log(`    ${label.padEnd(25)} ${count}`);
            totalDocs += count;
        }
    }

    if (totalDocs === 0) {
        info('Database is already empty. Nothing to reset.');
        await mongoose.disconnect();
        process.exit(0);
    }

    console.log(`    ${'─'.repeat(35)}`);
    console.log(`    ${'TOTAL'.padEnd(25)} ${totalDocs}`);

    // Check admin existence
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (adminUser) {
        if (FLAG_INCLUDE_ADMIN) {
            warn(`Admin account (${ADMIN_EMAIL}) WILL BE DELETED (--include-admin flag)`);
        } else {
            success(`Admin account (${ADMIN_EMAIL}) will be PRESERVED`);
        }
    } else {
        info(`No admin account found with email ${ADMIN_EMAIL}`);
    }

    if (FLAG_DRY_RUN) {
        banner('DRY RUN — NO DATA DELETED');
        // Still show what would happen
        for (const { Model, label } of collections) {
            await clearCollection(Model, label);
        }
        await mongoose.disconnect();
        process.exit(0);
    }

    // ── Confirmation Gate ─────────────────────────────────────────
    if (!FLAG_CONFIRMED) {
        warn('This will PERMANENTLY DELETE all data listed above.');
        warn('This action CANNOT be undone.');
        console.log('');
        const confirmed = await promptConfirmation();
        if (!confirmed) {
            info('Reset cancelled. No data was deleted.');
            await mongoose.disconnect();
            process.exit(0);
        }
    }

    // ── Execute Reset ─────────────────────────────────────────────
    banner('RESETTING DATABASE');

    let totalDeleted = 0;

    // 1. Clear all non-User collections first
    for (const { Model, label } of collections) {
        if (label === 'Users') continue; // Handle users separately
        totalDeleted += await clearCollection(Model, label);
    }

    // 2. Clear Users (preserving admin if needed)
    if (FLAG_INCLUDE_ADMIN) {
        totalDeleted += await clearCollection(User, 'Users (ALL including admin)');
    } else {
        // Delete all users EXCEPT admin
        const nonAdminCount = await User.countDocuments({ email: { $ne: ADMIN_EMAIL } });
        if (nonAdminCount === 0) {
            info('Users: no non-admin users to delete');
        } else {
            const result = await User.deleteMany({ email: { $ne: ADMIN_EMAIL } });
            success(`Users: deleted ${result.deletedCount} non-admin user(s)`);
            totalDeleted += result.deletedCount;
        }

        // Verify admin is still there
        const adminStillExists = await User.findOne({ email: ADMIN_EMAIL });
        if (adminStillExists) {
            success(`Admin account (${ADMIN_EMAIL}) preserved ✓`);
        }
    }

    // 3. Also try to clear any orphaned AdminProfile collection docs
    //    (created by createAdmin.js with inline schema)
    try {
        const adminProfileCollection = mongoose.connection.db.collection('adminprofiles');
        if (adminProfileCollection) {
            const apCount = await adminProfileCollection.countDocuments();
            if (apCount > 0 && FLAG_INCLUDE_ADMIN) {
                await adminProfileCollection.deleteMany({});
                success(`AdminProfiles: deleted ${apCount} document(s)`);
                totalDeleted += apCount;
            }
        }
    } catch {
        // Collection may not exist, that's fine
    }

    // ── Summary ───────────────────────────────────────────────────
    banner('RESET COMPLETE');
    success(`Total documents deleted: ${totalDeleted}`);

    const remainingUsers = await User.countDocuments();
    info(`Remaining users in database: ${remainingUsers}`);

    if (!FLAG_INCLUDE_ADMIN && remainingUsers > 0) {
        const admin = await User.findOne({ email: ADMIN_EMAIL });
        if (admin) {
            info(`Preserved admin: ${admin.fullName} (${admin.email}), role: ${admin.role}`);
        }
    }

    console.log('\n  Next steps:');
    console.log('    • Run the server:  npm run dev');
    console.log('    • Create admin:    npm run create-admin  (if admin was removed)');
    console.log('    • Register users through the application UI\n');

    await mongoose.disconnect();
    success('Database connection closed');
    process.exit(0);
}

// ── Run ───────────────────────────────────────────────────────────
main().catch(async (err) => {
    console.error('\n  ❌ Reset failed:', err.message);
    console.error(err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
});
