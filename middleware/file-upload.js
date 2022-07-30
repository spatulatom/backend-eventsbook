const multer = require('multer');
const uuid = require('uuid/v1');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};
const maxSize = 1 * 1000 * 10000;
const fileUpload = multer({
  // limits: 500000,
  limits:{
    fileSize: maxSize},
    
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + '.' + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    // we are not throwing an error here yet with the icorrect mime type the bleow message
    // was show on the frontend, perhaps 'cb' throws
    let error = isValid ? null : new Error('Invalid mime type, only .png, .jpeg and .jpg types.');
    cb(error, isValid);
  }
});

module.exports = fileUpload;
