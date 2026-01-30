"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
let PORTS;
try {
    PORTS = require('../../config/ports');
}
catch (error) {
    PORTS = {
        backend: 3001,
        frontend: 3000,
        admin: 3002
    };
}
const CORS_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://localhost:8443',
    'http://sellercentral.amazon.com',
    'https://sellercentral.amazon.com',
    'http://admin.sellercentral.amazon.com',
    'https://admin.sellercentral.amazon.com'
];
const store_1 = __importDefault(require("./routes/store"));
const product_1 = __importDefault(require("./routes/product"));
const sales_1 = __importDefault(require("./routes/sales"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const users_1 = __importDefault(require("./routes/users"));
const voc_1 = __importDefault(require("./routes/voc"));
const auth_1 = __importDefault(require("./routes/auth"));
const communications_1 = __importDefault(require("./routes/communications"));
const accountHealth_1 = __importDefault(require("./routes/accountHealth"));
const taxInfo_1 = __importDefault(require("./routes/taxInfo"));
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || PORTS.backend;
app.use((0, cors_1.default)({
    origin: CORS_ORIGINS,
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger_1.requestLogger);
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadsDir}`);
}
app.use('/uploads', express_1.default.static(uploadsDir));
app.use('/api/auth', auth_1.default);
app.use('/api/store', store_1.default);
app.use('/api/stores', store_1.default);
app.use('/api/products', product_1.default);
app.use('/api/sales', sales_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/users', users_1.default);
app.use('/api/voc', voc_1.default);
app.use('/api/communications', communications_1.default);
app.use('/api/account-health', accountHealth_1.default);
app.use('/api/tax-info', taxInfo_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${path_1.default.join(__dirname, '../uploads')}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
if (process.env.ENABLE_HTTPS === 'true') {
    const httpsPort = process.env.HTTPS_PORT || 443;
    const certPath = path_1.default.join(__dirname, '../../certs');
    try {
        if (fs_1.default.existsSync(path_1.default.join(certPath, 'key.pem')) && fs_1.default.existsSync(path_1.default.join(certPath, 'cert.pem'))) {
            const httpsOptions = {
                key: fs_1.default.readFileSync(path_1.default.join(certPath, 'key.pem')),
                cert: fs_1.default.readFileSync(path_1.default.join(certPath, 'cert.pem'))
            };
            https_1.default.createServer(httpsOptions, app).listen(httpsPort, () => {
                console.log(`🔒 HTTPS Backend server running on https://api.sellercentral.amazon.com:${httpsPort}`);
                console.log(`🌐 Custom domain mode enabled`);
            });
        }
        else {
            console.log(`⚠️  SSL certificates not found in ${certPath}`);
            console.log(`   Certificates will be generated automatically`);
        }
    }
    catch (error) {
        console.error('❌ Failed to start HTTPS server:', error);
        console.log('   Continuing with HTTP server only...');
    }
}
module.exports = app;
