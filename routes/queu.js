const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Queue
 *   description: Endpoints relacionados con la cola de reproducción
 */

module.exports = (io) => {
    const express = require("express");
    const router = express.Router();
    const {
        getCM,
        addSong,
        shuffleQueue,
        clearQueue,
        showQueue,
    } = require("../controllers/queueController");

    io.on("connection", (socket) => {
        console.log("Usuario conectado a la cola:", socket.id);
    });

    /**
     * @swagger
     * /queue/get-cm:
     *   get:
     *     summary: Obtener el contenido multimedia actual de un usuario en la cola de reproducción
     *     description: Devuelve el contenido multimedia correspondiente a una posición en la cola de reproducción de un usuario.
     *     tags:
     *       - Queue
     *     parameters:
     *       - in: query
     *         name: nombre_usuario
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre de usuario del propietario de la cola de reproducción.
     *       - in: query
     *         name: posicion
     *         required: true
     *         schema:
     *           type: integer
     *         description: Posición en la cola de reproducción para obtener el contenido multimedia correspondiente.
     *     responses:
     *       200:
     *         description: Contenido multimedia encontrado y devuelto.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id_cm:
     *                   type: integer
     *                   description: ID del contenido multimedia en la cola.
     *       400:
     *         description: Error si el usuario no existe o si la posición es incorrecta.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   examples:
     *                     usuario_no_existe:
     *                       value: "El usuario no existe"
     *                     posicion_incorrecta:
     *                       value: "Posición incorrecta"
     *       500:
     *         description: Error interno del servidor al obtener el contenido.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Error al obtener la canción actual"
     */
    router.get("/get-cm", getCM);

    // Pasar io al controlador usando una función de envoltura
    /**
     * @swagger
     * /queue/add:
     *   post:
     *     summary: Agregar una canción a la cola
     *     description: Agrega una nueva canción a la cola del usuario.
     *     tags:
     *       - Queue
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id_cm
     *               - nombre_usuario
     *             properties:
     *               id_cm:
     *                 type: integer
     *                 description: ID del contenido multimedia a agregar
     *               nombre_usuario:
     *                 type: string
     *                 description: Nombre del usuario que añade el contenido a su cola
     *     responses:
     *       200:
     *         description: Canción agregada correctamente
     *       400:
     *         description: Datos incompletos o contenido inexistente
     */
    router.post("/add", (req, res) => addSong(req, res, io));

    /**
     * @swagger
     * /queue/shuffle:
     *   post:
     *     summary: "Reorganiza aleatoriamente la cola de reproducción de un usuario"
     *     description: |
     *       Esta API permite reorganizar aleatoriamente las posiciones de los contenidos multimedia
     *       que están en la cola de reproducción de un usuario después de una posición específica.
     *     operationId: "shuffleQueue"
     *     parameters:
     *       - in: "body"
     *         name: "body"
     *         description: "Objeto que contiene el nombre del usuario y la posición desde la cual reorganizar la cola"
     *         required: true
     *         schema:
     *           type: "object"
     *           properties:
     *             nombre_usuario:
     *               type: "string"
     *               description: "Nombre del usuario cuya cola de reproducción será reorganizada."
     *               example: "juan123"
     *             posicion:
     *               type: "integer"
     *               description: "Posición desde la cual reorganizar los contenidos multimedia. Se reorganizan los elementos cuya posición es mayor que esta."
     *               example: 3
     *     responses:
     *       200:
     *         description: "Cola de reproducción reorganizada correctamente."
     *         schema:
     *           type: "object"
     *           properties:
     *             message:
     *               type: "string"
     *               example: "Cola de reproducción reorganizada correctamente"
     *       400:
     *         description: "Error de validación de parámetros, como un usuario inexistente."
     *         schema:
     *           type: "object"
     *           properties:
     *             error:
     *               type: "string"
     *               example: "El usuario no existe"
     *       500:
     *         description: "Error interno del servidor al intentar reorganizar la cola."
     *         schema:
     *           type: "object"
     *           properties:
     *             message:
     *               type: "string"
     *               example: "Error al aleatorizar la cola"
     *             error:
     *               type: "string"
     *               example: "TypeError: Unsupported type of value"
     *     tags:
     *       - "Queue"
     */
    router.post("/shuffle", shuffleQueue);

    /**
     * @swagger
     * /queue/clear:
     *   post:
     *     summary: Elimina la cola de reproducción de un usuario
     *     description: Elimina todo el contendio multimedia de un usuario
     *     tags:
     *       - Queue
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nombre_usuario
     *             properties:
     *               nombre_usuario:
     *                 type: string
     *                 description: Nombre del usuario que elimina su cola de reproducción
     *     responses:
     *       200:
     *         description: El usuario no existe
     *       400:
     *         description: Cola eliminada correctamente
     */
    router.post("/clear", (req, res) => clearQueue(req, res, io));

    /**
     * @swagger
     * /queue/show:
     *   get:
     *     summary: Obtiene la cola de reproducción de un usuario.
     *     description: Devuelve la lista de contenidos multimedia en la cola de reproducción de un usuario, incluyendo canciones y episodios de podcast.
     *     tags:
     *       - Queue
     *     parameters:
     *       - in: query
     *         name: nombre_usuario
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre del usuario cuya cola de reproducción se va a obtener.
     *       - in: query
     *         name: posicion
     *         required: true
     *         schema:
     *           type: integer
     *         description: Posición inicial en la cola de reproducción.
     *     responses:
     *       200:
     *         description: Cola de reproducción obtenida con éxito.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 cola:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       titulo:
     *                         type: string
     *                         example: "Canción Ejemplo"
     *                       duracion:
     *                         type: string
     *                         example: "03:45"
     *                       link_imagen:
     *                         type: string
     *                         example: "https://example.com/imagen.jpg"
     *                       fecha_pub:
     *                         type: string
     *                         format: date
     *                         example: "2024-01-01"
     *                       posicion:
     *                         type: integer
     *                         example: 3
     *                       artista:
     *                         type: string
     *                         example: "Artista Ejemplo"
     *                       featurings:
     *                         type: array
     *                         items:
     *                           type: string
     *                         example: ["Feat 1", "Feat 2"]
     *                       podcast:
     *                         type: string
     *                         example: "Podcast Ejemplo"
     *       400:
     *         description: El usuario no existe.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "El usuario no existe"
     *       500:
     *         description: Error en el servidor al obtener la cola de reproducción.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Error al obtener la cola de reproducción"
     */
    router.get("/show", showQueue);
    return router;
};
