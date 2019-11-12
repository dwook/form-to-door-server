const User = require('../../models/User.js');

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
    await User.findByIdAndUpdate(req.params.user_id, {
      ...req.body.data
    });
    res.status(200).json({
      successMessage: '수정에 성공했습니다.'
    });
  } catch {
    res.status(400).json({
      failureMessage: '수정에 실패했습니다.'
    });
  }
};
