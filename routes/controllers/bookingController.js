const Booking = require('../../models/Booking.js');
const User = require('../../models/User.js');

const dayjs = require('dayjs');
const sms = require('../modules/sms.js');
const gcalendar = require('../modules/gcalendar.js');

exports.createBooking = async function(req, res, next) {
  try {
    console.log(req.body.data);
    const {
      name,
      email,
      mobile,
      age,
      gender,
      branch,
      tour_date,
      request,
      segment
    } = req.body.data;

    let user = await User.findOne({
      mobile: mobile
    });

    console.log('유저확인', user);

    if (!user) {
      user = new User({
        name,
        email,
        mobile,
        age: parseInt(age, 10),
        gender,
        segment
      });
      await user.save();
      console.log('유저생성', user);
    }

    const booking = new Booking({
      branch,
      tour_date: new Date(tour_date),
      request,
      client: user
    });
    await booking.save();
    console.log('예약생성', booking);

    if (name !== 'manager') {
      // sms 전송
      // await sms('tourBook', mobile, name, branch, tour_date);
      // 구글 캘린더 저장
      await gcalendar(mobile, name, branch, tour_date);
    }

    res.json({ user, booking });
  } catch {
    next();
  }
};

exports.getBooking = async function(req, res, next) {
  try {
    console.log(req.query);
    console.log(
      dayjs(new Date(req.query.begin))
        .startOf('day')
        .toDate(),
      dayjs(new Date(req.query.end))
        .endOf('day')
        .toDate()
    );

    const queryString = {};

    if (req.query.client) {
      queryString.client = req.query.client;
    }
    if (req.query.branch) {
      queryString.branch = req.query.branch;
    }
    if (req.query.begin && req.query.end) {
      queryString.tour_date = {
        $gte: dayjs(new Date(req.query.begin))
          .startOf('day')
          .toDate(),
        $lte: dayjs(new Date(req.query.end))
          .endOf('day')
          .toDate()
      };
    }
    console.log('쿼리', queryString);

    const bookings = await Booking.find(queryString)
      .populate({ path: 'client', model: User })
      .sort({ tour_date: 1 })
      .exec();

    console.log(bookings);
    res.json({ bookings });
  } catch {
    next();
  }
};
