const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  referrer: {
    type: String
  },
  segment: {
    type: String,
    default: 'tourBook'
  },
  note: {
    type: String
  }
});

module.exports = mongoose.model('user', userSchema);
