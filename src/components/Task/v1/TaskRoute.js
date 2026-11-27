const { Router } = require('express');
const authorizationMiddleware = require('../../../middlewares/middleware');
const controller = require('../../Task/v1/TaskController');
const validator = require('./TaskValidator');

const router = Router();

router.post('/createTask', [authorizationMiddleware.isAdminAuthorized], validator.createTask, (req, res) =>
   controller.createTaskCtrl(req, res)
);

router.put('/updateTask', [authorizationMiddleware.isAdminAuthorized], (req, res) =>
   controller.updateTaskCtrl(req, res)
);

router.get('/detail', [authorizationMiddleware.isAdminAuthorized, validator.taskDetail], (req, res) =>
   controller.taskDetail(req, res)
);

router.get('/list', [authorizationMiddleware.isAdminAuthorized], (req, res) => controller.taskList(req, res));

router.delete('/taskDelete', [authorizationMiddleware.isAdminAuthorized, validator.taskDetail], (req, res) =>
   controller.taskDelete(req, res)
);

router.post('/assign', [authorizationMiddleware.isAdminAuthorized], (req, res) => controller.assignTask(req, res));
module.exports = router;
