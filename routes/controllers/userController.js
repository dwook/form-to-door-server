const User = require('../../models/User.js');
const sms = require('../modules/sms');

exports.getUserById = async function(req, res, next) {
  try {
    console.log('요청유저아이디', req.params.user_id);
    const user = await User.findById(req.params.user_id);
    console.log('유저', user);
    res.json({ user });
  } catch {
    next();
  }
};

exports.editUser = async function(req, res, next) {
  try {
    console.log('요청유저', req.params.user_id, req.body.data);

    const user = await User.findById(req.params.user_id);
    const { segment, name, email, mobile, age, gender } = req.body.data;
    console.log('세그먼트 변동', user.segment, segment);
    if (user.segment !== segment) {
      switch (segment) {
        case 'tourNoShow':
          sms('tourNoShow', mobile, name);
          break;
        case 'tourDone':
          sms('tourDone', mobile, name);
          break;
        default:
          break;
      }
    }

    user.segment = segment;
    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.age = age;
    user.gender = gender;
    await user.save();

    res.status(200).json({
      successMessage: '수정에 성공했습니다.'
    });
  } catch {
    res.status(400).json({
      failureMessage: '수정에 실패했습니다.'
    });
  }
};
