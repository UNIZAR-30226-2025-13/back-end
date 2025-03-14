const express = require('express');
const router = express.Router();
const { playSong } = require('../controllers/songController');

/**
 * @swagger
 * tags:
 *   name: Canciones
 *   description: Endpoints relacionados con canciones
 */
/**
 * @swagger
 * /play-song:
 *   get:
 *     summary: Reproducir una canción
 *     description: Obtiene la información de una canción para su reproducción sin mostrar detalles de la misma.
 *     tags:
 *       - Canciones
 *     parameters:
 *       - in: query
 *         name: id_cancion
 *         schema:
 *           type: string
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
 *                   type: string
 *                   description: ID de la canción
 *                 link_cm:
 *                   type: string
 *                   description: Enlace al contenido multimedia de la canción
 *                 titulo:
 *                   type: string
 *                   description: Título de la canción
 *                 duracion:
 *                   type: string
 *                   description: Duración de la canción
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
router.get('/play-song', playSong);

module.exports = router;
