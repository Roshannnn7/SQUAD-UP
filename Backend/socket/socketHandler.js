const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join user room for private messages & calls
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
            console.log(`Call from ${callerId} to ${to}`);
            io.to(`user-${to}`).emit('incoming-call', {
                from: callerId,
                name: callerName,
                offer,
                roomId,
            });
        });

        socket.on('call-accepted', (data) => {
            const { to, answer } = data;
            console.log(`Call accepted, sending answer to ${to}`);
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

        // Screen sharing
        socket.on('start-screen-share', (data) => {
            const { roomId, to } = data;
            console.log(`Screen sharing started in room ${roomId}`);
            io.to(`user-${to}`).emit('screen-share-started', { from: socket.id });
            io.to(roomId).emit('screen-share-started');
        });

        socket.on('stop-screen-share', (data) => {
            const { roomId, to } = data;
            console.log(`Screen sharing stopped in room ${roomId}`);
            io.to(`user-${to}`).emit('screen-share-stopped');
            io.to(roomId).emit('screen-share-stopped');
        });

        // In-call messaging (chat during call)
        socket.on('send-call-message', async (data) => {
            try {
                const { to, sender, senderName, content } = data;
                console.log(`Call message from ${senderName} to ${to}`);

                io.to(`user-${to}`).emit('call-message', {
                    sender,
                    senderName,
                    content,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error('Error sending call message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Notifications
        socket.on('send-notification', async (data) => {
            try {
                const { userId, type, message, relatedId } = data;

                // Save to database
                const notification = await Notification.create({
                    user: userId,
                    type,
                    message,
                    relatedModel: relatedId ? relatedId.model : null,
                    relatedId: relatedId ? relatedId.id : null,
                });

                // Emit to user
                io.to(`user-${userId}`).emit('new-notification', notification);
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        });

        // Squad updates (real-time collaboration)
        socket.on('update-squad-status', (data) => {
            const { squadId, status, userId } = data;
            io.to(`project-${squadId}`).emit('squad-status-update', {
                userId,
                status,
                timestamp: new Date()
            });
        });

        socket.on('update-task-status', (data) => {
            const { squadId, taskId, status, assignedTo } = data;
            io.to(`project-${squadId}`).emit('task-update', {
                taskId,
                status,
                assignedTo,
                timestamp: new Date()
            });
        });

        // Presence indicators (who's online)
        socket.on('user-active', (userId) => {
            socket.broadcast.emit('user-online', { userId, socketId: socket.id });
        });

        socket.on('user-typing', (data) => {
            const { roomId, receiverId, userId, userName } = data;
            if (roomId) {
                // Project room typing
                io.to(`project-${roomId}`).emit('user-typing-indicator', {
                    userId,
                    userName,
                    isTyping: true
                });
            } else if (receiverId) {
                // Private chat typing
                io.to(`user-${receiverId}`).emit('user-typing-indicator', {
                    userId,
                    userName,
                    isTyping: true
                });
            }
        });

        socket.on('user-stop-typing', (data) => {
            const { roomId, receiverId, userId } = data;
            if (roomId) {
                io.to(`project-${roomId}`).emit('user-typing-indicator', {
                    userId,
                    isTyping: false
                });
            } else if (receiverId) {
                io.to(`user-${receiverId}`).emit('user-typing-indicator', {
                    userId,
                    isTyping: false
                });
            }
        });

        // Join video call room
        socket.on('join-call-room', (roomId) => {
            socket.join(`call-${roomId}`);
            socket.to(`call-${roomId}`).emit('user-joined', socket.id);
            console.log(`User joined call room: ${roomId}`);
        });

        // Leave video call room
        socket.on('leave-call-room', (roomId) => {
            socket.leave(`call-${roomId}`);
            socket.to(`call-${roomId}`).emit('user-left', socket.id);
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            socket.broadcast.emit('user-offline', socket.id);
        });
    });
};

module.exports = initializeSocket;
