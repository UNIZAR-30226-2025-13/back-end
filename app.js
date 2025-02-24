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

// hace que las rutas de autorizacion y usuario empiecen por esa palabra
app.use("/autorizacion", autorizacion);
app.use("/usuario", usuario);

app.get("/cruzzi", async (req, res) => {
  try {
    const result = await client.execute("SELECT link_imagen FROM Creador WHERE nombre_creador = 'Cruz Cafuné'");

    if (!result || !result.rows || result.rows.length === 0) {
        return res.status(400).json({ message: "El usuario no existe" });
    }

    res.status(200).json(result.rows[0]); // devolver perfil

  } catch (error) {
    console.error("Error al obtener la imagen:", error);
    res.status(500).json({ message: "Hubo un error al obtener la imagen" });
  }
});

// prueba inicial
app.get("/", (req, res) => {
  res.send("Bienvenido a la API de usuarios");
});

module.exports = app;
