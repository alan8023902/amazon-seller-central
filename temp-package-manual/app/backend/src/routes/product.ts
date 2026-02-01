import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { dataService } from '../services/dataService';
import { ProductSchema, type Product, type ApiResponse, type PaginatedResponse, type ProductFilters } from '../types/index';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/products - Get products with filtering and pagination
router.get('/', asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 10, store_id } = req.query as any;
  
  let products = await dataService.readData<Product>('products');
  
  // Filter by store_id if provided
  if (store_id) {
    products = products.filter(p => p.store_id === store_id);
  }
  
  // Filter by status (ignore if undefined, null, empty string, or "undefined")
  if (status && status !== 'All' && status !== 'undefined' && status !== '') {
    products = products.filter(p => p.status === status);
  }
  
  // Filter by search term (ignore if undefined, null, empty string, or "undefined")
  if (search && search !== 'undefined' && search !== '') {
    const searchLower = search.toLowerCase();
    products = products.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.asin.toLowerCase().includes(searchLower) ||
      p.sku.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort by updated_at desc
  products.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  
  const result = await dataService.paginate(products, Number(page), Number(limit));
  
  const response: PaginatedResponse<Product> = {
    success: true,
    data: result.data,
    pagination: result.pagination,
  };
  
  res.json(response);
}));

// GET /api/products/:id - Get single product
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await dataService.findById<Product>('products', req.params.id);
  
  if (!product) {
    throw createError('Product not found', 404);
  }
  
  const response: ApiResponse<Product> = {
    success: true,
    data: product,
  };
  
  res.json(response);
}));

// POST /api/products - Create new product
router.post('/', asyncHandler(async (req, res) => {
  const productData = ProductSchema.omit({ id: true, created_at: true, updated_at: true }).parse({
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  const product = await dataService.create<Product>('products', {
    ...productData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  const response: ApiResponse<Product> = {
    success: true,
    data: product,
    message: 'Product created successfully',
  };
  
  res.status(201).json(response);
}));

// PUT /api/products/:id - Update product
router.put('/:id', asyncHandler(async (req, res) => {
  const updateData = ProductSchema.partial().parse({
    ...req.body,
    updated_at: new Date().toISOString(),
  });
  
  const product = await dataService.update<Product>('products', req.params.id, updateData);
  
  if (!product) {
    throw createError('Product not found', 404);
  }
  
  const response: ApiResponse<Product> = {
    success: true,
    data: product,
    message: 'Product updated successfully',
  };
  
  res.json(response);
}));

// DELETE /api/products/:id - Delete product
router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await dataService.delete<Product>('products', req.params.id);
  
  if (!deleted) {
    throw createError('Product not found', 404);
  }
  
  const response: ApiResponse = {
    success: true,
    message: 'Product deleted successfully',
  };
  
  res.json(response);
}));

// POST /api/products/:id/image - Upload product image
router.post('/:id/image', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createError('No image file provided', 400);
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  
  const product = await dataService.update<Product>('products', req.params.id, {
    image_url: imageUrl,
    updated_at: new Date().toISOString(),
  });
  
  if (!product) {
    throw createError('Product not found', 404);
  }
  
  const response: ApiResponse<{ 
    imageUrl: string; 
    imageFilename: string; 
    imageSize: number; 
  }> = {
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

// POST /api/products/bulk - Bulk create products
router.post('/bulk', asyncHandler(async (req, res) => {
  const { products } = req.body;
  
  if (!Array.isArray(products)) {
    throw createError('Products must be an array', 400);
  }
  
  const createdProducts: Product[] = [];
  
  for (const productData of products) {
    const validatedData = ProductSchema.omit({ id: true, created_at: true, updated_at: true }).parse({
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    const product = await dataService.create<Product>('products', {
      ...validatedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    createdProducts.push(product);
  }
  
  const response: ApiResponse<Product[]> = {
    success: true,
    data: createdProducts,
    message: `${createdProducts.length} products created successfully`,
  };
  
  res.status(201).json(response);
}));

export = router;