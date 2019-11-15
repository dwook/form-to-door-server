const { google } = require('googleapis');
const dayjs = require('dayjs');
require('dotenv').config();

const SCOPES = 'https://www.googleapis.com/auth/calendar';
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const jwtClient = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_PRIVATE_KEY,
  SCOPES
);

const calendar = google.calendar({
  version: 'v3',
  project: GOOGLE_PROJECT_NUMBER,
  auth: jwtClient
});

module.exports = async function(mobile, name, branch, tour_date) {
  try {
    const data = {
      summary: `${branch} ${name}`,
      start: { dateTime: tour_date },
      end: { dateTime: dayjs(tour_date).add(30, 'minute') },
      description: `1.고객이름: ${name}, 2.휴대폰: ${mobile}, 3.예약지점: ${branch}`,
      sendUpdates: 'all'
    };
    console.log(data);
    console.log(GOOGLE_PRIVATE_KEY);
    calendar.events.insert(
      {
        calendarId: GOOGLE_CALENDAR_ID,
        resource: data
      },
      (err, res) => {
        if (err) return console.log('에러', err);
        console.log(res);
      }
    );
  } catch (e) {
    console.log(e);
  }
};
