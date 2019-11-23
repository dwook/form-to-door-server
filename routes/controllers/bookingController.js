const Booking = require('../../models/Booking.js');
const User = require('../../models/User.js');

const dayjs = require('dayjs');
const sms = require('../modules/sms.js');
const gcalendar = require('../modules/gcalendar.js');

const time = require('dayjs-ext/plugin/timeZone');
dayjs.extend(time);
const timeZone = 'Asia/Seoul';

exports.createBooking = async function(req, res, next) {
  try {
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
    }

    const booking = new Booking({
      branch,
      tour_date: new Date(tour_date),
      request,
      client: user
    });
    await booking.save();

    if (name !== 'manager') {
      // sms 전송
      await sms('tourBook', mobile, name, branch, tour_date);
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
    const queryString = {};

    if (req.query.client) {
      queryString.client = req.query.client;
    }
    if (req.query.branch) {
      queryString.branch = req.query.branch;
    }
    if (req.query.begin && req.query.end) {
      queryString.tour_date = {
        $gte: dayjs(req.query.begin)
          .startOf('day')
          .format({ timeZone }),
        $lte: dayjs(req.query.end)
          .endOf('day')
          .format({ timeZone })
      };
    }

    const bookings = await Booking.find(queryString)
      .populate({ path: 'client', model: User })
      .sort({ tour_date: 1 })
      .exec();

    res.json({ bookings });
  } catch {
    next();
  }
};
