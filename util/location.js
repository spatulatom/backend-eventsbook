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
    { lat: -33.8688197, lng: 151.2092955, city: "Sydney" },      // S (fixed from "Australia")
    { lat: 40.7484474, lng: -73.9871516, city: "New York" },    // N
    { lat: 51.5073509, lng: -0.1277583, city: "London" },       // L
    { lat: 48.8566969, lng: 2.3514616, city: "Paris" },         // P
    { lat: 35.6894875, lng: 139.6917064, city: "Tokyo" },       // T
    { lat: 52.2296756, lng: 21.0122287, city: "Warsaw" },       // W
    { lat: 53.3498053, lng: -6.2603097, city: "Dublin" },       // D
    { lat: 41.9027835, lng: 12.4963655, city: "Rome" },         // R
    { lat: 52.5200066, lng: 13.404954, city: "Berlin" },        // B
    { lat: 59.9138688, lng: 10.7522454, city: "Oslo" },         // O
    { lat: 45.4642035, lng: 9.1899323, city: "Milan" },         // M
    { lat: 41.0082376, lng: 28.9783589, city: "Istanbul" },     // I
    { lat: 55.6760968, lng: 12.5683371, city: "Copenhagen" },   // C
    { lat: 48.2083537, lng: 16.3725042, city: "Vienna" },       // V
    { lat: -6.2087634, lng: 106.845599, city: "Jakarta" },      // J
    { lat: 3.139003, lng: 101.686855, city: "Kuala Lumpur" },   // K
    { lat: 23.1291, lng: 113.2644, city: "Guangzhou" },         // G
    { lat: 47.3768866, lng: 8.541694, city: "Zurich" },         // Z (fixed coordinates)
    { lat: 19.4326077, lng: -99.133208, city: "Mexico City" },  // E (new: "E" for "Mexico City")
    { lat: 64.1354808, lng: -21.8954086, city: "Reykjavik" },   // H (new: "H" for "Reykjavik")
    { lat: 30.0444196, lng: 31.2357116, city: "Cairo" },        // A (new: "A" for "Cairo")
    { lat: -1.2920659, lng: 36.8219462, city: "Nairobi" },      // F (new: "F" for "Nairobi")
    { lat: 39.904211, lng: 116.407395, city: "Beijing" },       // Q (new: "Q" for "Beijing" - using "Q" as no "Q" yet)
    { lat: 25.2048493, lng: 55.2707828, city: "Dubai" },        // U (new: "U" for "Dubai")
    { lat: -34.6036844, lng: -58.3815591, city: "Buenos Aires" } // X (new: "X" for "Buenos Aires" - using "X" as no "X" yet)
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
