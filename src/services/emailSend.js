const nodemailer = require('nodemailer');
const config = require('./config');
const { logger } = require('../utils/logger');

class EmailSendService {
   static getTransporter() {
      return nodemailer.createTransport({
         host: config.mail.host,
         port: config.mail.port,
         secure: config.mail.port === 465,
         auth: { user: config.mail.user, pass: config.mail.password }
      });
   }

   /**
    * @param {{to: string, subject: string, html: string}} options
    */
   static async sendEmail({ to, subject, html }) {
      try {
         return await EmailSendService.getTransporter().sendMail({ from: config.mail.from, to, subject, html });
      } catch (error) {
         logger.error(__filename, 'sendEmail', '', `Unable to send mail to ${to}`, error);
         throw error;
      }
   }
}

module.exports = EmailSendService;
