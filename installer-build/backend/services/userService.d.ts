export declare const userService: {
    getAllUsers(options: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<any>;
    getUserById(id: string): Promise<any>;
    updateUser(id: string, updates: any): Promise<any>;
    deleteUser(id: string): Promise<void>;
    getUserPreferences(id: string): Promise<any>;
    updateUserPreferences(id: string, preferences: any): Promise<any>;
    getUserStats(id: string): Promise<any>;
    getUserAchievements(id: string): Promise<any[]>;
    getGlobalLeaderboard(options: {
        limit: number;
        period: string;
    }): Promise<any[]>;
    getFriendsLeaderboard(userId: string, limit: number): Promise<any[]>;
};
//# sourceMappingURL=userService.d.ts.map