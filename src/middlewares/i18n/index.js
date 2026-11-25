const path = require('path');
const i18n = require('i18n');

i18n.configure({
   defaultLocale: 'en',
   directory: path.join(__dirname, '../../../locales'), // JSON file location
   locales: ['en'],
   cookie: 'node_boilerplate',
   autoReload: true,
   objectNotation: true,
   updateFiles: false
});

module.exports = { i18n };
