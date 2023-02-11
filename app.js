const fs = require('fs');
const path = require('path');
// const nestjs = require ('@nestjs/cli');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const eventsRoutes = require('./routes/events-routes');
const usersRoutes = require('./routes/users-routes');
const commentsRoutes = require('./routes/comments-routes');
const HttpError = require('./models/http-error');
const { MulterError } = require('multer');

// intrestingly in my portfolio backend had to use cors
// module for preventog preflight request stoppage:
// https://expressjs.com/en/resources/middleware/cors.html#enabling-cors-pre-flight

const app = express();

app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/comments', commentsRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  console.log('ERRORR', error);
  if (error instanceof MulterError) {
    // https://github.com/expressjs/multer/issues/602
    // note that 'invalid meme type' is still handled separetly and is not catched here
    // as MulterError, gies straight to the bottom
    error.code = 413;
    error.message =
      'Image too large, max size is 10mb! Upload smaller image please.';
  }
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  // So when you add a custom error handler, you must delegate to the default Express error handler, when
  // the headers have already been sent to the client:
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@freecluster.qqg7h.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
