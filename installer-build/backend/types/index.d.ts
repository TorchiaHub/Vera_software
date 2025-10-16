export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    verified: boolean;
    role: 'user' | 'admin';
    preferences: UserPreferences;
}
export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    language: string;
    energyGoals: EnergyGoals;
    privacySettings: PrivacySettings;
}
export interface EnergyGoals {
    daily: number;
    weekly: number;
    monthly: number;
    carbonFootprint: number;
    efficiency: number;
}
export interface PrivacySettings {
    shareData: boolean;
    analytics: boolean;
    publicProfile: boolean;
}
export interface EnergyData {
    id: string;
    deviceId: string;
    userId: string;
    timestamp: string;
    metrics: SystemMetrics;
    powerConsumption: number;
    carbonFootprint: number;
}
export interface SystemMetrics {
    cpu: CPUMetrics;
    memory: MemoryMetrics;
    gpu: GPUMetrics;
    disk: DiskMetrics;
    network: NetworkMetrics;
    temperature: TemperatureMetrics;
}
export interface CPUMetrics {
    usage: number;
    temperature: number;
    frequency: number;
    cores: number;
    threads: number;
}
export interface MemoryMetrics {
    total: number;
    used: number;
    available: number;
    cached: number;
}
export interface GPUMetrics {
    usage: number;
    memory: number;
    temperature: number;
    fanSpeed: number;
}
export interface DiskMetrics {
    read: number;
    write: number;
    usage: number;
    temperature: number;
}
export interface NetworkMetrics {
    download: number;
    upload: number;
    latency: number;
}
export interface TemperatureMetrics {
    cpu: number;
    gpu: number;
    motherboard: number;
    storage: number;
}
export interface Device {
    id: string;
    name: string;
    type: 'desktop' | 'laptop' | 'mobile' | 'tablet';
    status: 'online' | 'offline' | 'idle';
    lastSeen: string;
    hardware: HardwareInfo;
    userId: string;
}
export interface HardwareInfo {
    cpu: {
        model: string;
        cores: number;
        threads: number;
        maxFrequency: number;
    };
    gpu: {
        model: string;
        memory: number;
        driver: string;
    };
    memory: {
        total: number;
        type: string;
        speed: number;
    };
    storage: StorageDevice[];
    motherboard: string;
    os: string;
}
export interface StorageDevice {
    type: 'SSD' | 'HDD' | 'NVMe';
    capacity: number;
    model: string;
    health: number;
}
export interface Notification {
    id: string;
    userId: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'energy' | 'efficiency' | 'environmental' | 'social';
    requirements: AchievementRequirement[];
    reward: {
        points: number;
        badge: string;
    };
}
export interface AchievementRequirement {
    type: string;
    value: number;
    period?: string;
}
export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    unlockedAt: string;
    progress: number;
}
export interface EnergyStats {
    period: string;
    totalConsumption: number;
    averageConsumption: number;
    peakConsumption: number;
    efficiency: number;
    carbonFootprint: number;
    cost: number;
    comparison: {
        previousPeriod: number;
        average: number;
        target: number;
    };
}
export interface Recommendation {
    id: string;
    type: 'energy' | 'performance' | 'maintenance' | 'security';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedSavings: number;
    instructions: string[];
    category: string;
}
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}
export interface PaginatedResponse<T> extends APIResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}
export interface PasswordResetRequest {
    email: string;
}
export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
}
export interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    temperature: 'normal' | 'warm' | 'hot';
    performance: 'optimal' | 'good' | 'poor';
    issues: SystemIssue[];
    lastCheck: string;
}
export interface SystemIssue {
    type: 'warning' | 'error' | 'critical';
    component: string;
    description: string;
    recommendation: string;
    timestamp: string;
}
//# sourceMappingURL=index.d.ts.map