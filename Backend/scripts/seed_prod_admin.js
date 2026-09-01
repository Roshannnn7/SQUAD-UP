/**
 * ⚠️  DEPRECATED — DO NOT USE
 *
 * This file previously contained hardcoded production MongoDB credentials.
 * It has been replaced by the secure createAdminSafe.js script.
 *
 * Use instead:
 *   ADMIN_EMAIL=admin@squadup.com \
 *   ADMIN_PASSWORD=YourSecurePassword \
 *   node scripts/createAdminSafe.js
 *
 * Or:
 *   npm run create-admin-safe
 *
 * See .env.example for required environment variables.
 */

console.error('❌ This script is deprecated.');
console.error('   Use: npm run create-admin-safe');
console.error('   See: scripts/createAdminSafe.js');
process.exit(1);