const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  description: { type: String, required: true },
  image: { type: String, required: false },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  comments: [{ type: Object, required: true }],
  date: {type: String, required: true},
  creatorName: {type: String, required: true},
  creatorImage: { type: String, required: true },

  likes: [{type: Object, required: true}]
});

module.exports = mongoose.model('Event', eventSchema);
// 