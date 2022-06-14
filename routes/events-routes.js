const express = require('express');
const { check } = require('express-validator');

const eventsControllers = require('../controllers/events-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// these three roues below are not token protected yet 
// there are still made unavailble(not seen) through frontend
// - they availble for example throug postman without any token :
// its jus to much hassle to write frontend requests

router.get('/', eventsControllers.getAllUsersEvents);

router.get('/:pid', eventsControllers.getEventById);

router.get('/user/:uid', eventsControllers.getEventsByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  eventsControllers.newPhoto
);

router.post(
  '/post',
  [  check('address')
  .not()
  .isEmpty(),
    check('description').isLength({ min: 2 }),
  ],
  eventsControllers.newPost
);

router.post(
  '/likes-add', eventsControllers.addLike);

  router.delete(
    '/likes-delete', eventsControllers.deleteLike);


router.patch(
  '/:pid',
  [
    check('address')
    .not()
    .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  eventsControllers.updateEvent
);

router.delete('/:pid', eventsControllers.deleteEvent);

module.exports = router;
