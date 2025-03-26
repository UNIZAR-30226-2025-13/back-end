const express = require("express");
const router = express.Router();
const {
    playSong,
    playCM,
    saveLastThingPlaying,
    recoverLastThingPlaying,
} = require("../controllers/playerController");

/**
 * @swagger
 * tags:
 *   name: Player
 *   description: Endpoints relacionados con el reproductor de contenido multimedia
 */
/**
 * @swagger
 * /play-song:
 *   get:
 *     summary: Reproducir una canción
 *     description: Obtiene la información de una canción para su reproducción sin mostrar detalles de la misma.
 *     tags:
 *       - Player
 *     parameters:
 *       - in: query
 *         name: id_cancion
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la canción a reproducir
 *     responses:
 *       200:
 *         description: Canción encontrada y lista para reproducción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_cancion:
 *                   type: integer
 *                   description: ID de la canción
 *                 link_cm:
 *                   type: string
 *                   description: Enlace al contenido multimedia de la canción
 *                 titulo:
 *                   type: string
 *                   description: Título de la canción
 *                 duracion:
 *                   format: time
 *                   description: Duración de la canción en formato HH:MM:SS
 *                   example: "00:03:45"
 *                 link_imagen:
 *                   type: string
 *                   description: Enlace a la imagen de la canción
 *                 autor:
 *                   type: string
 *                   description: Nombre del artista principal
 *                 artistas_featuring:
 *                   type: string
 *                   description: Lista de artistas en featuring separados por coma
 *       400:
 *         description: Error si la canción no existe o si el contenido es un episodio de podcast
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     no_existe:
 *                       value: "No existe la canción"
 *                     es_podcast:
 *                       value: "El contenido solicitado es un episodio de podcast, no una canción"
 *       500:
 *         description: Error del servidor al obtener la canción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener la canción"
 */
router.get("/play-song", playSong);

/**
 * @swagger
 * /play-cm:
 *   get:
 *     summary: Obtener información de una canción o episodio de podcast
 *     description: Devuelve la información de una canción o episodio de podcast, incluyendo detalles del artista o del podcast correspondiente.
 *     tags:
 *       - Player
 *     parameters:
 *       - in: query
 *         name: id_cancion
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del contenido multimedia a reproducir
 *     responses:
 *       200:
 *         description: Contenido multimedia encontrado y listo para reproducción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_cm:
 *                   type: integer
 *                   description: ID del contenido multimedia
 *                 link_cm:
 *                   type: string
 *                   description: Enlace al contenido multimedia
 *                 titulo:
 *                   type: string
 *                   description: Título del contenido multimedia
 *                 duracion:
 *                   format: time
 *                   description: Duración del contenido multimedia en formato HH:MM:SS
 *                   example: "00:03:45"
 *                 link_imagen:
 *                   type: string
 *                   description: Enlace a la imagen del contenido multimedia
 *                 tipo:
 *                   type: string
 *                   description: Indica si el contenido es una "canción" o un "episodio"
 *                 autor:
 *                   type: string
 *                   nullable: true
 *                   description: Nombre del artista principal (nulo si es un episodio de podcast)
 *                 artistas_featuring:
 *                   type: string
 *                   nullable: true
 *                   description: Lista de artistas en featuring separados por coma (nulo si es un episodio de podcast)
 *                 podcast:
 *                   type: string
 *                   nullable: true
 *                   description: Nombre del podcast al que pertenece el episodio (nulo si es una canción)
 *       400:
 *         description: Error si el contenido multimedia no existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     no_existe:
 *                       value: "No existe el contenido solicitado"
 *       500:
 *         description: Error del servidor al obtener el contenido multimedia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener el contenido multimedia"
 */
router.get("/play-cm", playCM);

/**
 * @swagger
 * /save-last-playing:
 *   post:
 *     summary: Guarda el último contenido multimedia reproducido por un usuario.
 *     description: Guarda el último contenido multimedia que un usuario estaba reproduciendo junto con el tiempo de reproducción actual.
 *     tags: [Player]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - id_cm
 *               - tiempo
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre de usuario del cual se va a guardar la última canción reproducida.
 *               id_cm:
 *                 type: integer
 *                 description: ID del contenido multimedia que estaba reproduciendo el usuario.
 *               tiempo:
 *                 type: integer
 *                 description: Tiempo en segundos en el que se dejó la reproducción del contenido multimedia.
 *     responses:
 *       200:
 *         description: El último contenido multimedia reproducido ha sido guardado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: El último contenido multimedia reproducido ha sido guardado correctamente.
 *       400:
 *         description: Error en la solicitud debido a datos inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El contenido dado no existe | El tiempo dado excede el del contenido | El usuario dado no existe.
 *       500:
 *         description: Error interno del servidor al intentar guardar la información.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hubo un error al guardar el último contenido sonando.
 */
router.post("/save-last-playing", saveLastThingPlaying);

/**
 * @swagger
 * /recover-last-playing:
 *   get:
 *     summary: Obtiene el ID del último contenido multimedia que estaba reproduciéndose.
 *     description: Recupera el último contenido reproducido y el tiempo en el que se pausó para un usuario específico.
 *     tags: [Player]
 *     parameters:
 *       - in: query
 *         name: nombre_usuario
 *         required: true
 *         description: Nombre de usuario del cual se quiere recuperar la última reproducción.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Última reproducción encontrada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_cm:
 *                   type: integer
 *                   description: ID del contenido multimedia.
 *                 tiempo:
 *                   type: integer
 *                   description: Tiempo en segundos donde se pausó la reproducción.
 *       400:
 *         description: El usuario no existe.
 *       500:
 *         description: Error interno al recuperar la última reproducción.
 */
router.get("/recover-last-playing", recoverLastThingPlaying);

module.exports = router;
