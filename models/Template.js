const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  segment: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  text: {
    type: String
  }
});

module.exports = mongoose.model('Template', templateSchema);
