const { Router } = require('express');
const validator = require('./CategoryValidator');
const controller = require('./CategoryController');
const authorizationMiddleware = require('../../../middlewares/middleware');

const router = Router();

// public
router.post('/createCategory', [authorizationMiddleware.isAdminAuthorized], validator.createCategory, (req, res) =>
   controller.createCategory(req, res)
);

router.put('/updateCategory', [authorizationMiddleware.isAdminAuthorized], (req, res) =>
   controller.updateCategory(req, res)
);

router.get('/detail', [authorizationMiddleware.isAdminAuthorized, validator.categoryDetail], (req, res) =>
   controller.categoryDetail(req, res)
);

router.get('/list', [authorizationMiddleware.isAdminAuthorized], (req, res) => controller.getCategoryList(req, res));


router.delete('/categoryDelete', [authorizationMiddleware.isAdminAuthorized, validator.categoryDetail], (req, res) =>
   controller.categoryDelete(req, res)
);

module.exports = router;
