interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    verified: boolean;
}
interface LoginResult {
    user: User;
    accessToken: string;
    refreshToken: string;
}
export declare const authService: {
    register(userData: {
        email: string;
        password: string;
        name: string;
    }): Promise<LoginResult>;
    login(email: string, password: string): Promise<LoginResult>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    resendVerificationEmail(email: string): Promise<void>;
    getUserProfile(userId: string): Promise<User>;
    updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;
};
export {};
//# sourceMappingURL=authService.d.ts.map