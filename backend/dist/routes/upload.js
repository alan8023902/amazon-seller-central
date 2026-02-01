"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path_1.default.join(__dirname, '../../uploads');
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `image-${uniqueSuffix}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
router.post('/', upload.single('image'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw (0, errorHandler_1.createError)('No image file provided', 400);
    }
    const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    const response = {
        success: true,
        data: {
            url: imageUrl,
            filename: req.file.filename
        },
        message: 'Image uploaded successfully'
    };
    res.json(response);
}));
module.exports = router;
