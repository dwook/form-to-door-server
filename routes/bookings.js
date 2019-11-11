var express = require('express');
var router = express.Router();
const bookingController = require('./controllers/bookingController');

/* GET bookings listing. */
router.get('/', bookingController.getBooking);

router.post('/', bookingController.createBooking);

module.exports = router;
