const axios = require('axios');
const dayjs = require('dayjs');
require('dotenv').config();

const SMS_APP_KEY = process.env.SMS_APP_KEY;
const COMPANY_PHONE = process.env.COMPANY_PHONE;

module.exports = async function(segment, mobile, name, branch, tour_date) {
  try {
    // 세그먼트 존재할 경우, 세그먼트에 해당하는 템플릿 가져오고 치환.

    const response = await axios.get('http://localhost:5000/api/templates', {
      params: {
        segment,
        medium: 'sms'
      }
    });

    console.log('선택된 템플릿', response.data.templates);

    let { text } = response.data.templates[0];

    text = text.replace('{예약자이름}', name);
    text = text.replace('{예약지점}', branch);
    text = text.replace(
      '{예약시간}',
      dayjs(tour_date).format('YY년 MM월 DD일 HH:mm 타임')
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

    console.log('보내질 문자', data);

    // await axios({
    //   method: 'POST',
    //   url: `https://api-sms.cloud.toast.com/sms/v2.3/appKeys/${SMS_APP_KEY}/sender/sms`,
    //   data
    // })
    //   .then(res => {
    //     console.log('sms 전송 성공', res);
    //   })
    //   .catch(err => {
    //     console.log('sms 전송 실패', err);
    //   });
  } catch (e) {
    console.log(e);
  }
};
