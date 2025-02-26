const express = require("express");
//const client = require("./db");
const app = express();


// como el frontend está en otro puerto
const cors = require("cors");
app.use(cors({
  origin: "http://localhost:4200", // coincide con el puerto de Angular
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

require("dotenv").config();

app.use(express.json());

const autorizacion = require("./routes/autorization");
const usuario = require("./routes/user");
//const artista = require("./rutas/artista");

// hace que las rutas empiecen por esa palabra
// ej: si pones app.use("/usuario", usuario); la ruta para login es http://localhost:8080/usuario/login
app.use(autorizacion);
app.use(usuario);

/*
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
*/
// prueba inicial
app.get("/", (req, res) => {
  res.send("Bienvenido a la API de usuarios");
});

module.exports = app;
