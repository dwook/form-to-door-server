var express = require('express');
var router = express.Router();
const templateController = require('./controllers/templateController');

/* GET templates listing. */
router.get('/', templateController.getTemplateBySegment);

router.put('/:template_id', templateController.editTemplate);

module.exports = router;
