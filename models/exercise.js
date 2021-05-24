// Import MongoDB's nice driver
const mongoose = require('mongoose');

// Exercise blueprint AKA schema
const Exercises = new mongoose.Schema({
  username: String,
  userId: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date
  }
}, { versionKey: false });

// Create a model from schema and export it
module.exports = mongoose.model('Exercise', Exercises);