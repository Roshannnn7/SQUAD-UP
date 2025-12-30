const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const videoCallRoutes = require('./routes/videoCallRoutes');

// Import middleware
const { protect } = require('./middleware/auth');
const errorHandler = require('./middleware/error');

// Import socket handler
const initializeSocket = require('./socket/socketHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const allowVercelWildcard = process.env.ALLOW_VERCEL_WILDCARD === 'false' ? false : true;

const isOriginAllowed = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (origin === 'http://localhost:3000') return true;
    if (allowVercelWildcard && /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) return true;
    return false;
};

console.log('Allowed Origins:', allowedOrigins, 'ALLOW_VERCEL_WILDCARD:', allowVercelWildcard);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
    transports: ['websocket', 'polling'],
    allowRequest: (req, callback) => {
        const origin = req.headers.origin;
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }
        return callback('Not allowed by Socket.IO CORS', false);
    },
});

// Initialize socket handler
initializeSocket(io);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS',
});

// Apply middleware
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Ensure preflight requests always succeed
app.options('*', cors({
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/api', limiter);

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/video-calls', videoCallRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Also expose health under /api for platform checks
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Start server with explicit host and improved logging
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.on('error', (err) => {
    console.error('Server error:', err);
});

server.listen(PORT, HOST, () => {
    const addr = server.address();
    const host = addr.address === '::' ? '0.0.0.0' : addr.address;
    console.log(`Server running on http://${host}:${addr.port} in ${process.env.NODE_ENV || 'development'} mode`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
