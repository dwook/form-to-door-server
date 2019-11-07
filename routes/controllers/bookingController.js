const Booking = require('../../models/Booking.js');
const User = require('../../models/User.js');

exports.createBooking = async function(req, res, next) {
  try {
    console.log(req.body);
    const {
      name,
      email,
      mobile,
      age,
      gender,
      branch,
      tour_date,
      request
    } = req.body.data;

    const user = new User({
      name,
      email,
      mobile,
      age: parseInt(age, 10),
      gender
    });
    await user.save();
    console.log('유저생성', user);

    const booking = new Booking({
      branch,
      tour_date: new Date(tour_date),
      request,
      client: user
    });

    await booking.save();
    console.log('예약생성', booking);
    res.json({ user, booking });
  } catch {
    next();
  }
};
