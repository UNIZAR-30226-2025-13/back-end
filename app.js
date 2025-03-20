const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

// como el frontend está en otro puerto
const cors = require("cors");
// Definir los orígenes permitidos
const allowedOrigins = ["http://localhost:4200", "http://localhost:8081"];

// Configurar CORS con una función personalizada
app.use(
    cors({
        origin: function (origin, callback) {
            // Permitir orígenes que estén en el arreglo o solicitudes sin origen (como las de "same-origin")
            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true); // Origen permitido
            } else {
                callback(new Error("No permitido por CORS")); // Origen no permitido
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

require("dotenv").config();

app.use(express.json());

// Documentación de la Api con swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Usuarios",
            version: "1.0.0",
            description: "Documentación de la API de Usuarios con Express y Swagger",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor de desarrollo",
            },
        ],
    },
    apis: ["./routes/*.js"], // Archivos donde están las rutas
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const autorizacion = require("./routes/autorization");
const usuario = require("./routes/user");
const artista = require("./routes/artist");
const podcaster = require("./routes/podcaster");
const home = require("./routes/home");
const player = require("./routes/player");
const album = require("./routes/album");
const playlists = require("./routes/playlists");
const folder = require("./routes/folder");
const lists = require("./routes/lists");
const buscador = require("./routes/buscador");

// hace que las rutas empiecen por esa palabra
// ej: si pones app.use("/usuario", usuario); la ruta para login es http://localhost:8080/usuario/login
app.use(autorizacion);
app.use(usuario);
app.use(artista);
app.use(podcaster);
app.use(home);
app.use(player);
app.use(album);
app.use(playlists);
app.use(folder);
app.use(lists);
app.use(buscador);


// prueba inicial
app.get("/", (req, res) => {
    res.send("Bienvenido a la API de usuarios");
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000/api-docs");
});

module.exports = app;
