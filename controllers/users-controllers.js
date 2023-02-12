const { validationResult } = require('express-validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const cloudinary = require('cloudinary').v2;

// for aws
const AWS = require('aws-sdk');
const fs = require ('fs');
const uuid = require('uuid/v1');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const { ProcessCredentials } = require('aws-sdk');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async(req, res, next) => {

   // Configuration
   cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
  });

  //  see familija repository for Amazon web Services S3 bucket connection

  console.log('here');
  let response;
  let error;
  let unlinkImage = false;
  try {
    console.log('here');
    response = await cloudinary.uploader.upload(req.file.path, {
      public_id: uuid(),
    });
    unlinkImage = true;
  } catch (err) {
    error = new HttpError(
      'Connecting to Cloudinary failed, please try again in a minute.',
      500
    );
    unlinkImage = true;
    return next(error);
  }

  if(unlinkImage){
    fs.unlink(req.file.path, (err) => {
      //  its not crucial so we wont stop the execution if insuccessfull
      console.log(err);
      //   const error = new HttpError(
      //     'Could not unlink the file.',
      //     500
      //   );
      //   return next(error);
    });}
console.log('here 2', response)

  const errors = validationResult(req);
            
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User with submitted email address exists already, please login instead.',
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user (hashing password), please try again.',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: response.secure_url,
    password: hashedPassword,
    events: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'supersecret_dont_share'
      ,{ expiresIn: '365d' }
    );
  } catch (err) {
    const error = new HttpError(
      'Signing up failed (creatin token), please try again later.',
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email,token: token });

    // email is send after response so we are not blocking function execution in case 
    // sending email fails
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      // you can use here usrename as well
      api_key: process.env.SENDGRID_API_KEY
    }
  })
);
try{
  await transporter.sendMail({
    to: email,
    from: 'spatulatom@gmail.com',
    subject: 'Your account was created.',
    html: '<h2>Your account has been created on https://eventsbook-91260.web.app/ !</h2>'
  });
}catch(err){
  console.log('ERROR',err);
  return next()

}

      
      


};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
    // you need this extra if otherwise even not existing email makes this
    // try block succesull
if(!existingUser){
      const error = new HttpError(
        'User with that email address dose not exist. Create account instead!',
        403
      );
      return next(error);
    }

  } catch (err) {
    const error = new HttpError(
      'Server error, please try again in a few minutes.',
      500
    );
    return next(error);
  }



  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Incorrect password. If you do not remember your use the link below to change it.',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_dont_share',
      { expiresIn: '365d' }
    );
  } catch (err) {
    const error = new HttpError(
      'Logging in failed (token), please try again later.',
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};
 

// to reset password we need to create a uniqe token and assign it to 
// the email we will send now email which upon clcking will 
// send us back another request, so again  from that email  another request
// with that token and email of coures will be sent so we know 
// that the request we recieve is really related
// to our resetting (we cant just let users change their passwords based only 
// on giving us their email)
const reset = async (req,res,next)=>{
  // lets generate that token: import 'crypto' its a library 
  // that helps in creating secure random values - so its not 
  // a token like above we we needed id +email+ secure key, its just 
  // random value that for a while we use, we wont decode it or anything;


 
    let user;
    try{ user =
    await User.findOne({ email: req.body.email }) }
    catch (err){
       const error = new HttpError('MongoDb server error. Try again in a minute.', 500);
    return next(error);}

     // you need this extra if otherwise even not existing email makes this
    // try block succesull;
    // i think findOne dosent return a promise thats way when it fails there
    // is no error passed, 
    // why though 'await' dosent say that this function is not a promise?
    // I think what happens is that mongoose methods obviously are returnig promise
    // but the promise reject is not lack of the search value for expamle no 
    // user with provided email- no this is part of the succes function, 
    // the reject says about connection to database!
    if(!user){
      const error = new HttpError('No user with submitted email address exists.', 403);
      return next(error)
    }
  
     
    let token;
    try {
 token =await crypto.randomBytes(32).toString('hex')
    }catch{
      const error = new HttpError(
        'Creating crypto failed',
        500
      );
      return next(error);
    }
   
    user.resetToken = token;
    // 3600000 miliseconds will give us an hour
    user.resetTokenExpiration = Date.now() + 3600000;
    try {
      await user.save();
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update the user with token.',
        500
      );
      return next(error);
    }
    const transporter = nodemailer.createTransport(
      sendgridTransport({
        auth: {
          // you can use here usrename as well
          api_key: process.env.SENDGRID_API_KEY
        }
      })
    );
    try{
      await transporter.sendMail({
        to: req.body.email,
          from: 'elkom9393@gmail.com',
          subject: 'Password reset.',
          html: `
            <p>You have just requested password change. Use link below (valid for 60 minutes).</p>
            <p>Click <a href="https://eventsbook-91260.web.app/${token}">here</a> to create you new password.</p>
          `
      });
    }catch(err){
      const error = new HttpError('SendMail form creatred, but failed to send it', 401)
      return next(error)
    
    }
res.status(201).json({message: 'Check your email for the follow up instructions (perhaps your spam folder as well). The mail is titled: Password reset.'})
}

const newpassword = async(req,res,next)=>{ 
  // so into findOne we inputting two criteria for our user that we want to find
  // first one is matching token, second is the expiration date greater than ($gt) our
  // current date, only then we want to find our user
  let user;
 try{ user = await User.findOne({ 
    resetToken: req.body.token,
    // resetTokenExpiration: { $gt: Date.now() } - this check dosent seem to work
  })
  // // you need this extra if otherwise even not existing token makes this
    // try block succesull, its the same in signup and reset you need that extra check
  if(!user){
    const error = new HttpError(
      'No user with that token.',
      500
    );
    return next(error);
  }
  }
  catch (err) {
    const error = new HttpError(
      'Could not create your password, server connction error. Try again please.',
      500
    );
    return next(error);
  }


  if(user.resetTokenExpiration< Date.now()){
    const error = new HttpError('Your link (token) has expired. Try to reset your password again using your email address.', 403);
    return next(error);
  }

  let hashedPassword;
try {
  hashedPassword = await bcrypt.hash(req.body.password, 12);
} catch (err) {
  const error = new HttpError(
    'Could not have hashed your password, please try again.',
    500
  );
  return next(error);
}

user.password = hashedPassword;
user.resetToken = '';
user.resetTokenExpiration = '';
try{
  await user.save()
  
}catch(err){
  const error = new HttpError('Could not save the new (hashed) password in the database', 500)
}
res.status(201).json({message: 'Your password has been updated. Go to the Log In page now.'})

}




exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.reset = reset;
exports.newpassword = newpassword;