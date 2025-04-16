const { io } = require("socket.io-client");

// Conexiones de usuarios
const socketJorge = io("http://localhost:8080", { transports: ["websocket"] });
const socketAndrea = io("http://localhost:8080", { transports: ["websocket"] });

const jorge = "jorge";
const andrea = "andrea";
const idMensajeExistente = 3; // Mensaje real existente en la BD

// 👉 Jorge (emisor)
socketJorge.on("connect", () => {
    console.log("✅ Jorge conectado:", socketJorge.id);
    socketJorge.emit("login", jorge);
});

socketJorge.on("forceLogout", () => {
    console.log("🛑 Jorge forzado a cerrar sesión");
});

socketJorge.on("newMessage", (msg) => {
    console.log("📩 Jorge recibió newMessage:", msg);
});

socketJorge.on("messageSent", (msg) => {
    console.log("✅ Jorge recibió messageSent:", msg);
});

socketJorge.on("messageDeleted", ({ id_mensaje }) => {
    console.log("🗑️ Jorge recibió messageDeleted:", id_mensaje);
});

socketJorge.on("errorMessage", (msg) => {
    console.error("⚠️ Jorge recibió error:", msg);
});

// 👉 Andrea (receptora)
socketAndrea.on("connect", () => {
    console.log("✅ Andrea conectada:", socketAndrea.id);
    socketAndrea.emit("login", andrea);
});

socketAndrea.on("forceLogout", () => {
    console.log("🛑 Andrea forzada a cerrar sesión");
});

socketAndrea.on("newMessage", (msg) => {
    console.log("📩 Andrea recibió newMessage:", msg);
});

socketAndrea.on("messageSent", (msg) => {
    console.log("✅ Andrea recibió messageSent:", msg);
});

socketAndrea.on("messageDeleted", ({ id_mensaje }) => {
    console.log("🗑️ Andrea recibió messageDeleted:", id_mensaje);
});

socketAndrea.on("errorMessage", (msg) => {
    console.error("⚠️ Andrea recibió error:", msg);
});

// 🧪 Enviar mensaje de Jorge a Andrea
setTimeout(() => {
    console.log("📤 Enviando mensaje de Jorge a Andrea");
    socketJorge.emit("sendMessage", {
        nombre_usuario_envia: jorge,
        nombre_usuario_recibe: andrea,
        mensaje: "Hola Andrea, soy Jorge desde el test.",
    });
}, 2000);

// 🧪 Eliminar mensaje con ID 3
setTimeout(() => {
    console.log("❌ Jorge intenta eliminar el mensaje con id = 3");
    socketJorge.emit("deleteMessage", { id_mensaje: idMensajeExistente });
}, 4000);

// 🧪 Cierre de prueba
setTimeout(() => {
    console.log("🔌 Cerrando conexiones...");
    socketJorge.disconnect();
    socketAndrea.disconnect();
}, 6000);
