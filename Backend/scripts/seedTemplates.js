const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SquadTemplate = require('../models/SquadTemplate');
const connectDB = require('../config/db');

dotenv.config();

const templates = [
    {
        name: 'Web Development Squad',
        description: 'Build modern web applications with a collaborative team',
        category: 'web',
        icon: '🌐',
        defaultRules: [
            {
                title: 'Code Quality',
                description: 'All code must be reviewed before merging. Follow best practices and coding standards.',
            },
            {
                title: 'Communication',
                description: 'Regular updates on progress. Use chat for quick questions, create tasks for features.',
            },
            {
                title: 'Respect',
                description: 'Be respectful and supportive of all team members. We grow together.',
            },
        ],
        suggestedSkills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Git'],
        defaultTags: ['web-dev', 'full-stack', 'frontend', 'backend'],
        taskTemplate: [
            { title: 'Setup project repository', description: 'Initialize Git repo and add collaborators', status: 'todo' },
            { title: 'Define project requirements', description: 'Create detailed feature list and timeline', status: 'todo' },
            { title: 'Design wireframes', description: 'Create UI/UX mockups', status: 'todo' },
            { title: 'Setup development environment', description: 'Configure dev tools and dependencies', status: 'todo' },
        ],
        isOfficial: true,
    },
    {
        name: 'Mobile App Squad',
        description: 'Create amazing mobile experiences for iOS and Android',
        category: 'mobile',
        icon: '📱',
        defaultRules: [
            {
                title: 'Cross-Platform Compatibility',
                description: 'Ensure app works seamlessly on both iOS and Android platforms.',
            },
            {
                title: 'User Experience First',
                description: 'Prioritize smooth animations, intuitive navigation, and responsive design.',
            },
            {
                title: 'Testing',
                description: 'Test on real devices before pushing updates.',
            },
        ],
        suggestedSkills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI/UX'],
        defaultTags: ['mobile', 'ios', 'android', 'app-dev'],
        taskTemplate: [
            { title: 'Choose mobile framework', description: 'Decide between React Native, Flutter, or native', status: 'todo' },
            { title: 'Setup development environment', description: 'Install SDKs and emulators', status: 'todo' },
            { title: 'Create app architecture', description: 'Plan navigation and state management', status: 'todo' },
            { title: 'Design app mockups', description: 'Create high-fidelity designs', status: 'todo' },
        ],
        isOfficial: true,
    },
    {
        name: 'AI/ML Research Squad',
        description: 'Explore machine learning and artificial intelligence projects',
        category: 'ai_ml',
        icon: '🤖',
        defaultRules: [
            {
                title: 'Document Everything',
                description: 'Keep detailed notes on experiments, datasets, and model performance.',
            },
            {
                title: 'Data Ethics',
                description: 'Ensure all data used is ethically sourced and properly anonymized.',
            },
            {
                title: 'Reproducibility',
                description: 'All experiments should be reproducible with clear steps and seed values.',
            },
        ],
        suggestedSkills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science', 'Statistics', 'NLP'],
        defaultTags: ['ai', 'machine-learning', 'deep-learning', 'research'],
        taskTemplate: [
            { title: 'Define problem statement', description: 'Clearly articulate the ML problem', status: 'todo' },
            { title: 'Gather and clean dataset', description: 'Collect and preprocess data', status: 'todo' },
            { title: 'Create baseline model', description: 'Implement simple model for comparison', status: 'todo' },
            { title: 'Experiment tracking setup', description: 'Setup MLflow or Weights & Biases', status: 'todo' },
        ],
        isOfficial: true,
    },
    {
        name: 'Blockchain Squad',
        description: 'Build decentralized applications and smart contracts',
        category: 'blockchain',
        icon: '⛓️',
        defaultRules: [
            {
                title: 'Security First',
                description: 'All smart contracts must be audited and tested thoroughly.',
            },
            {
                title: 'Gas Optimization',
                description: 'Optimize contracts for minimal gas costs.',
            },
            {
                title: 'Transparency',
                description: 'Maintain open source code and clear documentation.',
            },
        ],
        suggestedSkills: ['Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts', 'Cryptography'],
        defaultTags: ['blockchain', 'web3', 'defi', 'smart-contracts'],
        taskTemplate: [
            { title: 'Setup blockchain environment', description: 'Install Hardhat, Truffle, or Foundry', status: 'todo' },
            { title: 'Write smart contract specs', description: 'Define contract functions and events', status: 'todo' },
            { title: 'Implement contracts', description: 'Write and compile Solidity code', status: 'todo' },
            { title: 'Write comprehensive tests', description: 'Test all contract functions', status: 'todo' },
        ],
        isOfficial: true,
    },
    {
        name: 'Game Development Squad',
        description: 'Create engaging and fun gaming experiences',
        category: 'game',
        icon: '🎮',
        defaultRules: [
            {
                title: 'Playtest Regularly',
                description: 'Test gameplay frequently and gather feedback.',
            },
            {
                title: 'Performance Matters',
                description: 'Optimize for smooth 60 FPS gameplay.',
            },
            {
                title: 'Fun First',
                description: 'Prioritize engaging gameplay over graphics.',
            },
        ],
        suggestedSkills: ['Unity', 'Unreal Engine', 'C#', 'C++', 'Game Design', '3D Modeling'],
        defaultTags: ['game-dev', 'indie', 'unity', 'unreal'],
        taskTemplate: [
            { title: 'Define game concept', description: 'Create game design document', status: 'todo' },
            { title: 'Setup game engine', description: 'Initialize Unity or Unreal project', status: 'todo' },
            { title: 'Create core mechanics', description: 'Implement basic gameplay loop', status: 'todo' },
            { title: 'Design levels', description: 'Create initial game levels/maps', status: 'todo' },
        ],
        isOfficial: true,
    },
    {
        name: 'IoT Squad',
        description: 'Build connected devices and smart systems',
        category: 'iot',
        icon: '💡',
        defaultRules: [
            {
                title: 'Power Efficiency',
                description: 'Optimize for low power consumption in embedded systems.',
            },
            {
                title: 'Security',
                description: 'Implement secure communication protocols.',
            },
            {
                title: 'Documentation',
                description: 'Document hardware specs and wiring diagrams.',
            },
        ],
        suggestedSkills: ['Arduino', 'Raspberry Pi', 'C/C++', 'MQTT', 'Electronics', 'Python'],
        defaultTags: ['iot', 'embedded', 'hardware', 'sensors'],
        taskTemplate: [
            { title: 'Define IoT use case', description: 'Identify problem to solve', status: 'todo' },
            { title: 'Select hardware', description: 'Choose microcontroller and sensors', status: 'todo' },
            { title: 'Setup cloud backend', description: 'Configure AWS IoT or similar', status: 'todo' },
            { title: 'Prototype circuit', description: 'Build and test circuit on breadboard', status: 'todo' },
        ],
        isOfficial: true,
    },
];

const seedTemplates = async () => {
    try {
        await connectDB();

        await SquadTemplate.deleteMany({});
        console.log('Cleared existing templates');

        await SquadTemplate.insertMany(templates);
        console.log('✅ Templates seeded successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding templates:', error);
        process.exit(1);
    }
};

seedTemplates();
