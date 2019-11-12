var express = require('express');
var router = express.Router();
const userController = require('./controllers/userController');

/* GET users listing. */
router.get('/:user_id', userController.getUserById);

router.put('/:user_id', userController.editUser);

module.exports = router;
