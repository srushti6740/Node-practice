/** Central place to read environment based configuration. */
module.exports = {
   env: process.env.NODE_ENV || 'development',
   port: Number(process.env.PORT) || 8181,
   dbUrl: process.env.DB_URL,
   jwt: {
      key: process.env.JWT_KEY || 'staticSecret',
      expiresIn: process.env.JWT_EXPIRES_IN || '72h'
   },
   mail: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      from: process.env.MAIL_FROM
   }
};
