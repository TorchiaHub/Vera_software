"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const validateEnv_1 = require("./middleware/validateEnv");
const energyRoutes_1 = __importDefault(require("./routes/energyRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const systemRoutes_1 = __importDefault(require("./routes/systemRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
dotenv_1.default.config();
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3001', 10);
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        }));
        this.app.use((0, morgan_1.default)('combined'));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(validateEnv_1.validateEnv);
    }
    initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
            });
        });
        this.app.use('/api/auth', authRoutes_1.default);
        this.app.use('/api/energy', energyRoutes_1.default);
        this.app.use('/api/users', userRoutes_1.default);
        this.app.use('/api/system', systemRoutes_1.default);
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl,
            });
        });
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 VERA Backend Server running on port ${this.port}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
        });
    }
}
if (process.env.NODE_ENV !== 'test') {
    const server = new Server();
    server.listen();
}
const serverInstance = new Server();
exports.app = serverInstance.app;
exports.default = serverInstance;
//# sourceMappingURL=server.js.map