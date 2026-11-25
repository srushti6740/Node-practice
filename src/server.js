const path = require('path');
const { createServer } = require('http');
const { config } = require('dotenv');

config({ path: path.resolve(process.cwd(), '.env') });

const { logger } = require('./utils/logger');
const connection = require('./utils/dbConfig');
const app = require('./app');

const port = Number(process.env.PORT) || 8181;
const server = createServer(app);

// first connect database, then start the server
(async () => {
   try {
      await connection();
      logger.info(__filename, '', '', 'DB Connection has been established successfully');

      // cron jobs go here:
      // const cron = require('node-cron');
      // cron.schedule('0 * * * *', async () => { ... });

      server.listen(port, () => {
         logger.info(__filename, '', '', `Server is running on ${port}`);
      });
   } catch (e) {
      logger.error(__filename, '', '', 'Unable to connect to the server', e);
      process.exit(1);
   }
})();
