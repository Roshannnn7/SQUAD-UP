const express      = require('express');
const dotenv       = require('dotenv');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const http         = require('http');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/error');
const logger       = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// Whitelisted origins
const ALLOWED_ORIGINS = [
    "https://squadup-roshannnn7.vercel.app",
    "http://localhost:3000"
];

/* 🔴 IMPORTANT: CORS FIRST */
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (
            ALLOWED_ORIGINS.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).includes(origin))
        ) {
            return callback(null, true);
        }
        return callback(null, true); // Fallback allow for development/deployment checks
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Essential for Render
app.set('trust proxy', 1);

// NUCLEAR FIX: Disable COOP to guarantee Google Login popups can communicate
app.use(helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Safe request logger — never logs request body
app.use(logger.request);

// Connect to MongoDB
connectDB();

const uploadRoutes = require('./routes/uploadRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// New feature routes
const messageEnhancementRoutes = require('./routes/messageEnhancementRoutes');
const pollRoutes = require('./routes/pollRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const snippetRoutes = require('./routes/snippetRoutes');
const taskRoutes = require('./routes/taskRoutes');
const eventRoutes = require('./routes/eventRoutes');
const templateRoutes = require('./routes/templateRoutes');
const userEnhancementRoutes = require('./routes/userEnhancementRoutes');

app.use('/api/message-enhancements', messageEnhancementRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/user-enhancements', userEnhancementRoutes);

// Social Networking Routes
const profileRoutes = require('./routes/profileRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const postRoutes = require('./routes/postRoutes');

app.use('/api/profiles', profileRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/posts', postRoutes);

// 🚀 New Feature Routes
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const standupRoutes = require('./routes/standupRoutes');
const skillChallengeRoutes = require('./routes/skillChallengeRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');

app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/standups', standupRoutes);
app.use('/api/challenges', skillChallengeRoutes);
app.use('/api/milestones', milestoneRoutes);

// 🔥 New Feature Routes (Phase 2)
const exploreRoutes = require('./routes/exploreRoutes');
const mentorReviewRoutes = require('./routes/mentorReviewRoutes');

app.use('/api/explore', exploreRoutes);
app.use('/api/mentor-reviews', mentorReviewRoutes);

// Duplicate mounts for platform flexibility
app.use('/auth', authRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.get('/', (req, res) => res.status(200).send('SquadUp Backend Live'));

app.use(errorHandler);
app.use('*', (req, res) => res.status(404).json({ message: 'Endpoint not found' }));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
