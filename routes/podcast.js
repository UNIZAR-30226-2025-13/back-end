const express = require('express');
const router = express.Router();

const { getEpisode, getPodcast } = require('../controllers/podcastController');

/**
 * @swagger
 * /get-episode:
 *   get:
 *     summary: Obtiene la pantalla de un episodio
 *     tags: [Podcast]
 *     description: Devuelve toda la información necesaria para mostrar la pantalla de un episodio.
 *     parameters:
 *       - in: query
 *         name: id_ep
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del episodio a mostrar.
 *     responses:
 *       200:
 *         description: Información sobre el episodio obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                   nombre_ep:
 *                     type: string
 *                     example: "Episodio 1"
 *                   id_podcast:
 *                     type: integer
 *                     example: 12
 *                   nombre_podcast:
 *                     type: string
 *                     example: "La Pija y la Quinqui"
 *                   link_imagen:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                     example: "Descripcion del episodio"
 *                   fecha_pub:
 *                     type: string
 *                     format: date
 *                     description: Fecha de publicación del episodio YYYY-MM-DD
 *                     example: "2021-09-30" 
 *       400:
 *         description: Error en la solicitud (falta de campos o episodio no existe).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El episodio no existe"
 *       500:
 *         description: Error al obtener el episodio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener el episodio"
 */
router.get('/get-episode', getEpisode);


/**
 * @swagger
 * /get-podcast:
 *   get:
 *     summary: Obtiene la pantalla de un podcast
 *     tags: [Podcast]
 *     description: Devuelve toda la información necesaria para mostrar la pantalla de un podcast.
 *     parameters:
 *       - in: query
 *         name: id_podcast
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del podcast a mostrar.
 *       - in: query
 *         name: nombre_usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre único del usuario que quiere ver el podcast.
 *     responses:
 *       200:
 *         description: Información sobre el podcast obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                   podcast:
 *                     type: array
 *                     description: Información sobre el podcast
 *                     items:
 *                       type: object
 *                       properties:
 *                         nombre_podcast:
 *                           type: string
 *                           description: El nombre del podcast.
 *                         descripcion:
 *                           type: string
 *                           description: La descripción del podcast.
 *                         link_imagen:
 *                           type: string
 *                           description: Enlace a la imagen del podcast.
 *                   episodios:
 *                     type: array
 *                     description: Información sobre los episodios del podcast
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_ep:
 *                           type: integer
 *                           description: Identificador único del episodio
 *                         nombre_ep:
 *                           type: string
 *                           description: El nombre del episodio
 *                         duracion:
 *                           type: time
 *                           description: Duración del episodio
 *                           example: "00:03:45"
 *                         descripcion:
 *                           type: string
 *                           description: La descripción del episodio
 *                         valoracion_del_usuario:
 *                           type: integer
 *                           description: Valoración del episodio por parte del usuario (null si no ha hecho)
 *                         valoracion_media:
 *                           type: integer
 *                           description: Valoración media del episodio (null si no hay)
 *                   creadores:
 *                     type: array
 *                     description: Nombre/s de los creadores del podcast
 *                     items:
 *                       type: string
 *                       description: Nombre de los creadores del podcast
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario o podcast no existe).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario no existe"
 *       500:
 *         description: Error al obtener el podcast
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener el podcast"
 */
router.get('/get-podcast', getPodcast);

module.exports = router;