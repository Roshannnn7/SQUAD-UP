import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(token) {
        if (this.socket?.connected) return this.socket;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
        });

        this.setupEventListeners();
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
            this.listeners.set(event, callback);
        }
    }

    off(event) {
        if (this.socket && this.listeners.has(event)) {
            this.socket.off(event, this.listeners.get(event));
            this.listeners.delete(event);
        }
    }

    joinUserRoom(userId) {
        this.emit('join-user', userId);
    }

    joinProjectRoom(projectId) {
        this.emit('join-project', projectId);
    }

    leaveProjectRoom(projectId) {
        this.emit('leave-project', projectId);
    }

    sendProjectMessage(data) {
        this.emit('send-project-message', data);
    }

    sendPrivateMessage(data) {
        this.emit('send-private-message', data);
    }
}

const socketService = new SocketService();
export default socketService;
