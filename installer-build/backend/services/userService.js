"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
exports.userService = {
    async getAllUsers(options) {
        return {
            users: [],
            total: 0,
            page: options.page,
            limit: options.limit
        };
    },
    async getUserById(id) {
        return {
            id,
            email: 'user@example.com',
            name: 'Mock User',
            createdAt: new Date().toISOString()
        };
    },
    async updateUser(id, updates) {
        return { id, ...updates, updatedAt: new Date().toISOString() };
    },
    async deleteUser(id) {
        console.log(`User ${id} deleted`);
    },
    async getUserPreferences(id) {
        return {
            userId: id,
            theme: 'dark',
            notifications: true,
            language: 'en'
        };
    },
    async updateUserPreferences(id, preferences) {
        return { userId: id, ...preferences };
    },
    async getUserStats(id) {
        return {
            userId: id,
            totalEnergyConsumed: 1250.5,
            ecoScore: 850,
            rank: 42,
            achievements: 12
        };
    },
    async getUserAchievements(id) {
        return [
            { id: 1, name: 'Energy Saver', description: 'Saved 100 kWh', unlockedAt: new Date().toISOString() },
            { id: 2, name: 'Eco Warrior', description: 'Reduced consumption by 20%', unlockedAt: new Date().toISOString() }
        ];
    },
    async getGlobalLeaderboard(options) {
        return [
            { rank: 1, name: 'EcoChampion', ecoScore: 1250, energySaved: 500.5 },
            { rank: 2, name: 'GreenWarrior', ecoScore: 1180, energySaved: 450.2 }
        ];
    },
    async getFriendsLeaderboard(userId, limit) {
        return [
            { rank: 1, name: 'Friend1', ecoScore: 950, energySaved: 300.1 },
            { rank: 2, name: 'Friend2', ecoScore: 920, energySaved: 280.5 }
        ];
    }
};
//# sourceMappingURL=userService.js.map