const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');

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
const videoCallRoutes = require('./routes/videoCallRoutes');
const errorHandler = require('./middleware/error');
const initializeSocket = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Essential for Render
app.set('trust proxy', 1);

// whitelisted origins
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://squadup-roshannnn7.vercel.app",
    "https://squadup-azure.vercel.app",
    "https://squad-up-sfhn.onrender.com"
];

// Whitelisted origin (Primary Vercel URL)
const FRONTEND_URL = "https://squadup-roshannnn7.vercel.app";

// Initialize Socket.IO with the requested configuration
const io = socketIo(server, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket"], // Force websocket on backend too
    allowEIO3: true
});
initializeSocket(io);

// NUCLEAR FIX: Disable COOP to guarantee Google Login popups can communicate
app.use(helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
}));

// Robust Universal CORS
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/video-calls', videoCallRoutes);

// Duplicate mounts for platform flexibility
app.use('/auth', authRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.get('/', (req, res) => res.status(200).send('SquadUp Backend Live'));

app.use(errorHandler);
app.use('*', (req, res) => res.status(404).json({ message: 'Endpoint not found' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
