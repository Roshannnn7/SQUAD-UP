const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        let config;

        // Recursive scrubber to remove ALL hidden characters/newlines from config strings
        const scrubObj = (obj) => {
            const clean = Array.isArray(obj) ? [] : {};
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    // Remove ALL whitespace and newlines for most keys
                    clean[key] = obj[key].trim().replace(/[\r\n\t]/g, "");
                    // Special case: Preserve internal newlines ONLY for private_key
                    if (key.toLowerCase() === 'private_key') {
                        clean[key] = obj[key].trim().replace(/\\n/g, '\n');
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    clean[key] = scrubObj(obj[key]);
                } else {
                    clean[key] = obj[key];
                }
            }
            return clean;
        };

        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.log('--- FIREBASE INITIALIZATION: JSON MODE ---');
            const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
            config = scrubObj(JSON.parse(raw));
        } else {
            console.log('--- FIREBASE INITIALIZATION: INDIVIDUAL MODE ---');
            config = scrubObj({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY
            });
        }

        const projectID = config.projectId || config.project_id;
        console.log(`Final scrubbing check - Project ID: [${projectID}]`);

        admin.initializeApp({
            credential: admin.credential.cert(config),
        });

        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
    }
}

module.exports = admin;