import { db } from './firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';

/**
 * Set typing indicator for a user in a chat room.
 * Auto-clears after 3 seconds of inactivity.
 */
let clearTypingTimeout = null;

export function setTyping(roomId, userId, displayName) {
    if (!db || !roomId || !userId) return;
    try {
        const typingRef = doc(db, 'typing', roomId, 'users', userId);
        setDoc(typingRef, {
            displayName,
            timestamp: serverTimestamp(),
        });

        // Auto-clear after 3 seconds
        if (clearTypingTimeout) clearTimeout(clearTypingTimeout);
        clearTypingTimeout = setTimeout(() => {
            clearTyping(roomId, userId);
        }, 3000);
    } catch (err) {
        // Silently fail if Firestore not available
    }
}

export function clearTyping(roomId, userId) {
    if (!db || !roomId || !userId) return;
    try {
        const typingRef = doc(db, 'typing', roomId, 'users', userId);
        deleteDoc(typingRef);
    } catch (err) {
        // Silently fail
    }
}

/**
 * Subscribe to typing indicators for a room.
 * Returns an unsubscribe function.
 * @param {string} roomId
 * @param {string} currentUserId - to exclude self
 * @param {(users: string[]) => void} onUpdate - called with array of display names
 */
export function subscribeToTyping(roomId, currentUserId, onUpdate) {
    if (!db || !roomId) return () => {};
    try {
        const typingCollectionRef = collection(db, 'typing', roomId, 'users');
        const unsubscribe = onSnapshot(typingCollectionRef, (snapshot) => {
            const now = Date.now();
            const typingUsers = [];
            snapshot.forEach((docSnap) => {
                if (docSnap.id === currentUserId) return;
                const data = docSnap.data();
                // Filter out stale indicators (older than 5 seconds)
                if (data.timestamp) {
                    const ts = data.timestamp.toMillis?.() || 0;
                    if (now - ts < 5000) {
                        typingUsers.push(data.displayName || 'Someone');
                    }
                }
            });
            onUpdate(typingUsers);
        });
        return unsubscribe;
    } catch (err) {
        return () => {};
    }
}

/**
 * Format typing indicator message.
 * @param {string[]} users
 */
export function formatTypingMessage(users) {
    if (!users || users.length === 0) return '';
    if (users.length === 1) return `${users[0]} is typing...`;
    if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`;
    return `${users[0]} and ${users.length - 1} others are typing...`;
}
