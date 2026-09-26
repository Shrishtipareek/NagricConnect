const express = require('express');
const router = express.Router();
const { getPublishedNotices, getNoticeById } = require('../controllers/noticeController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', getPublishedNotices);
router.get('/:id', getNoticeById);

module.exports = router;
