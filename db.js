require('dotenv').config(); // para acceder a las variables de entorno
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_URL,
  syncUrl: process.env.TURSO_SYNC_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

module.exports = client;
