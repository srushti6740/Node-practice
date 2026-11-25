const { adminMiddleware } = require('../middlewares');
const { ROUTE_PREFIX_V1, ROUTE_URL } = require('../utils/constants');

const { userRoute } = require('../components/User/v1');
const { categoryRoute } = require('../components/category/v1');

/**
 * Init all routes here
 */
module.exports = (app) => {
   /** body parsers, static files, uploads */
   adminMiddleware(app);

   // gateway routes
   app.use(ROUTE_URL + ROUTE_PREFIX_V1 + '/auth', userRoute);
   app.use(ROUTE_URL + ROUTE_PREFIX_V1 + '/category', categoryRoute);
};
