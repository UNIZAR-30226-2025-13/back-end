const express = require("express");
const app = express();


// como el frontend está en otro puerto
const cors = require("cors");
// Definir los orígenes permitidos
const allowedOrigins = ["http://localhost:4200", "http://localhost:8081"];

// Configurar CORS con una función personalizada
app.use(cors({
  origin: function(origin, callback) {
    // Permitir orígenes que estén en el arreglo o solicitudes sin origen (como las de "same-origin")
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Origen permitido
    } else {
      callback(new Error('No permitido por CORS')); // Origen no permitido
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

require("dotenv").config();

app.use(express.json());

const autorizacion = require("./routes/autorization");
const usuario = require("./routes/user");
const artista = require("./routes/artist");
const podcaster = require("./routes/podcaster");
const home = require("./routes/home");
const canciones = require("./routes/song");
const album = require("./routes/album");
const playlists = require("./routes/playlists");
const folder = require("./routes/folder");
const lists = require("./routes/lists");


// hace que las rutas empiecen por esa palabra
// ej: si pones app.use("/usuario", usuario); la ruta para login es http://localhost:8080/usuario/login
app.use(autorizacion);
app.use(usuario);
app.use(artista);
app.use(podcaster);
app.use(home);
app.use(canciones);
app.use(album);
app.use(playlists);
app.use(folder);
app.use(lists);


// prueba inicial
app.get("/", (req, res) => {
  res.send("Bienvenido a la API de usuarios");
});

module.exports = app;
