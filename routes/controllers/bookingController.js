const Booking = require('../../models/Booking.js');
const User = require('../../models/User.js');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const dayjs = require('dayjs');
const sms = require('../modules/sms.js');
require('dotenv').config();

const axios = require('axios');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';

// fs.readFile('credentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   authorize(JSON.parse(content), createEvents);
// });

function authorize(credentials, callback, callbackData) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback, callbackData);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, callbackData);
  });
}

function getAccessToken(oAuth2Client, callback, callbackData) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client, callbackData);
    });
  });
}

function insertEvents(auth, data) {
  // console.log(data);
  const calendar = google.calendar({ version: 'v3', auth });
  calendar.events.insert(
    {
      calendarId: 'primary',
      resource: data
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      // console.log(res);
    }
  );
}

const insertEvent = data => {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), insertEvents, data);
  });
};

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

    // if (name !== 'manager') {
    //   // 구글 캘린더 저장
    //   const data = {
    //     summary: `${branch} ${name}`,
    //     start: { dateTime: tour_date },
    //     end: { dateTime: dayjs(tour_date).add(30, 'minute') },
    //     description: `1.고객이름: ${name}, 2.휴대폰: ${mobile}, 3.예약지점: ${branch}`,
    //     sendUpdates: 'all',
    //     attendees: [{ email: email }]
    //   };
    //   await insertEvent(data);

    sms('tourBook', mobile, name, branch, tour_date);

    //   // sms 전송
    //   const smsData = {
    //     body: `${name} 님, [${branch}점], ${dayjs(tour_date).format(
    //       'YY년 MM월 DD일 HH:mm 타임'
    //     )}에 투어예약이 완료되었습니다.`,
    //     sendNo: '01073345096',
    //     recipientList: [
    //       {
    //         recipientNo: mobile
    //       }
    //     ]
    //   };
    //   await axios({
    //     method: 'POST',
    //     url: `https://api-sms.cloud.toast.com/sms/v2.3/appKeys/${SMS_APP_KEY}/sender/sms`,
    //     data: smsData
    //   })
    //     .then(res => {
    //       console.log('성공', res);
    //     })
    //     .catch(err => {
    //       console.log('실패', err);
    //     });
    // }

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

    // if (req.query.end) {
    //   queryString.tour_date = {
    //     $lte: dayjs(new Date(req.query.end))

    // }
    // const q = {
    //   branch: req.query.branch,
    //   client: req.query.client,
    //   tour_date: {
    //     $gte: dayjs(new Date(req.query.begin))
    //       .startOf('day')
    //       .toDate(),
    //     $lte: dayjs(new Date(req.query.end))
    //       .endOf('day')
    //       .toDate()
    //   }
    // };

    const bookings = await Booking.find(queryString)
      .populate({ path: 'client', model: User })
      .sort({ tour_date: 1 })
      .exec();

    // if (req.query.branch) {
    //   bookings = await Booking.find({
    //     branch: req.query.branch,
    //     tour_date: {
    //       $gte: dayjs(new Date(req.query.begin))
    //         .startOf('day')
    //         .toDate(),
    //       $lte: dayjs(new Date(req.query.end))
    //         .endOf('day')
    //         .toDate()
    //     }
    //   })
    //     .populate({ path: 'client', model: User })
    //     .sort({ tour_date: 1 })
    //     .exec();
    // } else {
    //   bookings = await Booking.find()
    //     .populate({ path: 'client', model: User })
    //     .sort({ tour_date: 1 })
    //     .exec();
    // }

    console.log(bookings);
    res.json({ bookings });
  } catch {
    next();
  }
};
