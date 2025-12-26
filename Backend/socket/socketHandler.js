const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join user room for private messages
        socket.on('join-user', (userId) => {
            socket.join(`user-${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        // Join project chat room
        socket.on('join-project', (projectId) => {
            socket.join(`project-${projectId}`);
            console.log(`Socket joined project: ${projectId}`);
        });

        // Leave project chat room
        socket.on('leave-project', (projectId) => {
            socket.leave(`project-${projectId}`);
        });

        // Send message to project
        socket.on('send-project-message', async (data) => {
            try {
                const { projectId, senderId, content, messageType } = data;

                // Save message to database
                const message = await Message.create({
                    sender: senderId,
                    project: projectId,
                    content,
                    messageType: messageType || 'text',
                });

                // Populate sender info
                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'fullName profilePhoto');

                // Broadcast to project room
                io.to(`project-${projectId}`).emit('new-project-message', populatedMessage);
            } catch (error) {
                console.error('Error sending project message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Send private message
        socket.on('send-private-message', async (data) => {
            try {
                const { receiverId, senderId, content, messageType } = data;

                // Save message to database
                const message = await Message.create({
                    sender: senderId,
                    receiver: receiverId,
                    content,
                    messageType: messageType || 'text',
                });

                // Populate sender info
                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'fullName profilePhoto');

                // Send to receiver's room
                io.to(`user-${receiverId}`).emit('new-private-message', populatedMessage);

                // Also send back to sender for their UI
                socket.emit('new-private-message', populatedMessage);
            } catch (error) {
                console.error('Error sending private message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Video call signaling
        socket.on('call-user', (data) => {
            const { to, offer, callerId, callerName, roomId } = data;
            io.to(`user-${to}`).emit('incoming-call', {
                from: callerId,
                name: callerName,
                offer,
                roomId,
            });
        });

        socket.on('call-accepted', (data) => {
            const { to, answer } = data;
            io.to(`user-${to}`).emit('call-accepted', { answer });
        });

        socket.on('call-rejected', (data) => {
            const { to } = data;
            io.to(`user-${to}`).emit('call-rejected');
        });

        socket.on('ice-candidate', (data) => {
            const { to, candidate } = data;
            io.to(`user-${to}`).emit('ice-candidate', { candidate });
        });

        socket.on('end-call', (data) => {
            const { to } = data;
            io.to(`user-${to}`).emit('call-ended');
        });

        // Join video call room
        socket.on('join-call-room', (roomId) => {
            socket.join(`call-${roomId}`);
            socket.to(`call-${roomId}`).emit('user-joined', socket.id);
        });

        // Leave video call room
        socket.on('leave-call-room', (roomId) => {
            socket.leave(`call-${roomId}`);
            socket.to(`call-${roomId}`).emit('user-left', socket.id);
        });

        // Screen sharing
        socket.on('start-screen-share', (data) => {
            const { roomId, streamId } = data;
            socket.to(`call-${roomId}`).emit('screen-share-started', { streamId });
        });

        socket.on('stop-screen-share', (data) => {
            const { roomId } = data;
            socket.to(`call-${roomId}`).emit('screen-share-stopped');
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

module.exports = initializeSocket;
