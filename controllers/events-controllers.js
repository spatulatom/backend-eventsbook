const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Event = require('../models/event');
const User = require('../models/user');

const AWS = require('aws-sdk');
// const { response } = require('express');
const fs = require ('fs');
const uuid = require('uuid/v1');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');


const addLike = async(req,res,next) => {
    let user;
    try {
      user = await User.findById(req.userData.userId);
    } catch (err) {
      const error = new HttpError(
        'No connection to Mongodb 1, addLike',
        500
      );
      return next(error);
    }

    if (!user) {
      const error = new HttpError('Could not find user for provided id.', 404);
      return next(error);
    }

    let event;
    try {
        event = await Event.findById(req.body.placeId);
      } catch (err) {
        const error = new HttpError(
          'No connection no MongoBd 2, addLike, please try again.',
          500
        );
        return next(error);
      }
    
      if (!event) {
          const error = new HttpError('Could not find event for provided id.', 404);
          return next(error);
          }

          let like = {name: user.name,
                      userId: user.id}
          event.likes.push(like);

          try {
            await event.save();
          } catch (err) {
            const error = new HttpError(
              'Adding like failed.',
              500
            ); 

            return next(error);

          }
          const likes = event.toObject({ getters: true }).likes;
          // res.status(200).json({ likes: place.toObject({ getters: true }) });
          res.status(201).json(likes);
          console.log("success addedlike")
}

const deleteLike = async(req,res,next) => {
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'No connection to Mongodb 1, addLike',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  let event;
  try {
      event = await Event.findById(req.body.placeId);
    } catch (err) {
      const error = new HttpError(
        'No connection no MongoBd 2, addLike, please try again.',
        500
      );
      return next(error);
    }
  
    if (!event) {
        const error = new HttpError('Could not find event for provided id.', 404);
        return next(error);
        }

        let like = {name: user.name,
                    userId: user.id}
        event.likes.pull(like);

        try {
          await event.save();
        } catch (err) {
          const error = new HttpError(
            'Deleting like failed.',
            500
          ); 

          return next(error);

        }
// for some reson if: res.status(200).json({ likes: place.toObject({ getters: true }) }); is
// returned we get likes before deletion, even though the are accutally deleted in database;
// so for now i will get the place again and call it place two ande return:
// (this might have to do sth with the pull method compared to push method)
    let event2;
  try {
    event2 = await Event.findById(req.body.placeId);
  } catch (err) {
    const error = new HttpError(
      'No connection no MongoBd 2, addLike, please try again.',
      500
    );
    return next(error);
  }

  if (!event2) {
      const error = new HttpError('Could not find event for provided id.', 404);
      return next(error);
      }


      const likes = event2.toObject({ getters: true }).likes;
      res.status(200).json(likes)
        // res.status(200).json({ likes: place2.toObject({ getters: true }) });
        console.log("success delete")
}


const getAllUsersEvents = async(req,res,next)=>{
  let events;
  try {
    events = await Event.find();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, server error.',
      500
    );
    return next(error);
  }

  if (!events) {
    const error = new HttpError(
      'There is no events to fetch on MongoDb.',
      404
    );
    return next(error);
  }

  res.json({ foundevents: events.map(event=>event.toObject({getters:true})) });
};

const getEventById = async (req, res, next) => {
  let eventId = req.params.pid;

  let event;
  try {
    event = await Event.findById(eventId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, no connection to MongoDb.',
      500
    );
    return next(error);
  }


  if (!event) {
    const error = new HttpError(
      'Could not find event for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ event: event.toObject({ getters: true }) });
};

const getEventsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithEvents;
  try {
    userWithEvents = await User.findById(userId).populate('events');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithEvents || userWithEvents.events.length === 0) {
    return next(
      new HttpError('Could not find events for the provided user id.', 404)
    );
  }

  

  res.json({
    events: userWithEvents.events.map(event =>
      event.toObject({ getters: true })
    )
  });
};


const newPost = async(req,res,next) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
  
    const {description,address} = req.body;
  
    let coordinates;
    try {
      coordinates = await getCoordsForAddress(address);
    } catch (error) {
      return next(error);
    }
  
    
  let user;
    try {
      user = await User.findById(req.userData.userId);
    } catch (err) {
      const error = new HttpError(
        'Creating new post failed, server error, please try again in a minute.',
        500
      );
      return next(error);
    }
  
    if (!user) {
      const error = new HttpError('Could not find user for provided id.', 404);
      return next(error);
    }

                    let date;
                    let localDate;
                    date = new Date();
                    // localDate = new Intl.DateTimeFormat('pl-PL',{ dateStyle: 'full', timeStyle: 'short' }).format(date)
                    localDate = new Intl.DateTimeFormat('en-GB',{ dateStyle: 'medium', timeStyle: 'short' }).format(date)
  
    const newPost = new Event({
      description,
      address,
      location: coordinates,
      // image: 'decoy-image',
      creator: req.userData.userId,
      date: localDate,
      creatorName: user.name,
      creatorImage: user.image,
      comments: [],
      likes: []
    });
  
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await newPost.save({ session: sess });
      user.events.push(newPost);
      await user.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        'Creating new post failed, please try again.',
        500
      );
      return next(error);
    }
    // adding creators image

    res.status(201).json({ post: newPost });
}


const newPhoto =  (req, res, next) => {
//  logic for aws:
    const s3 = new AWS.S3({
      secretAccessKey: process.env.AWS_SECRET_KEY,
      accessKeyId: process.env.AWS_KEY_ID,
    })
  
    // worth notin is that not every asynchronus function rteurns a promise
    // like fs.readFile is not a promise and it is asynchronus, so using 
    // await (and async above before (req,res, next) on it wont work, it would have to be promisified
    // /check codecademy  on promises, shows how to promisify a function
    readfile=  fs.readFile(req.file.path, (err, fileBody) => {
        console.log('here') ;
        if(err) {
           console.log("Error2", err);
           const error = new HttpError(
            'Reading image file failed by fs.readFile.',
            422
          );
          return next(error)
        }  else {
            let params = {
                ACL: "public-read-write",
                Bucket: 'eventsbook22',
                Body: fileBody,
                ContentType: req.file.mimetype,
                Key: uuid()
            };
           console.log('here') ;
            s3.upload(params, async (err, result) => {
                if(err) {
                   console.log("Error3", err);
                   return next(
                    new HttpError(err, err.statusCode)
                  );
                } else {
                    
                   console.log("S3 Response",result.Location);
                     result.Location;
                   
                   
//  here we have original coding for createPlace
                   const errors = validationResult(req);
                   if (!errors.isEmpty()) {
                     return next(
                       new HttpError('Invalid inputs passed, please check your data.', 422)
                     );
                   }
                 
                   const {description, address } = req.body;
                 
                   let coordinates;
                   try {
                    console.log('bla');
                     coordinates = await getCoordsForAddress(address);
                     console.log('bla2');
                   } catch (error) {
                    console.log('bla3', error);
                    // we dont want execution stopped here and in any case all errors
                    // are hnandled inside getCoordsForAddress and 
                     return next();
                   }
                   
                   console.log('bla4');
                 let user;
                   try {
                     user = await User.findById(req.userData.userId);
                   } catch (err) {
                     const error = new HttpError(
                       'Creating new photo failed1, please try again.',
                       500
                     );
                     return next(error);
                   }
                 
                   if (!user) {
                     const error = new HttpError('Could not find user for provided id.', 404);
                     return next(error);
                   }

                    let date;
                    let localDate;
                    
                    // when deploy on Heroku we get -1h
                    date = new Date();
                    // localDate = new Intl.DateTimeFormat('pl-PL',{ dateStyle: 'medium', timeStyle: 'short' }).format(date)
                    localDate = new Intl.DateTimeFormat('en-GB',{ dateStyle: 'medium', timeStyle: 'short' }).format(date)
                    
                    const newPhoto = new Event({
                     description,
                     address,
                     location: coordinates,
                     image: result.Location,
                     creator: req.userData.userId,
                     date: localDate,
                     creatorName: user.name,
                     comments: [],
                     creatorImage: user.image,
                     likes: []
                   });
                 
                 
                   try {
                     const sess = await mongoose.startSession();
                     sess.startTransaction();
                     await newPhoto.save({ session: sess });
                     user.events.push(newPhoto);
                     await user.save({ session: sess });
                     await sess.commitTransaction();
                   } catch (err) {
                     const error = new HttpError(
                       'Creating new photo failed2, please try again.',
                       500
                     );
                     return next(error);
                   }

                   fs.unlink(req.file.path, err => {
                    //  its not crucial so we wont stop the execution if insuccessfull
                    console.log(err);
                  //   const error = new HttpError(
                  //     'Could not unlink the file.',
                  //     500
                  //   );
                  //   return next(error);
                  });
                 
                   res.status(201).json({ photo: newPhoto });
                  }
            })
            
        }
    });

};



const updateEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {description, address } = req.body;
  const eventId = req.params.pid;

  let event;
  try {
    event = await Event.findById(eventId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, try again in a minute please.',
      500
    );
    return next(error);
  }


  // we re converting creator toString() otherwise the comparison
  // wont work, why? Because what we geeting from mongo here is 
  // this mongoose special object which looks like object but its not really
  // (and whenever we res.send it we need to do this toObject method)
  if (event.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this event.', 401);
    return next(error);
  }

  
  event.description = description;
   
  let coordinates;
  try {
   console.log('bla');
    coordinates = await getCoordsForAddress(address);
    console.log('bla2');
  } catch (error) {
   console.log('bla3', error);
   
    return next();
  }
  event.location = coordinates;
  event.address=address;


  try {
    await event.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong2, could not update event.',
      500
    );
    return next(error);
  }
 
  res.status(200).json({ event: event.toObject({ getters: true }) });
};

const deleteEvent = async (req, res, next) => {
  const eventId = req.params.pid;

  let event;
  try {
    event = await Event.findById(eventId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong1, could not delete event.',
      500
    );
    return next(error);
  }

  if (!event) {
    const error = new HttpError('Could not find event for this id.', 404);
    return next(error);
  }

  // we dont need to call toString here because this id getter (throug populate)
  // is already returning a string here
  if (event.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this event.',
      401
    );
    return next(error);
  }
 
 
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await event.remove({ session: sess });
    event.creator.events.pull(event);
    await event.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong2, could not delete this event.',
      500
    );
    return next(error);
  }
  let imagePath;
  if(event.image){
    imagePath = event.image;
    fs.unlink(imagePath, err => {
    console.log(err);
  });}

  res.status(200).json({ message: 'Deleted place.' });
};
exports.getAllUsersEvents =getAllUsersEvents;
exports.getEventById = getEventById;
exports.getEventsByUserId = getEventsByUserId;
exports.newPhoto = newPhoto;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.newPost = newPost;
exports.addLike = addLike;
exports.deleteLike = deleteLike;
