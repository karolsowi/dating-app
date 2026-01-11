const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.post('/like', matchController.likeUser);
router.post('/pass', matchController.passUser);
router.get('/:userId', matchController.getMatches);

module.exports = router;
