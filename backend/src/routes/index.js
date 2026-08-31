const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const messageRoutes = require('./message.routes');
const uploadRoutes = require('./upload.routes');
const scheduleRoutes = require('./schedule.routes');
const healthRoutes = require('./health.routes');
const exampleRoutes = require('./example.routes');
const itemRoutes = require('./item.routes');

const router = express.Router();

// Gom nhóm tất cả các API routes (v1)
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/messages', messageRoutes);
router.use('/upload', uploadRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/health', healthRoutes);
router.use('/items', itemRoutes);
router.use('/example', exampleRoutes);

module.exports = router;
