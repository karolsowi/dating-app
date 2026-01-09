const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.post('/like', matchController.likeUser);
router.get('/:userId', matchController.getMatches);

module.exports = router;
