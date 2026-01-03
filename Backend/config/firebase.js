const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        let config;

        // Specialized scrubber: Cleans project IDs but PROTECTS Private Key newlines
        const scrubObj = (obj) => {
            const clean = Array.isArray(obj) ? [] : {};
            for (const key in obj) {
                const lowerKey = key.toLowerCase();
                if (typeof obj[key] === 'string') {
                    if (lowerKey === 'private_key' || lowerKey === 'privatekey') {
                        // CRITICAL: Private Keys MUST have newlines. 
                        // We replace literal "\n" with real newlines and KEEP existing ones.
                        clean[key] = obj[key].trim().replace(/\\n/g, '\n');
                    } else {
                        // For Project ID and Emails, remove ALL hidden characters/newlines
                        clean[key] = obj[key].trim().replace(/[\r\n\t ]/g, "");
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
        console.log(`Initialization Check - Project ID: [${projectID}]`);

        admin.initializeApp({
            credential: admin.credential.cert(config),
        });

        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
    }
}

module.exports = admin;