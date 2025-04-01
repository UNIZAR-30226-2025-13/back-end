const express = require("express");
const router = express.Router();

const { showSong } = require("../controllers/songController");

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
 *       400:
 *         description: Parámetros inválidos en la solicitud.
 *       500:
 *         description: Error interno del servidor o el ID no corresponde a una canción.
 */
router.get("/show", showSong);

module.exports = router;
