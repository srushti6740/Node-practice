const { Router } = require('express');
const validator = require('./CategoryValidator');
const controller = require('./CategoryController');
const authorizationMiddleware = require('../../../middlewares/middleware');

const router = Router();

// public
router.post('/createCategory', validator.createCategory, (req, res) => controller.createCategory(req, res));

router.put('/updateCategory', [authorizationMiddleware.isAuthorized], (req, res) =>
   controller.updateCategory(req, res));

router.get('/detail', [authorizationMiddleware.isAuthorized, validator.categoryDetail], (req, res) =>
   controller.categoryDetail(req, res)
);

router.get('/list', [authorizationMiddleware.isAuthorized], (req, res) => controller.getCategoryList(req, res));

module.exports = router;
