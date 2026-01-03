const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        let config;

        // Try to load from a single JSON string (Render style)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.log('Using FIREBASE_SERVICE_ACCOUNT_KEY JSON string');
            config = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

            // Fix private key formatting if it was stringified poorly
            if (config.private_key) {
                config.private_key = config.private_key.replace(/\\n/g, '\n');
            }
        } else {
            // Fallback to separate variables (Local/Legacy style)
            console.log('Using individual FIREBASE environment variables');
            config = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
            };
        }

        if (!config.projectId && !config.project_id) {
            throw new Error('Firebase Project ID is missing');
        }

        admin.initializeApp({
            credential: admin.credential.cert(config),
        });

        console.log('✅ Firebase Admin initialized successfully for project:', config.projectId || config.project_id);
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
    }
}

module.exports = admin;