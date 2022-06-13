const express = require('express');
const { check } = require('express-validator');

const commentsControllers = require('../controllers/comments-controllers');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();


router.use(checkAuth);
router.post(
    '/',
    [
      check('description').isLength({ min: 2 }),
      check('placeId')
        .not()
        .isEmpty()
    ],
    commentsControllers.createComment
  );

  module.exports = router;