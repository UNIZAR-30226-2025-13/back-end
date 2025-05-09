const express = require("express");
const router = express.Router();

const { showSong, showLyrics } = require("../controllers/songController");

/**
 * @swagger
 * tags:
 *   name: Songs
 *   description: Endpoints relacionados con las canciones
 */

/**
 * @swagger
 * /song/show:
 *   get:
 *     summary: Obtiene la información de una canción por su ID.
 *     tags: [Songs]
 *     parameters:
 *       - in: query
 *         name: id_cancion
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la canción a obtener.
 *     responses:
 *       200:
 *         description: Información de la canción obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_cancion:
 *                   type: string
 *                   description: ID de la canción.
 *                 reproducciones:
 *                   type: integer
 *                   description: Número de reproducciones de la canción.
 *                 fecha_pub:
 *                   type: string
 *                   format: date
 *                   description: Fecha de publicación de la canción.
 *                 link_cm:
 *                   type: string
 *                   description: Enlace al contenido multimedia de la canción.
 *                 titulo:
 *                   type: string
 *                   description: Título de la canción.
 *                 duracion:
 *                   type: integer
 *                   description: Duración de la canción en segundos.
 *                 link_imagen:
 *                   type: string
 *                   description: Enlace a la imagen de la canción.
 *                 autor:
 *                   type: string
 *                   description: Nombre del artista principal.
 *                 artistas_featuring:
 *                   type: string
 *                   description: Nombres de los artistas en colaboración (separados por coma).
 *                 idiomas:
 *                   type: string
 *                   description: Idiomas de la canción (separados por coma).
 *                 generos:
 *                   type: string
 *                   description: Géneros de la canción (separados por coma).
 *       400:
 *         description: Parámetros inválidos en la solicitud.
 *       500:
 *         description: Error interno del servidor o el ID no corresponde a una canción.
 */
router.get("/show", showSong);

/**
 * @swagger
 * /song/show-lyrics:
 *   get:
 *     summary: Obtiene la letra de una canción mediante su ID.
 *     tags: [Songs]
 *     parameters:
 *       - in: query
 *         name: id_cancion
 *         schema:
 *           type: string
 *         required: true
 *         description: Identificador de la canción.
 *     responses:
 *       200:
 *         description: Letra de la canción obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 letra:
 *                   type: string
 *                   description: Letra de la canción.
 *       400:
 *         description: Faltan parámetros en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error interno al obtener la letra de la canción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener la letra de la canción"
 */
router.get("/show-lyrics", showLyrics);

module.exports = router;
