// const axios = require('axios');
// const HttpError = require('../models/http-error');
/**
 * Returns fixed coordinates instead of geocoding addresses.
 * 
 * Note: Currently returns hardcoded New York coordinates to avoid 
 * using Google Maps API which requires billing information.
 * 




// we will turn this function into asyn function using async keyword 
// in front of it, it will make sure that the return value of this function 
// gets wrapped into a promise and makes sure that when you are working with promises
// in there you can use await in front of the promise  to wait for 
// its response instead of promises.then
// async function getCoordsForAddress() {

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
    // console.log('Error1 location.js')
    // // throw error;
    // return {
    //     lat: 40.7484474,
    //     lng: -73.9871516
    //   };
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

/**
 * Returns coordinates based on the first letter of the address.
 * Cities starting with 'N' return New York coordinates.
 * Other letters return coordinates for matching cities where available.
 * 
 * @param {string} address - The address to get coordinates for
 * @returns {object} - An object with lat and lng properties
 */
async function getCoordsForAddress(address = "") {
  // Define locations for different cities with unique first letters
  const locations = [
    { lat: 37.983917, lng: 23.72936, city: "Athens" },       // A
    { lat: 52.5200066, lng: 13.404954, city: "Berlin" },     // B
    { lat: 30.0444196, lng: 31.2357116, city: "Cairo" },      // C
    { lat: 53.3498053, lng: -6.2603097, city: "Dublin" },     // D
    { lat: 55.9533456, lng: -3.1883749, city: "Edinburgh" },  // E
    { lat: 43.7695604, lng: 11.2558136, city: "Florence" },   // F
    { lat: 46.2043907, lng: 6.1431577, city: "Geneva" },      // G
    { lat: 60.169857, lng: 24.9383791, city: "Helsinki" },    // H
    { lat: 41.0082376, lng: 28.9783589, city: "Istanbul" },   // I
    { lat: -6.2087634, lng: 106.845599, city: "Jakarta" },    // J
    { lat: 27.7172453, lng: 85.3239605, city: "Kathmandu" },  // K
    { lat: 51.5073509, lng: -0.1277583, city: "London" },     // L
    { lat: 55.755826, lng: 37.6172999, city: "Moscow" },      // M
    { lat: 40.7484474, lng: -73.9871516, city: "New York" },  // N
    { lat: 59.9138688, lng: 10.7522454, city: "Oslo" },       // O
    { lat: 48.8566969, lng: 2.3514616, city: "Paris" },       // P
    { lat: 46.8138783, lng: -71.2079809, city: "Quebec" },    // Q
    { lat: 41.9027835, lng: 12.4963655, city: "Rome" },       // R
    { lat: -33.8688197, lng: 151.2092955, city: "Sydney" },   // S
    { lat: 35.6894875, lng: 139.6917064, city: "Tokyo" },     // T
    { lat: 47.8863988, lng: 106.9057439, city: "Ulaanbaatar" }, // U
    { lat: 48.2083537, lng: 16.3725042, city: "Vienna" },     // V
    { lat: 52.2296756, lng: 21.0122287, city: "Warsaw" },     // W
    { lat: 34.341574, lng: 108.940175, city: "Xi'an" },       // X
    { lat: 35.4437078, lng: 139.6380256, city: "Yokohama" },  // Y
    { lat: 47.3768866, lng: 8.541694, city: "Zurich" }        // Z
  ];

  // Create a map to store unique cities by first letter
  // Only the first city for each letter will be kept
  const uniqueCities = new Map();

  for (const location of locations) {
    const firstLetter = location.city.charAt(0).toUpperCase();
    if (!uniqueCities.has(firstLetter)) {
      uniqueCities.set(firstLetter, location);
    }
  }

  // Default to New York if no address provided
  if (!address || address.trim() === "") {
    console.log("No address provided, using New York coordinates");
    return uniqueCities.get("N") || locations[0];
  }

  // Get the first letter and convert to uppercase
  const firstLetter = address.trim().charAt(0).toUpperCase();

  // If address starts with 'N', return New York coordinates
  if (firstLetter === "N") {
    console.log(`Address starts with 'N', using New York coordinates`);
    return uniqueCities.get("N") || locations[0];
  }

  // For other letters, find a city that starts with the same letter
  if (uniqueCities.has(firstLetter)) {
    const matchingCity = uniqueCities.get(firstLetter);
    console.log(`Using coordinates for ${matchingCity.city}`);
    return { lat: matchingCity.lat, lng: matchingCity.lng };
  }
  // If no matching city found, fall back to New York
  console.log(
    `No city starting with '${firstLetter}', using New York coordinates`
  );
  return uniqueCities.get("N") || locations[0];
}

module.exports = getCoordsForAddress;
