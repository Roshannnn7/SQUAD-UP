const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @desc    Create event
// @route   POST /api/events
// @access  Protected
const createEvent = asyncHandler(async (req, res) => {
    const { projectId, title, description, startTime, endTime, location, meetingLink, isRecurring, recurrencePattern } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const isMember = project.members.some(
        member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Add all squad members as pending attendees
    const attendees = project.members.map(member => ({
        user: member.user,
        status: member.user.toString() === req.user._id.toString() ? 'accepted' : 'pending',
    }));

    const event = await Event.create({
        project: projectId,
        creator: req.user._id,
        title,
        description,
        startTime,
        endTime,
        location,
        meetingLink,
        attendees,
        isRecurring: isRecurring || false,
        recurrencePattern,
    });

    // Create notifications for all members
    const notificationPromises = project.members
        .filter(member => member.user.toString() !== req.user._id.toString())
        .map(member =>
            Notification.create({
                recipient: member.user,
                sender: req.user._id,
                type: 'event_invite',
                message: `${req.user.fullName} invited you to an event: ${title}`,
                relatedProject: projectId,
            })
        );

    await Promise.all(notificationPromises);

    const populatedEvent = await Event.findById(event._id)
        .populate('creator', 'fullName profilePhoto')
        .populate('attendees.user', 'fullName profilePhoto');

    res.status(201).json(populatedEvent);
});

// @desc    Get events for a project
// @route   GET /api/events/project/:projectId
// @access  Protected
const getProjectEvents = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const query = { project: req.params.projectId };

    if (startDate && endDate) {
        query.startTime = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }

    const events = await Event.find(query)
        .populate('creator', 'fullName profilePhoto')
        .populate('attendees.user', 'fullName profilePhoto')
        .sort({ startTime: 1 });

    res.json(events);
});

// @desc    RSVP to event
// @route   PUT /api/events/:id/rsvp
// @access  Protected
const rsvpEvent = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'accepted' or 'declined'
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const attendee = event.attendees.find(
        a => a.user.toString() === req.user._id.toString()
    );

    if (!attendee) {
        res.status(404);
        throw new Error('Not invited to this event');
    }

    attendee.status = status;
    await event.save();

    const populatedEvent = await Event.findById(event._id)
        .populate('creator', 'fullName profilePhoto')
        .populate('attendees.user', 'fullName profilePhoto');

    res.json(populatedEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Protected
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (event.creator.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
});

module.exports = {
    createEvent,
    getProjectEvents,
    rsvpEvent,
    deleteEvent,
};
