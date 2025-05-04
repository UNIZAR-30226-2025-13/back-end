const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { Server } = require("socket.io");
const { createServer } = require("http");

const app = express();

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:4200",
            "http://localhost:8081",
            "https://front-end-web-5130.onrender.com",
        ],
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Como el frontend está en otro puerto
const cors = require("cors");
// Definir los orígenes permitidos
const allowedOrigins = [
    "http://localhost:4200",
    "http://localhost:8081",
    "https://front-end-web-5130.onrender.com",
];

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
                url: "http://localhost:8080",
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
const playlists = require("./routes/addCMToList");
const folder = require("./routes/folder");
const lists = require("./routes/lists");
const buscador = require("./routes/buscador");
const queue = require("./routes/queu")(io);
const favoritos = require("./routes/favourites");
const song = require("./routes/song");
const podcast = require("./routes/podcast");
const valoraciones = require("./routes/rates");
const admin = require("./routes/admin")(io);
const mensajes = require("./routes/messages");
const { saveMessage, unsaveMessage } = require("./controllers/messagesController");

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
app.use("/queue", queue);
app.use(favoritos);
app.use("/song", song);
app.use(podcast);
app.use(valoraciones);
app.use("/admin", admin);
app.use(mensajes);

// prueba inicial
app.get("/", (req, res) => {
    res.send("Bienvenido a la API de Spongefy");
});

server.listen(8080, () => {
    console.log("Servidor corriendo en http://localhost:8080/api-docs");
});

const userSockets = new Map();

io.on("connection", (socket) => {
    console.log("Usuario conectado: ", socket.id);

    socket.on("login", (userId) => {
        const oldSocketId = userSockets.get(userId);

        if (oldSocketId) {
            // Emite el evento 'forceLogout' si ya existe un socket anterior
            io.to(oldSocketId).emit("forceLogout");

            // Si el socket anterior es diferente, desconectamos el socket anterior
            if (oldSocketId !== socket.id) {
                console.log(`Desconectando socket antiguo: ${oldSocketId}`);
                io.sockets.sockets.get(oldSocketId)?.disconnect();
            }
        }

        userSockets.set(userId, socket.id);
        socket.userId = userId;
        console.log(`Usuario conectado: ${userId} con socket ${socket.id}`);
    });

    socket.on("sendMessage", async ({ nombre_usuario_envia, nombre_usuario_recibe, mensaje }) => {
        try {
            // Guardar el mensaje en la base de datos
            await saveMessage(nombre_usuario_envia, nombre_usuario_recibe, mensaje);

            // Emitir el mensaje al receptor si está conectado
            const receptorSocketId = userSockets.get(nombre_usuario_recibe);
            if (receptorSocketId) {
                io.to(receptorSocketId).emit("newMessage", {
                    from: nombre_usuario_envia,
                    to: nombre_usuario_recibe,
                    content: mensaje,
                });
            }

            // Emitir de vuelta al emisor para actualizar su chat
            socket.emit("messageSent", {
                to: nombre_usuario_recibe,
                content: mensaje,
            });
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            socket.emit("errorMessage", "Hubo un error al enviar el mensaje");
        }
    });

    // Evento para eliminar un mensaje
    socket.on("deleteMessage", async ({ id_mensaje }) => {
        try {
            // Llamar a la función que elimina el mensaje y obtiene los usuarios
            const { nombre_usuario_envia, nombre_usuario_recibe } = await unsaveMessage(id_mensaje);

            // Emitir el evento solo a los sockets del emisor y receptor
            const emisorSocketId = userSockets.get(nombre_usuario_envia);
            if (emisorSocketId) {
                io.to(emisorSocketId).emit("messageDeleted", { id_mensaje });
            }

            const receptorSocketId = userSockets.get(nombre_usuario_recibe);
            if (receptorSocketId) {
                io.to(receptorSocketId).emit("messageDeleted", { id_mensaje });
            }
        } catch (error) {
            console.error("Error al eliminar el mensaje:", error);
            socket.emit("errorMessage", "Hubo un error al eliminar el mensaje");
        }
    });

    socket.on("disconnect", () => {
        if (socket.userId && userSockets.get(socket.userId) === socket.id) {
            userSockets.delete(socket.userId);
        }
        console.log("Usuario desconectado");
    });
});

module.exports = app;
