require('dotenv').config(); // para acceder a las variables de entorno
const { createClient } = require('@libsql/client');
/*
// Comprobación de que se han cargado las variables de entorno
console.log("TURSO_URL:", process.env.TURSO_URL);
console.log("TURSO_AUTH_TOKEN:", process.env.TURSO_AUTH_TOKEN ? "Cargado" : "No cargado");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Cargado" : "No cargado");

// Comprobación de que se ha can cargado las variables correctas
console.log("TURSO_URL desde process.env:", process.env.TURSO_URL);
console.log("TURSO_AUTH_TOKEN desde process.env:", process.env.TURSO_AUTH_TOKEN);
*/
const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

module.exports = client;
