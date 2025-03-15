const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/send', chatController.sendMessage);
router.get('/messages/:sender/:receiver', chatController.getMessages);

module.exports = router;
