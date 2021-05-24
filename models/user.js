// Import MongoDB's nice driver
const mongoose = require('mongoose');

// User blueprint AKA schema
const Users = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
}, { versionKey: false });

// Create a model from schema and export it
module.exports = mongoose.model('User', Users);