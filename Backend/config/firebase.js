const admin = require('firebase-admin');

let firebaseAdmin;

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_PROJECT_ID !== 'your_firebase_project_id') {
            // Normalize private key: strip wrapping quotes and replace escaped newlines
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;
            if (privateKey && ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'")))) {
                privateKey = privateKey.slice(1, -1);
            }
            privateKey = privateKey ? privateKey.replace(/\\n/g, '\n') : undefined;

            firebaseAdmin = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
            });
            console.log('Firebase Admin initialized successfully');
        } else {
            console.warn('Firebase credentials not provided or are placeholders. Firebase features will be disabled.');
        }
    } catch (error) {
        console.error('Firebase Admin initialization error:', error.message);
    }
} else {
    firebaseAdmin = admin.app();
}

module.exports = firebaseAdmin;
