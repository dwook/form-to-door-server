const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true
  },
  tour_date: {
    type: Date,
    required: true
  },
  request: {
    type: String
  },
  desired_move_date: {
    type: Date
  },
  tour_manager: {
    type: String
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
