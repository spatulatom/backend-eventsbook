const axios = require('axios');
const HttpError = require('../models/http-error');




// we will turn this function into asyn function using async keyword 
// in front of it, it will make sure that the return value of this function 
// gets wrapped into a promise and makes sure that when you are working with promises
// in there you can use await in front of the promise  to wait for 
// its response instead of promises.then
async function getCoordsForAddress() {

  // try{
  // const response = await axios.get(
  //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  //     address
  //   )}&key=${process.env.GOOGLE_API_KEY}`
    
  // );
  //   const data = response.data;

  // google will give us data.status==='Zero-results' if no coordinates where found
  // for the given address, so basically this covers the scenario that user
  // typed in valid adress that simply wasnt found
  // if (!data || data.status === 'ZERO_RESULTS') {
  //   const error = new HttpError(
  //     'Could not find location for the specified address.',
  //     422
  //   );
    // if we throw an error execytion will stop, we dont want that
    console.log('Error1 location.js',error)
    // throw error;
    return {
        lat: 40.7484474,
        lng: -73.9871516
      };
//   }
//     const coordinates = data.results[0].geometry.location;
//     return coordinates;
// } catch(err){
//   const error = new HttpError(
//     'No connection to google maps',
//     500
//   );
//   console.log('ERROR2',err, error)

//   // throw error;
//   return {
//     lat: 40.7484474,
//     lng: -73.9871516
//   };
  
//   }
}

module.exports = getCoordsForAddress;
