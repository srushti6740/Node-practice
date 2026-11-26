const { Router } = require('express');
const validator = require('./UserValidator');
const controller = require('./UserController');
const authorizationMiddleware = require('../../../middlewares/middleware');

const router = Router();

// public
router.post('/createUser', validator.createUser, (req, res) => controller.createUser(req, res));
router.post('/verifyOTP', validator.verifyOTP, (req, res) => controller.verifyOTP(req, res));
router.post('/login', validator.userLogin, (req, res) => controller.userLogin(req, res));
router.post('/forgotPassword', validator.forgotPassword, (req, res) => controller.forgotPassword(req, res));
router.post('/verifyPasswordOTP', validator.verifyOTP, (req, res) => controller.verifyOTP(req, res));
router.post('/resetPassword', validator.resetPassword, (req, res) => controller.resetPassword(req, res));
router.post('/refreshToken', validator.refreshToken, (req, res) => controller.refreshToken(req, res));
// authenticated
router.get('/detail', [authorizationMiddleware.isUserAuthorized, validator.userDetail], (req, res) =>
   controller.userDetail(req, res)
);
router.put('/updateUser', [authorizationMiddleware.isUserAuthorized], (req, res) => controller.updateUser(req, res));

// admin only
router.get('/list', [authorizationMiddleware.isUserAuthorized], (req, res) => controller.getUserList(req, res));
router.delete('/userDelete', [authorizationMiddleware.isUserAuthorized, validator.userDetail], (req, res) =>
   controller.userDelete(req, res)
);

module.exports = router;
