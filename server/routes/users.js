const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateProfile);
router.post('/photo/like', userController.togglePhotoLike);

module.exports = router;
