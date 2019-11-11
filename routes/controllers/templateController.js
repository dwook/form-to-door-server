const Template = require('../../models/Template.js');

exports.getTemplateBySegment = async function(req, res, next) {
  try {
    console.log('요청세그먼트', req.query.segment);
    const templates = await Template.find({
      segment: req.query.segment
    });
    console.log('템플릿', templates);
    res.json({ templates });
  } catch {
    next();
  }
};

exports.editTemplate = async function(req, res, next) {
  try {
    console.log('요청세그먼트', req.params.template_id, req.body.text);
    await Template.findByIdAndUpdate(req.params.template_id, {
      text: req.body.text
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
