const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/', messageController.sendMessage);
router.get('/:userId/:otherUserId', messageController.getMessages);

module.exports = router;
