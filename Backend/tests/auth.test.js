'use strict';

const request  = require('supertest');
const mongoose = require('mongoose');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');

const app          = require('../server'); // Express app instance
const User         = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

describe('PR-1 Auth Hardening Test Suite', () => {
    let testUser;
    const testPassword = 'Password123!';

    beforeAll(async () => {
        // Setup test user
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        testUser = await User.create({
            email: 'authtest@squadup.dev',
            password: hashedPassword,
            fullName: 'Auth Test User',
            role: 'student',
        });
    });

    afterAll(async () => {
        // Cleanup test data
        await User.deleteMany({ email: 'authtest@squadup.dev' });
        await RefreshToken.deleteMany({ user: testUser._id });
        await mongoose.connection.close();
    });

    describe('1. Login & Token Generation', () => {
        it('should issue short-lived access token and DB-backed refresh token on valid login', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testPassword,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('refreshToken');

            // Verify access token payload & short expiration
            const decoded = jwt.decode(res.body.token);
            expect(decoded.id).toBe(testUser._id.toString());
            // Expire time minus issue time should equal 900s (15 min)
            expect(decoded.exp - decoded.iat).toBeLessThanOrEqual(900);

            // Verify RefreshToken record in DB
            const dbToken = await RefreshToken.findOne({ token: res.body.refreshToken });
            expect(dbToken).not.toBeNull();
            expect(dbToken.user.toString()).toBe(testUser._id.toString());
            expect(dbToken.isRevoked).toBe(false);
        });

        it('should reject invalid credentials without exposing details', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword!',
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });
    });

    describe('2. Refresh Token Rotation & Reuse Detection', () => {
        let initialRefreshToken;
        let rotatedRefreshToken;

        beforeEach(async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testPassword,
                });
            initialRefreshToken = loginRes.body.refreshToken;
        });

        it('should rotate refresh token and issue new access token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: initialRefreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body.refreshToken).not.toBe(initialRefreshToken);

            rotatedRefreshToken = res.body.refreshToken;

            // Check DB: old token should be revoked
            const oldDbToken = await RefreshToken.findOne({ token: initialRefreshToken });
            expect(oldDbToken.isRevoked).toBe(true);

            // Check DB: new token should be active
            const newDbToken = await RefreshToken.findOne({ token: rotatedRefreshToken });
            expect(newDbToken.isRevoked).toBe(false);
        });

        it('should trigger reuse detection when attempting to reuse an already-revoked refresh token', async () => {
            // First rotation
            const firstRotate = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: initialRefreshToken });
            
            const activeToken = firstRotate.body.refreshToken;

            // Attempt reuse of initialRefreshToken
            const reuseAttempt = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: initialRefreshToken });

            expect(reuseAttempt.statusCode).toBe(401);
            expect(reuseAttempt.body.message).toContain('Token reuse detected');

            // All tokens for the user should now be revoked
            const activeDbToken = await RefreshToken.findOne({ token: activeToken });
            expect(activeDbToken.isRevoked).toBe(true);
        });
    });

    describe('3. Logout & Token Revocation', () => {
        it('should revoke refresh token on logout', async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testPassword,
                });

            const { token, refreshToken } = loginRes.body;

            const logoutRes = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .send({ refreshToken });

            expect(logoutRes.statusCode).toBe(200);

            // Verify in DB that token is revoked
            const dbToken = await RefreshToken.findOne({ token: refreshToken });
            expect(dbToken.isRevoked).toBe(true);

            // Attempting to refresh with revoked token should fail
            const refreshRes = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });

            expect(refreshRes.statusCode).toBe(401);
        });
    });
});
