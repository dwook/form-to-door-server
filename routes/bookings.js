var express = require('express');
var router = express.Router();
const bookingController = require('./controllers/bookingController');

/* GET bookings listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', bookingController.createBooking);

module.exports = router;
