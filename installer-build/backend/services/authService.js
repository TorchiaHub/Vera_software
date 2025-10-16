"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
exports.authService = {
    async register(userData) {
        const user = {
            id: Date.now().toString(),
            email: userData.email,
            name: userData.name,
            createdAt: new Date().toISOString(),
            verified: false
        };
        return {
            user,
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
        };
    },
    async login(email, password) {
        const user = {
            id: '1',
            email,
            name: 'Mock User',
            createdAt: new Date().toISOString(),
            verified: true
        };
        return {
            user,
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
        };
    },
    async refreshToken(refreshToken) {
        return {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token'
        };
    },
    async forgotPassword(email) {
        console.log(`Password reset email sent to ${email}`);
    },
    async resetPassword(token, newPassword) {
        console.log(`Password reset for token: ${token}`);
    },
    async changePassword(userId, currentPassword, newPassword) {
        console.log(`Password changed for user: ${userId}`);
    },
    async verifyEmail(token) {
        console.log(`Email verified with token: ${token}`);
    },
    async resendVerificationEmail(email) {
        console.log(`Verification email resent to: ${email}`);
    },
    async getUserProfile(userId) {
        return {
            id: userId,
            email: 'user@example.com',
            name: 'Mock User',
            createdAt: new Date().toISOString(),
            verified: true
        };
    },
    async updateUserProfile(userId, updates) {
        return {
            id: userId,
            email: 'user@example.com',
            name: updates.name || 'Updated User',
            createdAt: new Date().toISOString(),
            verified: true
        };
    }
};
//# sourceMappingURL=authService.js.map