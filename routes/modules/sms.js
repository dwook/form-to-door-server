const axios = require('axios');
const dayjs = require('dayjs');

const time = require('dayjs-ext/plugin/timeZone');
dayjs.extend(time);
const timeZone = 'Asia/Seoul';

require('dotenv').config();
const SMS_APP_KEY = process.env.SMS_APP_KEY;
const COMPANY_PHONE = process.env.COMPANY_PHONE;
const SERVER_URL = process.env.SERVER_URL;

module.exports = async function(segment, mobile, name, branch, tour_date) {
  try {
    const response = await axios.get(`${SERVER_URL}/api/templates`, {
      params: {
        segment,
        medium: 'sms'
      }
    });

    let { text } = response.data.templates[0];
    text = text.replace('{예약자이름}', name);
    text = text.replace('{예약지점}', branch);
    text = text.replace(
      '{예약시간}',
      dayjs(tour_date).format('YY년 MM월 DD일 HH:mm 타임', { timeZone })
    );

    const data = {
      body: text,
      sendNo: COMPANY_PHONE,
      recipientList: [
        {
          recipientNo: mobile
        }
      ]
    };

    await axios({
      method: 'POST',
      url: `https://api-sms.cloud.toast.com/sms/v2.3/appKeys/${SMS_APP_KEY}/sender/sms`,
      data
    })
      .then(res => {
        console.log('Sending Success', res);
      })
      .catch(err => {
        console.log('Sending Failure', err);
      });
  } catch (e) {
    next();
  }
};
