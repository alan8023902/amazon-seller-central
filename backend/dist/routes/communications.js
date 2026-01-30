"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.get('/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    try {
        const decodedStoreId = decodeURIComponent(storeId);
        const filePath = require('path').join(__dirname, '../../data/communications.json');
        const communicationsData = require('fs-extra').readJsonSync(filePath);
        let storeComms = communicationsData[decodedStoreId] || communicationsData[storeId];
        if (!storeComms) {
            console.log(`Creating default communications data for store: ${decodedStoreId}`);
            storeComms = {
                seller_forums: [
                    {
                        id: `forum-${decodedStoreId}-1`,
                        title: "Welcome to Seller Forums",
                        author: "Amazon Team",
                        views: 1234,
                        replies: 56,
                        likes: 78,
                        category: "General",
                        created_at: new Date().toISOString(),
                        last_activity: new Date().toISOString(),
                        is_pinned: true,
                        is_solved: false
                    }
                ],
                seller_news: [
                    {
                        id: `news-${decodedStoreId}-1`,
                        title: "Latest Updates for Sellers",
                        author: "Amazon News",
                        views: 2345,
                        likes: 123,
                        category: "Updates",
                        created_at: new Date().toISOString(),
                        is_featured: true
                    }
                ]
            };
        }
        const transformedData = [];
        if (storeComms.seller_forums) {
            storeComms.seller_forums.forEach((forum) => {
                transformedData.push({
                    ...forum,
                    post_type: 'FORUM',
                    post_date: forum.created_at,
                    comments: forum.replies
                });
            });
        }
        if (storeComms.seller_news) {
            storeComms.seller_news.forEach((news) => {
                transformedData.push({
                    ...news,
                    post_type: 'NEWS',
                    post_date: news.created_at,
                    comments: news.likes
                });
            });
        }
        const response = {
            success: true,
            data: transformedData,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Communications error:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch communications data', 500);
    }
}));
router.get('/:storeId/admin', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    try {
        const decodedStoreId = decodeURIComponent(storeId);
        const filePath = require('path').join(__dirname, '../../data/communications.json');
        const communicationsData = require('fs-extra').readJsonSync(filePath);
        let storeComms = communicationsData[decodedStoreId] || communicationsData[storeId];
        if (!storeComms) {
            console.log(`Creating default communications data for store: ${decodedStoreId}`);
            storeComms = {
                seller_forums: [
                    {
                        id: `forum-${decodedStoreId}-1`,
                        title: "Welcome to Seller Forums",
                        author: "Amazon Team",
                        views: 1234,
                        replies: 56,
                        likes: 78,
                        category: "General",
                        created_at: new Date().toISOString(),
                        last_activity: new Date().toISOString(),
                        is_pinned: true,
                        is_solved: false
                    }
                ],
                seller_news: [
                    {
                        id: `news-${decodedStoreId}-1`,
                        title: "Latest Updates for Sellers",
                        author: "Amazon News",
                        views: 2345,
                        likes: 123,
                        category: "Updates",
                        created_at: new Date().toISOString(),
                        is_featured: true
                    }
                ]
            };
        }
        const response = {
            success: true,
            data: storeComms,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Communications admin error:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch communications data', 500);
    }
}));
router.get('/:storeId/forums', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { page = 1, limit = 10, category } = req.query;
    try {
        const communicationsData = await dataService_1.dataService.readData('communications');
        const storeComms = communicationsData[storeId];
        if (!storeComms || !storeComms.seller_forums) {
            throw (0, errorHandler_1.createError)('Forums data not found', 404);
        }
        let forums = storeComms.seller_forums;
        if (category && category !== 'All') {
            forums = forums.filter((forum) => forum.category === category);
        }
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedForums = forums.slice(startIndex, endIndex);
        const response = {
            success: true,
            data: paginatedForums,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: forums.length,
                pages: Math.ceil(forums.length / Number(limit))
            }
        };
        res.json(response);
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Failed to fetch forums data', 500);
    }
}));
router.get('/:storeId/news', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { page = 1, limit = 10, category } = req.query;
    try {
        const communicationsData = await dataService_1.dataService.readData('communications');
        const storeComms = communicationsData[storeId];
        if (!storeComms || !storeComms.seller_news) {
            throw (0, errorHandler_1.createError)('News data not found', 404);
        }
        let news = storeComms.seller_news;
        if (category && category !== 'All') {
            news = news.filter((item) => item.category === category);
        }
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedNews = news.slice(startIndex, endIndex);
        const response = {
            success: true,
            data: paginatedNews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: news.length,
                pages: Math.ceil(news.length / Number(limit))
            }
        };
        res.json(response);
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Failed to fetch news data', 500);
    }
}));
router.put('/:storeId/forums/:forumId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId, forumId } = req.params;
    const updateData = req.body;
    try {
        const filePath = require('path').join(__dirname, '../../data/communications.json');
        const communicationsData = require('fs-extra').readJsonSync(filePath);
        const decodedStoreId = decodeURIComponent(storeId);
        const storeComms = communicationsData[decodedStoreId] || communicationsData[storeId];
        if (!storeComms || !storeComms.seller_forums) {
            throw (0, errorHandler_1.createError)('Forums data not found', 404);
        }
        const forumIndex = storeComms.seller_forums.findIndex((f) => f.id === forumId);
        if (forumIndex === -1) {
            throw (0, errorHandler_1.createError)('Forum post not found', 404);
        }
        storeComms.seller_forums[forumIndex] = {
            ...storeComms.seller_forums[forumIndex],
            ...updateData,
            id: forumId,
            last_activity: new Date().toISOString()
        };
        require('fs-extra').writeJsonSync(filePath, communicationsData, { spaces: 2 });
        const response = {
            success: true,
            data: storeComms.seller_forums[forumIndex],
            message: 'Forum post updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update forum error:', error);
        throw (0, errorHandler_1.createError)('Failed to update forum post', 500);
    }
}));
router.put('/:storeId/news/:newsId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId, newsId } = req.params;
    const updateData = req.body;
    try {
        const filePath = require('path').join(__dirname, '../../data/communications.json');
        const communicationsData = require('fs-extra').readJsonSync(filePath);
        const decodedStoreId = decodeURIComponent(storeId);
        const storeComms = communicationsData[decodedStoreId] || communicationsData[storeId];
        if (!storeComms || !storeComms.seller_news) {
            throw (0, errorHandler_1.createError)('News data not found', 404);
        }
        const newsIndex = storeComms.seller_news.findIndex((n) => n.id === newsId);
        if (newsIndex === -1) {
            throw (0, errorHandler_1.createError)('News item not found', 404);
        }
        storeComms.seller_news[newsIndex] = {
            ...storeComms.seller_news[newsIndex],
            ...updateData,
            id: newsId,
            published_at: storeComms.seller_news[newsIndex].published_at
        };
        require('fs-extra').writeJsonSync(filePath, communicationsData, { spaces: 2 });
        const response = {
            success: true,
            data: storeComms.seller_news[newsIndex],
            message: 'News item updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update news error:', error);
        throw (0, errorHandler_1.createError)('Failed to update news item', 500);
    }
}));
router.post('/:storeId/forums/:forumId/like', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId, forumId } = req.params;
    try {
        const communicationsData = await dataService_1.dataService.readData('communications');
        const storeComms = communicationsData[storeId];
        if (!storeComms || !storeComms.seller_forums) {
            throw (0, errorHandler_1.createError)('Forums data not found', 404);
        }
        const forum = storeComms.seller_forums.find((f) => f.id === forumId);
        if (!forum) {
            throw (0, errorHandler_1.createError)('Forum post not found', 404);
        }
        forum.likes += 1;
        await dataService_1.dataService.writeData('communications', communicationsData);
        const response = {
            success: true,
            data: { likes: forum.likes },
            message: 'Forum post liked successfully'
        };
        res.json(response);
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Failed to like forum post', 500);
    }
}));
router.post('/:storeId/news/:newsId/like', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId, newsId } = req.params;
    try {
        const communicationsData = await dataService_1.dataService.readData('communications');
        const storeComms = communicationsData[storeId];
        if (!storeComms || !storeComms.seller_news) {
            throw (0, errorHandler_1.createError)('News data not found', 404);
        }
        const news = storeComms.seller_news.find((n) => n.id === newsId);
        if (!news) {
            throw (0, errorHandler_1.createError)('News item not found', 404);
        }
        news.likes += 1;
        await dataService_1.dataService.writeData('communications', communicationsData);
        const response = {
            success: true,
            data: { likes: news.likes },
            message: 'News item liked successfully'
        };
        res.json(response);
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Failed to like news item', 500);
    }
}));
module.exports = router;
