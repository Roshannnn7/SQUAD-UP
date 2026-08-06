/**
 * SQUAD-UP FULL SEED SCRIPT
 * Seeds: Students, Mentors, Squads, Stand-ups, Milestones, Challenges
 * 
 * Run: node scripts/seedAll.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const MentorProfile = require('../models/MentorProfile');
const Project = require('../models/Project');
const SquadActivityLog = require('../models/SquadActivityLog');
const Milestone = require('../models/Milestone');
const SkillChallenge = require('../models/SkillChallenge');
const StandUp = require('../models/StandUp');

const HASH_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Squad@1234';

// ─── STUDENT DATA ────────────────────────────────────────────────────────────
const STUDENTS = [
    {
        fullName: 'Arjun Sharma',
        email: 'arjun@student.squadup.com',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
        interests: ['Web Development', 'AI/ML', 'Open Source'],
        headline: 'Full Stack Developer | BCA Final Year',
        bio: 'Passionate about building scalable web apps and contributing to open source.',
        points: 450,
        level: 1,
        streak: { current: 7, longest: 12 },
        badges: [{ name: 'Early Adopter', icon: '🚀' }, { name: 'Coder', icon: '💻' }],
        location: { city: 'Mumbai', country: 'India' },
        socialLinks: { github: 'https://github.com/arjunsharma', linkedin: 'https://linkedin.com/in/arjun' },
        profile: {
            college: 'Mumbai University', degree: 'BCA', year: '3rd Year', semester: 6,
            skills: ['React', 'Node.js', 'MongoDB'], interests: ['Web Dev', 'Open Source'],
            bio: 'Building cool stuff one commit at a time.',
        },
    },
    {
        fullName: 'Priya Patel',
        email: 'priya@student.squadup.com',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
        interests: ['AI/ML', 'Research', 'Data Visualization'],
        headline: 'ML Enthusiast | Data Science Student',
        bio: 'Turning data into insights. Kaggle competitor and ML researcher.',
        points: 820,
        level: 2,
        streak: { current: 15, longest: 22 },
        badges: [{ name: 'ML Master', icon: '🤖' }, { name: 'Data Wizard', icon: '📊' }, { name: 'Streak King', icon: '🔥' }],
        location: { city: 'Bengaluru', country: 'India' },
        socialLinks: { github: 'https://github.com/priyapatel', linkedin: 'https://linkedin.com/in/priya' },
        profile: {
            college: 'IIT Bangalore', degree: 'B.Tech CS', year: '2nd Year', semester: 4,
            skills: ['Python', 'TensorFlow', 'Scikit-learn'], interests: ['AI', 'Research'],
            bio: 'Making machines smarter every day.',
        },
    },
    {
        fullName: 'Rohan Verma',
        email: 'rohan@student.squadup.com',
        skills: ['Flutter', 'Dart', 'Firebase', 'Android'],
        interests: ['Mobile Development', 'UI/UX', 'Gaming'],
        headline: 'Mobile App Developer | Flutter Expert',
        bio: 'Building cross-platform apps with Flutter. Google Developer Student Club Lead.',
        points: 310,
        level: 1,
        streak: { current: 4, longest: 8 },
        badges: [{ name: 'App Builder', icon: '📱' }],
        location: { city: 'Pune', country: 'India' },
        socialLinks: { github: 'https://github.com/rohanverma' },
        profile: {
            college: 'Pune University', degree: 'B.Sc IT', year: '3rd Year', semester: 5,
            skills: ['Flutter', 'Dart', 'Firebase'], interests: ['Mobile Dev', 'UI/UX'],
            bio: 'Cross-platform is the future.',
        },
    },
    {
        fullName: 'Ananya Singh',
        email: 'ananya@student.squadup.com',
        skills: ['UI/UX Design', 'Figma', 'React', 'CSS'],
        interests: ['Design Systems', 'Product Design', 'Web Dev'],
        headline: 'UI/UX Designer & Frontend Dev',
        bio: 'Bridging the gap between design and development. I make things look beautiful AND work.',
        points: 650,
        level: 2,
        streak: { current: 10, longest: 18 },
        badges: [{ name: 'Designer', icon: '🎨' }, { name: 'Frontend Pro', icon: '✨' }],
        location: { city: 'Delhi', country: 'India' },
        socialLinks: { linkedin: 'https://linkedin.com/in/ananya' },
        profile: {
            college: 'Delhi College of Art', degree: 'B.Design', year: '3rd Year', semester: 6,
            skills: ['Figma', 'React', 'CSS'], interests: ['Design', 'UI/UX'],
            bio: 'Design is not just what it looks like. Design is how it works.',
        },
    },
    {
        fullName: 'Vikram Nair',
        email: 'vikram@student.squadup.com',
        skills: ['Blockchain', 'Solidity', 'Web3.js', 'Ethereum'],
        interests: ['Web3', 'DeFi', 'Smart Contracts'],
        headline: 'Web3 Developer | Blockchain Enthusiast',
        bio: 'Building on Ethereum. Hackathon winner. Decentralize everything.',
        points: 990,
        level: 2,
        streak: { current: 21, longest: 30 },
        badges: [{ name: 'Web3 Pioneer', icon: '⛓️' }, { name: 'Hackathon Winner', icon: '🏆' }, { name: 'Streak Legend', icon: '🔥' }],
        location: { city: 'Kochi', country: 'India' },
        socialLinks: { github: 'https://github.com/vikramnair' },
        profile: {
            college: 'Cochin University', degree: 'B.Tech', year: '4th Year', semester: 8,
            skills: ['Solidity', 'Web3.js', 'Ethereum'], interests: ['Blockchain', 'DeFi'],
            bio: 'Code is law.',
        },
    },
    {
        fullName: 'Sneha Kulkarni',
        email: 'sneha@student.squadup.com',
        skills: ['DevOps', 'Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        interests: ['Cloud Computing', 'Infrastructure', 'Security'],
        headline: 'Cloud & DevOps Engineer | AWS Certified',
        bio: 'Automating everything. Docker, K8s and CI/CD pipelines are my jam.',
        points: 540,
        level: 2,
        streak: { current: 9, longest: 14 },
        badges: [{ name: 'Cloud Native', icon: '☁️' }, { name: 'DevOps Guru', icon: '⚙️' }],
        location: { city: 'Hyderabad', country: 'India' },
        socialLinks: { linkedin: 'https://linkedin.com/in/sneha' },
        profile: {
            college: 'BITS Pilani', degree: 'B.Tech', year: '3rd Year', semester: 6,
            skills: ['Docker', 'Kubernetes', 'AWS'], interests: ['Cloud', 'DevOps'],
            bio: 'Ship early, ship often.',
        },
    },
];

// ─── MENTOR DATA ─────────────────────────────────────────────────────────────
const MENTORS = [
    {
        fullName: 'Karan Mehta',
        email: 'karan@mentor.squadup.com',
        skills: ['React', 'Node.js', 'System Design', 'DSA'],
        headline: 'Senior SDE @ Google | 8 YOE',
        bio: 'Ex-Amazon, now at Google. Passionate about mentoring the next gen of developers. Specialize in full-stack and system design.',
        points: 1200,
        level: 3,
        profile: {
            currentRole: 'Senior Software Engineer',
            company: 'Google',
            experience: 8,
            expertise: ['Full Stack', 'System Design', 'DSA', 'React'],
            bio: 'Building products at scale. Here to help students crack their first big job.',
            sessionPrice: 500,
            mode: ['video', 'chat'],
            isVerified: true,
            rating: 4.9,
        },
    },
    {
        fullName: 'Divya Rajan',
        email: 'divya@mentor.squadup.com',
        skills: ['Machine Learning', 'Python', 'Deep Learning', 'NLP'],
        headline: 'ML Research Engineer @ Microsoft',
        bio: 'ML researcher with focus on NLP and computer vision. Published 5 papers. Love teaching ML fundamentals.',
        points: 950,
        level: 2,
        profile: {
            currentRole: 'ML Research Engineer',
            company: 'Microsoft',
            experience: 6,
            expertise: ['Machine Learning', 'Deep Learning', 'NLP', 'Python'],
            bio: 'Democratizing AI knowledge. Helping students understand ML from scratch.',
            sessionPrice: 600,
            mode: ['video', 'screen-share'],
            isVerified: true,
            rating: 4.8,
        },
    },
    {
        fullName: 'Amit Joshi',
        email: 'amit@mentor.squadup.com',
        skills: ['iOS', 'Swift', 'Flutter', 'Mobile Architecture'],
        headline: 'Staff iOS Engineer @ Zomato',
        bio: 'Built apps used by 10M+ users. Mobile architecture expert and startup advisor.',
        points: 780,
        level: 2,
        profile: {
            currentRole: 'Staff iOS Engineer',
            company: 'Zomato',
            experience: 7,
            expertise: ['iOS Development', 'Swift', 'Flutter', 'Mobile Architecture'],
            bio: 'Mobile first is my philosophy. Let me guide you through mobile development.',
            sessionPrice: 400,
            mode: ['chat', 'video'],
            isVerified: true,
            rating: 4.7,
        },
    },
];

// ─── SQUAD DATA ───────────────────────────────────────────────────────────────
const SQUADS = [
    {
        name: 'E-Commerce Platform Builder',
        description: 'Building a full-stack e-commerce platform with React frontend, Node.js backend, and MongoDB. Features include product catalog, cart, payments (Stripe), and admin panel.',
        category: 'web',
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'Stripe', 'CSS'],
        discoveryTags: ['fullstack', 'ecommerce', 'javascript', 'beginner-friendly'],
        maxMembers: 6,
        status: 'in-progress',
        progress: 45,
        isPublic: true,
        requireJoinApproval: false,
        githubRepo: 'https://github.com/squadup/ecommerce-platform',
        milestones: [
            { title: 'Project Setup & Architecture', dueDate: 7, status: 'completed', color: '#10b981' },
            { title: 'Product Catalog & Search', dueDate: 14, status: 'completed', color: '#10b981' },
            { title: 'Shopping Cart & Checkout', dueDate: 21, status: 'in-progress', color: '#f59e0b' },
            { title: 'Payment Integration (Stripe)', dueDate: 30, status: 'upcoming', color: '#6366f1' },
            { title: 'Admin Dashboard', dueDate: 45, status: 'upcoming', color: '#6366f1' },
            { title: 'Deployment & Launch', dueDate: 60, status: 'upcoming', color: '#6366f1' },
        ],
        challenge: {
            title: 'Build the Best Product Card Component',
            description: 'Design and implement a product card with add-to-cart animation, wishlist toggle, and responsive layout. Must score 90+ on Lighthouse performance.',
            type: 'coding',
            difficulty: 'medium',
            xpReward: 75,
            daysUntilDeadline: 5,
        },
    },
    {
        name: 'AI Resume Analyzer',
        description: 'Building an AI-powered resume analyzer that scores resumes against job descriptions using NLP, extracts skills, and gives improvement suggestions using Python and GPT API.',
        category: 'ai_ml',
        skillsRequired: ['Python', 'Machine Learning', 'NLP', 'FastAPI', 'React'],
        discoveryTags: ['ai', 'nlp', 'python', 'resume', 'gpt'],
        maxMembers: 4,
        status: 'planning',
        progress: 15,
        isPublic: true,
        requireJoinApproval: true,
        githubRepo: '',
        milestones: [
            { title: 'Research & Planning', dueDate: 7, status: 'completed', color: '#10b981' },
            { title: 'NLP Model Training', dueDate: 21, status: 'in-progress', color: '#f59e0b' },
            { title: 'FastAPI Backend', dueDate: 35, status: 'upcoming', color: '#8b5cf6' },
            { title: 'React Frontend', dueDate: 50, status: 'upcoming', color: '#3b82f6' },
        ],
        challenge: {
            title: 'Implement Resume Keyword Extraction',
            description: 'Build a function that extracts skills, education, and work experience from a resume PDF using Python. Use any NLP library (spaCy, NLTK, etc).',
            type: 'coding',
            difficulty: 'hard',
            xpReward: 100,
            daysUntilDeadline: 7,
        },
    },
    {
        name: 'Flutter Fitness Tracker App',
        description: 'Cross-platform fitness tracker built with Flutter and Firebase. Features workout logging, progress charts, nutrition tracking, and social challenges with friends.',
        category: 'mobile',
        skillsRequired: ['Flutter', 'Dart', 'Firebase', 'UI/UX Design'],
        discoveryTags: ['flutter', 'mobile', 'fitness', 'firebase', 'crossplatform'],
        maxMembers: 5,
        status: 'in-progress',
        progress: 60,
        isPublic: true,
        requireJoinApproval: false,
        githubRepo: 'https://github.com/squadup/flutter-fitness',
        milestones: [
            { title: 'App Architecture & Design System', dueDate: -20, status: 'completed', color: '#10b981' },
            { title: 'Auth & User Profiles', dueDate: -10, status: 'completed', color: '#10b981' },
            { title: 'Workout Logging Module', dueDate: 5, status: 'in-progress', color: '#f59e0b' },
            { title: 'Progress Charts & Analytics', dueDate: 20, status: 'upcoming', color: '#6366f1' },
        ],
        challenge: null,
    },
    {
        name: 'Web3 NFT Marketplace',
        description: 'Decentralized NFT marketplace built on Ethereum with Solidity smart contracts. Features minting, buying/selling, royalties, and wallet integration (MetaMask).',
        category: 'blockchain',
        skillsRequired: ['Solidity', 'Web3.js', 'React', 'Ethereum', 'IPFS'],
        discoveryTags: ['blockchain', 'nft', 'defi', 'ethereum', 'smart-contracts'],
        maxMembers: 4,
        status: 'planning',
        progress: 20,
        isPublic: true,
        requireJoinApproval: true,
        githubRepo: 'https://github.com/squadup/nft-marketplace',
        milestones: [
            { title: 'Smart Contract Architecture', dueDate: 3, status: 'in-progress', color: '#f59e0b' },
            { title: 'NFT Minting Contracts', dueDate: 14, status: 'upcoming', color: '#6366f1' },
            { title: 'Frontend Wallet Integration', dueDate: 28, status: 'upcoming', color: '#3b82f6' },
        ],
        challenge: {
            title: 'Write an ERC-721 NFT Contract',
            description: 'Write and deploy a fully functional ERC-721 NFT smart contract to the Sepolia testnet with minting, transfer, and burn functions. Share verified contract address.',
            type: 'coding',
            difficulty: 'hard',
            xpReward: 150,
            daysUntilDeadline: 10,
        },
    },
    {
        name: 'DevOps Pipeline Automation',
        description: 'Building a complete CI/CD pipeline template with Docker, GitHub Actions, and Kubernetes. Includes auto-scaling, monitoring with Prometheus+Grafana, and blue-green deployments.',
        category: 'other',
        skillsRequired: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Python'],
        discoveryTags: ['devops', 'docker', 'kubernetes', 'aws', 'automation'],
        maxMembers: 5,
        status: 'in-progress',
        progress: 35,
        isPublic: true,
        requireJoinApproval: false,
        githubRepo: 'https://github.com/squadup/devops-pipeline',
        milestones: [
            { title: 'Docker Containerization', dueDate: -5, status: 'completed', color: '#10b981' },
            { title: 'GitHub Actions CI/CD', dueDate: 10, status: 'in-progress', color: '#f59e0b' },
            { title: 'Kubernetes Deployment', dueDate: 25, status: 'upcoming', color: '#6366f1' },
            { title: 'Monitoring & Alerting', dueDate: 40, status: 'upcoming', color: '#8b5cf6' },
        ],
        challenge: null,
    },
];

// ─── SEED FUNCTIONS ────────────────────────────────────────────────────────────

async function clearExistingSeeds() {
    console.log('\n🗑️  Checking for existing seed data...');
    const seedEmails = [
        ...STUDENTS.map(s => s.email),
        ...MENTORS.map(m => m.email),
    ];
    const existing = await User.countDocuments({ email: { $in: seedEmails } });
    if (existing > 0) {
        console.log(`   Found ${existing} existing seed users. Removing them first...`);
        const users = await User.find({ email: { $in: seedEmails } });
        const userIds = users.map(u => u._id);
        await Promise.all([
            User.deleteMany({ email: { $in: seedEmails } }),
            StudentProfile.deleteMany({ user: { $in: userIds } }),
            MentorProfile.deleteMany({ user: { $in: userIds } }),
        ]);
        // Remove seeded squads
        await Project.deleteMany({ name: { $in: SQUADS.map(s => s.name) } });
        console.log('   ✅ Cleared old seed data');
    }
}

async function seedStudents(hashedPassword) {
    console.log('\n👩‍💻 Seeding students...');
    const createdStudents = [];

    for (const s of STUDENTS) {
        const user = await User.create({
            email: s.email,
            fullName: s.fullName,
            password: hashedPassword,
            role: 'student',
            isProfileComplete: true,
            isActive: true,
            firebaseUid: `seed_student_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.fullName)}`,
            bio: s.bio,
            headline: s.headline,
            skills: s.skills,
            interests: s.interests,
            location: s.location,
            socialLinks: s.socialLinks || {},
            points: s.points,
            level: s.level,
            badges: s.badges,
            streak: { ...s.streak, lastActiveDate: new Date() },
            status: 'online',
        });

        await StudentProfile.create({
            user: user._id,
            college: s.profile.college,
            degree: s.profile.degree,
            year: s.profile.year,
            semester: s.profile.semester,
            skills: s.profile.skills,
            interests: s.profile.interests,
            bio: s.profile.bio,
        });

        createdStudents.push(user);
        console.log(`   ✅ ${s.fullName} (${s.email})`);
    }

    return createdStudents;
}

async function seedMentors(hashedPassword) {
    console.log('\n🎓 Seeding mentors...');
    const createdMentors = [];

    for (const m of MENTORS) {
        const user = await User.create({
            email: m.email,
            fullName: m.fullName,
            password: hashedPassword,
            role: 'mentor',
            isProfileComplete: true,
            isActive: true,
            firebaseUid: `seed_mentor_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.fullName)}`,
            bio: m.bio,
            headline: m.headline,
            skills: m.skills,
            points: m.points,
            level: m.level,
            status: 'online',
        });

        await MentorProfile.create({
            user: user._id,
            currentRole: m.profile.currentRole,
            company: m.profile.company,
            experience: m.profile.experience,
            expertise: m.profile.expertise,
            bio: m.profile.bio,
            sessionPrice: m.profile.sessionPrice,
            mode: m.profile.mode,
            isVerified: m.profile.isVerified,
            rating: m.profile.rating,
            totalSessions: Math.floor(Math.random() * 50) + 10,
        });

        createdMentors.push(user);
        console.log(`   ✅ ${m.fullName} (${m.email}) @ ${m.profile.company}`);
    }

    return createdMentors;
}

async function seedSquads(students) {
    console.log('\n🏗️  Seeding squads...');
    const createdSquads = [];

    for (let i = 0; i < SQUADS.length; i++) {
        const sq = SQUADS[i];
        const creator = students[i % students.length];

        // Assign 2-4 members from different students
        const memberUsers = [creator];
        const otherStudents = students.filter(s => s._id.toString() !== creator._id.toString());
        const memberCount = Math.min(2 + Math.floor(Math.random() * 3), otherStudents.length);
        for (let j = 0; j < memberCount; j++) {
            memberUsers.push(otherStudents[j]);
        }

        const chatRoomId = crypto.randomBytes(16).toString('hex');

        const project = await Project.create({
            name: sq.name,
            description: sq.description,
            creator: creator._id,
            members: memberUsers.map((u, idx) => ({
                user: u._id,
                role: idx === 0 ? 'admin' : idx === 1 ? 'moderator' : 'member',
                joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            })),
            skillsRequired: sq.skillsRequired,
            discoveryTags: sq.discoveryTags,
            category: sq.category,
            maxMembers: sq.maxMembers,
            status: sq.status,
            progress: sq.progress,
            isPublic: sq.isPublic,
            requireJoinApproval: sq.requireJoinApproval,
            githubRepo: sq.githubRepo,
            chatRoomId,
            analytics: {
                messageCount: Math.floor(Math.random() * 200) + 20,
                activityScore: Math.floor(Math.random() * 100),
                lastActivityAt: new Date(),
            },
        });

        // Seed activity log
        await SquadActivityLog.create({
            project: project._id,
            user: creator._id,
            action: 'project_created',
            description: `${creator.fullName} created the squad "${sq.name}"`,
        });

        // Seed milestones
        const now = new Date();
        for (let mi = 0; mi < sq.milestones.length; mi++) {
            const ms = sq.milestones[mi];
            const dueDate = new Date(now.getTime() + ms.dueDate * 24 * 60 * 60 * 1000);
            await Milestone.create({
                project: project._id,
                createdBy: creator._id,
                title: ms.title,
                description: `Milestone for ${sq.name}: ${ms.title}`,
                dueDate,
                status: ms.status,
                color: ms.color,
                order: mi,
                completedAt: ms.status === 'completed' ? new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000) : undefined,
            });
        }

        // Seed a skill challenge if defined
        if (sq.challenge) {
            const ch = sq.challenge;
            const deadline = new Date(now.getTime() + ch.daysUntilDeadline * 24 * 60 * 60 * 1000);
            await SkillChallenge.create({
                project: project._id,
                creator: creator._id,
                title: ch.title,
                description: ch.description,
                type: ch.type,
                difficulty: ch.difficulty,
                xpReward: ch.xpReward,
                deadline,
                status: 'active',
            });
        }

        // Seed today's standups for some members
        const todayDate = new Date().toISOString().split('T')[0];
        const standupMembers = memberUsers.slice(0, 2);
        for (const member of standupMembers) {
            await StandUp.findOneAndUpdate(
                { project: project._id, user: member._id, date: todayDate },
                {
                    yesterday: `Worked on ${sq.skillsRequired[0]} integration and reviewed PRs from teammates.`,
                    today: `Planning to complete the ${sq.milestones[0]?.title || 'current milestone'} tasks and push for review.`,
                    blockers: 'No blockers today, feeling productive!',
                    mood: ['great', 'good', 'good', 'okay'][Math.floor(Math.random() * 4)],
                },
                { upsert: true, new: true }
            );
        }

        createdSquads.push(project);
        console.log(`   ✅ "${sq.name}" — ${memberUsers.length} members, ${sq.milestones.length} milestones`);
    }

    return createdSquads;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║        SQUAD-UP SEED SCRIPT v2.0               ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('\nConnecting to MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    await clearExistingSeeds();

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, HASH_ROUNDS);

    const students = await seedStudents(hashedPassword);
    const mentors = await seedMentors(hashedPassword);
    const squads = await seedSquads(students);

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ SEED COMPLETE — LOGIN CREDENTIALS            ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  All accounts use password: Squad@1234                      ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  STUDENTS:                                                  ║');
    STUDENTS.forEach(s => {
        console.log(`║  📧 ${s.email.padEnd(48)}║`);
    });
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  MENTORS:                                                   ║');
    MENTORS.forEach(m => {
        console.log(`║  📧 ${m.email.padEnd(48)}║`);
    });
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  ADMIN:  admin@squadup.com  /  Admin@123456                 ║`);
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  📊 ${students.length} Students  |  ${mentors.length} Mentors  |  ${squads.length} Squads seeded              ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    await mongoose.disconnect();
    console.log('✅ Done! Database connection closed.\n');
    process.exit(0);
}

main().catch(err => {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
});
