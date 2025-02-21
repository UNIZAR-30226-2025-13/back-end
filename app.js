const express = require("express");
const client = require("./db");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

const autorizacion = require("./rutas/autorizacion");
const usuario = require("./rutas/usuario");

app.use("/autorizacion", autorizacion);
app.use("/usuario", usuario);

// prueba inicial
app.get("/", (req, res) => {
  res.send("Bienvenido a la API de usuarios");
});

module.exports = app;
