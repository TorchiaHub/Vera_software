"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemService = void 0;
exports.systemService = {
    async getSystemMetrics() {
        return {
            cpu: {
                usage: Math.random() * 100,
                temperature: 45 + Math.random() * 20,
                cores: 8
            },
            memory: {
                total: 16384,
                used: Math.random() * 16384,
                available: Math.random() * 16384
            },
            gpu: {
                usage: Math.random() * 100,
                temperature: 60 + Math.random() * 20,
                memory: 8192
            },
            disk: {
                read: Math.random() * 100,
                write: Math.random() * 100,
                usage: 65.5
            },
            network: {
                download: Math.random() * 1000,
                upload: Math.random() * 100
            }
        };
    },
    async getHardwareInfo() {
        return {
            cpu: {
                model: 'Intel Core i7-9700K',
                cores: 8,
                threads: 8,
                maxFrequency: 3600
            },
            gpu: {
                model: 'NVIDIA GeForce RTX 3070',
                memory: 8192,
                driver: '522.25'
            },
            memory: {
                total: 16384,
                type: 'DDR4',
                speed: 3200
            },
            storage: [
                { type: 'SSD', capacity: 512, model: 'Samsung 970 EVO' },
                { type: 'HDD', capacity: 2048, model: 'Seagate Barracuda' }
            ]
        };
    },
    async getPerformanceData(timeframe) {
        const data = [];
        const now = new Date();
        const points = timeframe === '1h' ? 60 : 24;
        for (let i = 0; i < points; i++) {
            data.push({
                timestamp: new Date(now.getTime() - i * 60000).toISOString(),
                cpu: Math.random() * 100,
                memory: Math.random() * 100,
                gpu: Math.random() * 100
            });
        }
        return data;
    },
    async getConnectedDevices() {
        return [
            {
                id: 'local-pc',
                name: 'Local PC',
                type: 'desktop',
                status: 'online',
                lastSeen: new Date().toISOString()
            }
        ];
    },
    async addDevice(deviceData) {
        return {
            id: Date.now().toString(),
            ...deviceData,
            createdAt: new Date().toISOString()
        };
    },
    async updateDevice(id, updates) {
        return {
            id,
            ...updates,
            updatedAt: new Date().toISOString()
        };
    },
    async removeDevice(id) {
        console.log(`Device ${id} removed`);
    },
    async getSystemHealth() {
        return {
            status: 'healthy',
            uptime: 86400,
            temperature: 'normal',
            performance: 'optimal',
            issues: []
        };
    },
    async getSystemStatus() {
        return {
            isMonitoring: true,
            lastUpdate: new Date().toISOString(),
            dataCollection: 'active',
            notifications: 'enabled'
        };
    },
    async getNotifications(userId) {
        return [
            {
                id: 1,
                type: 'warning',
                title: 'High CPU Usage',
                message: 'CPU usage has been above 90% for 10 minutes',
                timestamp: new Date().toISOString(),
                read: false
            }
        ];
    },
    async createNotification(notificationData) {
        return {
            id: Date.now(),
            ...notificationData,
            createdAt: new Date().toISOString(),
            read: false
        };
    },
    async markNotificationRead(id) {
        console.log(`Notification ${id} marked as read`);
    }
};
//# sourceMappingURL=systemService.js.map