"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const dataService_1 = require("../services/dataService");
const index_1 = require("../types/index");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, search, page = 1, limit = 10, store_id } = req.query;
    let products = await dataService_1.dataService.readData('products');
    if (store_id) {
        products = products.filter(p => p.store_id === store_id);
    }
    if (status && status !== 'All' && status !== 'undefined' && status !== '') {
        products = products.filter(p => p.status === status);
    }
    if (search && search !== 'undefined' && search !== '') {
        const searchLower = search.toLowerCase();
        products = products.filter(p => p.title.toLowerCase().includes(searchLower) ||
            p.asin.toLowerCase().includes(searchLower) ||
            p.sku.toLowerCase().includes(searchLower));
    }
    products.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const result = await dataService_1.dataService.paginate(products, Number(page), Number(limit));
    const response = {
        success: true,
        data: result.data,
        pagination: result.pagination,
    };
    res.json(response);
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const product = await dataService_1.dataService.findById('products', req.params.id);
    if (!product) {
        throw (0, errorHandler_1.createError)('Product not found', 404);
    }
    const response = {
        success: true,
        data: product,
    };
    res.json(response);
}));
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const productData = index_1.ProductSchema.omit({ id: true, created_at: true, updated_at: true }).parse({
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });
    const product = await dataService_1.dataService.create('products', {
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });
    const response = {
        success: true,
        data: product,
        message: 'Product created successfully',
    };
    res.status(201).json(response);
}));
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const updateData = index_1.ProductSchema.partial().parse({
        ...req.body,
        updated_at: new Date().toISOString(),
    });
    const product = await dataService_1.dataService.update('products', req.params.id, updateData);
    if (!product) {
        throw (0, errorHandler_1.createError)('Product not found', 404);
    }
    const response = {
        success: true,
        data: product,
        message: 'Product updated successfully',
    };
    res.json(response);
}));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const deleted = await dataService_1.dataService.delete('products', req.params.id);
    if (!deleted) {
        throw (0, errorHandler_1.createError)('Product not found', 404);
    }
    const response = {
        success: true,
        message: 'Product deleted successfully',
    };
    res.json(response);
}));
router.post('/:id/image', upload.single('image'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw (0, errorHandler_1.createError)('No image file provided', 400);
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const product = await dataService_1.dataService.update('products', req.params.id, {
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
    });
    if (!product) {
        throw (0, errorHandler_1.createError)('Product not found', 404);
    }
    const response = {
        success: true,
        data: {
            imageUrl,
            imageFilename: req.file.filename,
            imageSize: req.file.size
        },
        message: 'Image uploaded successfully',
    };
    res.json(response);
}));
router.post('/bulk', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { products } = req.body;
    if (!Array.isArray(products)) {
        throw (0, errorHandler_1.createError)('Products must be an array', 400);
    }
    const createdProducts = [];
    for (const productData of products) {
        const validatedData = index_1.ProductSchema.omit({ id: true, created_at: true, updated_at: true }).parse({
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        const product = await dataService_1.dataService.create('products', {
            ...validatedData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        createdProducts.push(product);
    }
    const response = {
        success: true,
        data: createdProducts,
        message: `${createdProducts.length} products created successfully`,
    };
    res.status(201).json(response);
}));
module.exports = router;
