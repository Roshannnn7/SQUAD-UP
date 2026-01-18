const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const MentorProfile = require('../models/MentorProfile');
const UserExperience = require('../models/UserExperience');
const UserEducation = require('../models/UserEducation');
const Connection = require('../models/Connection');
const Post = require('../models/Post');
const Project = require('../models/Project');

// @desc    Get user profile (public view with privacy controls)
// @route   GET /api/profiles/:userId
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?._id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check privacy settings
        const isOwnProfile = currentUserId && currentUserId.toString() === userId;
        const privacy = user.privacy || {};

        // Check if profile is private
        if (!isOwnProfile && privacy.profileVisibility === 'private') {
            return res.status(403).json({ message: 'This profile is private' });
        }

        // Check connection status
        let isConnected = false;
        let connectionStatus = 'none';

        if (currentUserId && !isOwnProfile) {
            const connection = await Connection.findOne({
                $or: [
                    { requester: currentUserId, recipient: userId },
                    { requester: userId, recipient: currentUserId },
                ],
            });

            if (connection) {
                connectionStatus = connection.status;
                isConnected = connection.status === 'accepted';
            }
        }

        // Check if profile is connections-only
        if (!isOwnProfile && privacy.profileVisibility === 'connections' && !isConnected) {
            return res.status(403).json({
                message: 'This profile is only visible to connections',
                canSendRequest: privacy.allowConnectionRequests,
            });
        }

        // Build profile data based on privacy settings
        const profileData = {
            _id: user._id,
            fullName: user.fullName,
            profilePhoto: user.profilePhoto,
            coverPhoto: user.coverPhoto,
            headline: user.headline,
            bio: user.bio,
            role: user.role,
            location: user.location,
            pronouns: user.pronouns,
            email: (isOwnProfile || privacy.showEmail) ? user.email : undefined,
            socialLinks: user.socialLinks,
            status: user.status,
            customStatus: user.customStatus,
            connectionCount: privacy.showConnections !== false ? user.connectionCount : undefined,
            points: user.points,
            level: user.level,
            badges: user.badges,
            createdAt: user.createdAt,
            isOwnProfile,
            isConnected,
            connectionStatus,
            canSendConnectionRequest: !isOwnProfile && privacy.allowConnectionRequests && connectionStatus === 'none',
            canSendMessage: isOwnProfile || privacy.allowMessages === 'everyone' ||
                (privacy.allowMessages === 'connections' && isConnected),
        };

        // Add skills if allowed
        if (isOwnProfile || privacy.showSkills !== false) {
            profileData.skills = user.skills;
            profileData.interests = user.interests;
        }

        // Get role-specific profile
        let roleProfile = null;
        if (user.role === 'student') {
            roleProfile = await StudentProfile.findOne({ user: userId });
        } else if (user.role === 'mentor') {
            roleProfile = await MentorProfile.findOne({ user: userId });
        }

        if (roleProfile) {
            profileData.roleProfile = roleProfile;
        }

        // Get experience and education if profile is viewable
        if (isOwnProfile || isConnected || privacy.profileVisibility === 'public') {
            const [experiences, education] = await Promise.all([
                UserExperience.find({ user: userId }).sort({ startDate: -1 }),
                UserEducation.find({ user: userId }).sort({ startDate: -1 }),
            ]);

            profileData.experiences = experiences;
            profileData.education = education;
        }

        // Get recent posts if allowed
        if (isOwnProfile || privacy.showProjects !== false) {
            const recentPosts = await Post.find({
                author: userId,
                visibility: isOwnProfile ? { $in: ['public', 'connections', 'private'] } :
                    isConnected ? { $in: ['public', 'connections'] } : 'public',
            })
                .select('content postType createdAt likeCount commentCount author mediaUrls hashtags')
                .populate('author', 'fullName profilePhoto headline')
                .sort({ createdAt: -1 })
                .limit(5);

            profileData.recentPosts = recentPosts;
        }

        // Add Mutual Squads if not own profile
        if (currentUserId && !isOwnProfile) {
            const mutualProjects = await Project.find({
                $and: [
                    { 'members.user': currentUserId },
                    { 'members.user': userId }
                ]
            }).select('name category status');
            profileData.mutualSquads = mutualProjects;
        }

        res.status(200).json({
            success: true,
            data: profileData,
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get my own profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [experiences, education, studentInfo, mentorInfo, recentPosts] = await Promise.all([
            UserExperience.find({ user: userId }).sort({ startDate: -1 }),
            UserEducation.find({ user: userId }).sort({ startDate: -1 }),
            user.role === 'student' ? StudentProfile.findOne({ user: userId }) : null,
            user.role === 'mentor' ? MentorProfile.findOne({ user: userId }) : null,
            Post.find({ author: userId }).sort({ createdAt: -1 }).limit(10).populate('author', 'fullName profilePhoto headline')
        ]);

        const profileData = user.toObject();
        profileData.experiences = experiences;
        profileData.education = education;
        profileData.studentInfo = studentInfo;
        profileData.mentorInfo = mentorInfo;
        profileData.recentPosts = recentPosts;
        profileData.isOwnProfile = true;

        res.status(200).json({
            success: true,
            data: profileData,
        });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/profiles
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            fullName,
            headline,
            bio,
            location,
            pronouns,
            socialLinks,
            skills,
            interests,
            privacy,
            preferences,
            profilePhoto,
            coverPhoto,
        } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (fullName) user.fullName = fullName;
        if (headline !== undefined) user.headline = headline;
        if (bio !== undefined) user.bio = bio;
        if (location) user.location = location;
        if (pronouns !== undefined) user.pronouns = pronouns;
        if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
        if (skills) user.skills = skills;
        if (interests) user.interests = interests;
        if (privacy) user.privacy = { ...user.privacy, ...privacy };
        if (preferences) user.preferences = { ...user.preferences, ...preferences };
        if (profilePhoto) user.profilePhoto = profilePhoto;
        if (coverPhoto) user.coverPhoto = coverPhoto;

        await user.save();

        res.status(200).json({
            success: true,
            data: user,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add experience to profile
// @route   POST /api/profiles/experience
// @access  Private
const addExperience = async (req, res) => {
    try {
        const userId = req.user._id;
        const { type, title, company, location, description, skills, startDate, endDate, isCurrent, mediaUrls } = req.body;

        const experience = await UserExperience.create({
            user: userId,
            type,
            title,
            company,
            location,
            description,
            skills: skills || [],
            startDate,
            endDate: isCurrent ? null : endDate,
            isCurrent: isCurrent || false,
            mediaUrls: mediaUrls || [],
        });

        res.status(201).json({
            success: true,
            data: experience,
            message: 'Experience added successfully',
        });
    } catch (error) {
        console.error('Add experience error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update experience
// @route   PUT /api/profiles/experience/:experienceId
// @access  Private
const updateExperience = async (req, res) => {
    try {
        const { experienceId } = req.params;
        const userId = req.user._id;

        const experience = await UserExperience.findById(experienceId);

        if (!experience) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        if (experience.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        Object.keys(req.body).forEach(key => {
            experience[key] = req.body[key];
        });

        await experience.save();

        res.status(200).json({
            success: true,
            data: experience,
            message: 'Experience updated successfully',
        });
    } catch (error) {
        console.error('Update experience error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete experience
// @route   DELETE /api/profiles/experience/:experienceId
// @access  Private
const deleteExperience = async (req, res) => {
    try {
        const { experienceId } = req.params;
        const userId = req.user._id;

        const experience = await UserExperience.findById(experienceId);

        if (!experience) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        if (experience.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await experience.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Experience deleted successfully',
        });
    } catch (error) {
        console.error('Delete experience error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add education to profile
// @route   POST /api/profiles/education
// @access  Private
const addEducation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { school, degree, field, grade, description, activities, startDate, endDate, isCurrent } = req.body;

        const education = await UserEducation.create({
            user: userId,
            school,
            degree,
            field,
            grade,
            description,
            activities,
            startDate,
            endDate: isCurrent ? null : endDate,
            isCurrent: isCurrent || false,
        });

        res.status(201).json({
            success: true,
            data: education,
            message: 'Education added successfully',
        });
    } catch (error) {
        console.error('Add education error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update education
// @route   PUT /api/profiles/education/:educationId
// @access  Private
const updateEducation = async (req, res) => {
    try {
        const { educationId } = req.params;
        const userId = req.user._id;

        const education = await UserEducation.findById(educationId);

        if (!education) {
            return res.status(404).json({ message: 'Education not found' });
        }

        if (education.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        Object.keys(req.body).forEach(key => {
            education[key] = req.body[key];
        });

        await education.save();

        res.status(200).json({
            success: true,
            data: education,
            message: 'Education updated successfully',
        });
    } catch (error) {
        console.error('Update education error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete education
// @route   DELETE /api/profiles/education/:educationId
// @access  Private
const deleteEducation = async (req, res) => {
    try {
        const { educationId } = req.params;
        const userId = req.user._id;

        const education = await UserEducation.findById(educationId);

        if (!education) {
            return res.status(404).json({ message: 'Education not found' });
        }

        if (education.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await education.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Education deleted successfully',
        });
    } catch (error) {
        console.error('Delete education error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Search users by name, skills, college, etc.
// @route   GET /api/profiles/search
// @access  Public
const searchUsers = async (req, res) => {
    try {
        const { query, skills, college, role, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        let searchQuery = {
            isActive: { $ne: false }, // Handles missing isActive or true
            $or: [
                { 'privacy.profileVisibility': { $in: ['public', 'connections'] } },
                { 'privacy.profileVisibility': { $exists: false } },
                { 'privacy': { $exists: false } }
            ]
        };

        if (query) {
            searchQuery.$or = [
                { fullName: { $regex: query, $options: 'i' } },
                { headline: { $regex: query, $options: 'i' } },
                { bio: { $regex: query, $options: 'i' } },
            ];
        }

        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            searchQuery.skills = { $in: skillsArray };
        }

        if (role) {
            searchQuery.role = role;
        }

        const users = await User.find(searchQuery)
            .select('fullName profilePhoto headline bio role skills connectionCount location')
            .sort({ connectionCount: -1, level: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(searchQuery);

        // Fetch additional profile data for these users
        const usersWithDetails = await Promise.all(users.map(async (user) => {
            const userData = user.toObject();
            if (user.role === 'student') {
                const sp = await StudentProfile.findOne({ user: user._id }).select('college degree');
                if (sp) userData.studentInfo = sp;
            } else if (user.role === 'mentor') {
                const mp = await MentorProfile.findOne({ user: user._id }).select('organization title');
                if (mp) userData.mentorInfo = mp;
            }
            return userData;
        }));

        res.status(200).json({
            success: true,
            data: usersWithDetails,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUserProfile,
    getMyProfile,
    updateUserProfile,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    searchUsers,
};
