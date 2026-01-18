const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send connection request
// @route   POST /api/connections/request
// @access  Private
const sendConnectionRequest = async (req, res) => {
    try {
        const { recipientId, message } = req.body;
        const requesterId = req.user._id;

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if recipient allows connection requests
        if (!recipient.privacy?.allowConnectionRequests) {
            return res.status(403).json({ message: 'This user is not accepting connection requests' });
        }

        // Check if user is trying to connect with themselves
        if (requesterId.toString() === recipientId) {
            return res.status(400).json({ message: 'You cannot connect with yourself' });
        }

        // Check if connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId },
            ],
        });

        if (existingConnection) {
            if (existingConnection.status === 'accepted') {
                return res.status(400).json({ message: 'You are already connected' });
            } else if (existingConnection.status === 'pending') {
                return res.status(400).json({ message: 'Connection request already sent' });
            } else if (existingConnection.status === 'blocked') {
                return res.status(403).json({ message: 'Unable to send connection request' });
            }
        }

        // Create connection request
        const connection = await Connection.create({
            requester: requesterId,
            recipient: recipientId,
            message: message || '',
            status: 'pending',
        });

        // Create notification
        await Notification.create({
            user: recipientId,
            sender: requesterId,
            type: 'connection_request',
            title: 'New Connection Request',
            message: `${req.user.fullName} sent you a connection request`,
            relatedId: connection._id,
            actionUrl: `/profile/${requesterId}`
        });

        res.status(201).json({
            success: true,
            data: connection,
            message: 'Connection request sent successfully',
        });
    } catch (error) {
        console.error('Send connection request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Accept connection request
// @route   PUT /api/connections/accept/:connectionId
// @access  Private
const acceptConnectionRequest = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const userId = req.user._id;

        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        // Verify the user is the recipient
        if (connection.recipient.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (connection.status !== 'pending') {
            return res.status(400).json({ message: 'Connection request is not pending' });
        }

        // Update connection status
        connection.status = 'accepted';
        connection.respondedAt = new Date();
        await connection.save();

        // Update connection counts
        await User.findByIdAndUpdate(connection.requester, {
            $inc: { connectionCount: 1 },
        });
        await User.findByIdAndUpdate(connection.recipient, {
            $inc: { connectionCount: 1 },
        });

        // Create notification
        await Notification.create({
            user: connection.requester,
            sender: userId,
            type: 'connection_accepted',
            title: 'Connection Accepted',
            message: `${req.user.fullName} accepted your connection request`,
            relatedId: connection._id,
            actionUrl: `/profile/${userId}`
        });

        res.status(200).json({
            success: true,
            data: connection,
            message: 'Connection request accepted',
        });
    } catch (error) {
        console.error('Accept connection error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reject connection request
// @route   PUT /api/connections/reject/:connectionId
// @access  Private
const rejectConnectionRequest = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const userId = req.user._id;

        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        // Verify the user is the recipient
        if (connection.recipient.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (connection.status !== 'pending') {
            return res.status(400).json({ message: 'Connection request is not pending' });
        }

        // Update connection status
        connection.status = 'rejected';
        connection.respondedAt = new Date();
        await connection.save();

        res.status(200).json({
            success: true,
            message: 'Connection request rejected',
        });
    } catch (error) {
        console.error('Reject connection error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's connections
// @route   GET /api/connections
// @access  Private
const getUserConnections = async (req, res) => {
    try {
        const userId = req.query.userId || req.user._id;
        const { status = 'accepted', page = 1, limit = 20 } = req.query;

        const skip = (page - 1) * limit;

        const connections = await Connection.find({
            $or: [
                { requester: userId, status },
                { recipient: userId, status },
            ],
        })
            .populate('requester', 'fullName profilePhoto headline email role')
            .populate('recipient', 'fullName profilePhoto headline email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Connection.countDocuments({
            $or: [
                { requester: userId, status },
                { recipient: userId, status },
            ],
        });

        // Transform connections to show the other user
        const transformedConnections = connections.map(conn => {
            const isRequester = conn.requester._id.toString() === userId.toString();
            return {
                _id: conn._id,
                user: isRequester ? conn.recipient : conn.requester,
                status: conn.status,
                message: conn.message,
                createdAt: conn.createdAt,
                respondedAt: conn.respondedAt,
            };
        });

        res.status(200).json({
            success: true,
            data: transformedConnections,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get connections error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get pending connection requests
// @route   GET /api/connections/pending
// @access  Private
const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const { type = 'received' } = req.query; // received or sent

        const query = type === 'received'
            ? { recipient: userId, status: 'pending' }
            : { requester: userId, status: 'pending' };

        const requests = await Connection.find(query)
            .populate('requester', 'fullName profilePhoto headline email role')
            .populate('recipient', 'fullName profilePhoto headline email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
            count: requests.length,
        });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove connection
// @route   DELETE /api/connections/:connectionId
// @access  Private
const removeConnection = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const userId = req.user._id;

        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: 'Connection not found' });
        }

        // Verify the user is part of the connection
        const isRequester = connection.requester.toString() === userId.toString();
        const isRecipient = connection.recipient.toString() === userId.toString();

        if (!isRequester && !isRecipient) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // If connection was accepted, update connection counts
        if (connection.status === 'accepted') {
            await User.findByIdAndUpdate(connection.requester, {
                $inc: { connectionCount: -1 },
            });
            await User.findByIdAndUpdate(connection.recipient, {
                $inc: { connectionCount: -1 },
            });
        }

        await connection.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Connection removed successfully',
        });
    } catch (error) {
        console.error('Remove connection error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Check connection status between two users
// @route   GET /api/connections/status/:userId
// @access  Private
const getConnectionStatus = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { userId } = req.params;

        const connection = await Connection.findOne({
            $or: [
                { requester: currentUserId, recipient: userId },
                { requester: userId, recipient: currentUserId },
            ],
        });

        if (!connection) {
            return res.status(200).json({
                success: true,
                data: { status: 'none', connection: null },
            });
        }

        const isRequester = connection.requester.toString() === currentUserId.toString();

        res.status(200).json({
            success: true,
            data: {
                status: connection.status,
                isRequester,
                connection,
            },
        });
    } catch (error) {
        console.error('Get connection status error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    getUserConnections,
    getPendingRequests,
    removeConnection,
    getConnectionStatus,
};
