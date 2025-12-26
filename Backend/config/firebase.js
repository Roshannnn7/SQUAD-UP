const admin = require('firebase-admin');

let firebaseAdmin;

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_PROJECT_ID !== 'your_firebase_project_id') {
            firebaseAdmin = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
