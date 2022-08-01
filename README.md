# backend-'eventsbook'

This is the backend source code of a MERN app called 'eventsbook' intended as social media platform, 
deployed on Heroku.

This backend server is Node and Express, Mongoose Schemas for 'elegant MongoDB object modelling' and MongoDB for a database. It is using Google Map Platform APIs for the 'location' functionality, Amazon AWS services API for permanently storing uploaded photos, SendGrid APIs for a notification email sent to a user upon successfull account creation/changing password.
All key APIs key are stored in enviromental variables.

Multer middleware library is used for uploading multipart/form-data (photos), bcrypt library for hashing password and jsonwebtoken for creating login token.

All sorts of errors are being handled on this back nd with custom error messages sent back to the fronend futher for better UX.

