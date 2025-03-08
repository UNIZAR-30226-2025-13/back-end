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
const artista = require("./routes/artist");
const home = require("./routes/home");
const canciones = require("./routes/song");
const album = require("./routes/album");
const playlists = require("./routes/playlists");


// hace que las rutas empiecen por esa palabra
// ej: si pones app.use("/usuario", usuario); la ruta para login es http://localhost:8080/usuario/login
app.use(autorizacion);
app.use(usuario);
app.use(artista);
app.use(home);
app.use(canciones);
app.use(album);
app.use(playlists);


// prueba inicial
app.get("/", (req, res) => {
  res.send("Bienvenido a la API de usuarios");
});

module.exports = app;
