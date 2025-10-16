"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4173';
const corsOptions = {
    origin: [FRONTEND_URL],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-API-Key',
        'sentry-trace',
        'baggage'
    ],
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Request received`);
    next();
});
// Routes
app.use('/api', routes_1.default);
app.use((err, req, res, next) => {
    console.error('Unhandled error occurred:', err.message, err.stack);
    res.status(500).json({
        error: 'Something broke!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});
const startServer = async () => {
    try {
        console.log('🚀 Starting server...');
        // Start server
        console.log('About to call app.listen on port', PORT);
        app.listen(PORT, () => {
            console.log('✅ Server is running on port', PORT);
            console.log(`🔗 Allowed frontend origin: ${FRONTEND_URL}`);
        });
    }
    catch (startupError) {
        console.error('❌ Failed to start server:', startupError.message, startupError.stack);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map