const express = require('express');
const router = express.Router();
const { getPodcaster } = require('../controllers/podcasterController');

/**
 * @swagger
 * tags:
 *   name: Podcasters
 *   description: Endpoints relacionados con un podcaster
 */

/**
 * @swagger
 * /podcaster:
 *   get:
 *     summary: Obtiene el perfil de un podcaster
 *     tags: [Podcasters]
 *     parameters:
 *       - in: query
 *         name: nombre_podcaster
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre del podcaster a consultar
 *     responses:
 *       200:
 *         description: Perfil del podcaster obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre_podcaster:
 *                   type: string
 *                   description: Nombre del podcaster
 *                 biografia:
 *                   type: string
 *                   description: Biografía del podcaster
 *                 link_imagen:
 *                   type: string
 *                   description: URL de la imagen del podcaster
 *                 seguidores:
 *                   type: integer
 *                   description: Número de seguidores del podcaster
 *                 lista_this_is:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id_lista:
 *                       type: integer
 *                       description: Identificador de la lista de reproducción
 *                     nombre:
 *                       type: string
 *                       description: Nombre de la lista de reproducción
 *                 podcasts_info:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_podcast:
 *                         type: integer
 *                         description: Identificador del podcast
 *                       nombre:
 *                         type: string
 *                         description: Nombre del podcast
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del podcast
 *                 list_episodios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del podcast asociado
 *                       id_episodio:
 *                         type: integer
 *                         description: Identificador del episodio
 *                       titulo_episodio:
 *                         type: string
 *                         description: Título del episodio
 *                 ep_mas_reciente:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del podcast asociado
 *                       id_episodio:
 *                         type: integer
 *                         description: Identificador del episodio más reciente
 *                       titulo_episodio:
 *                         type: string
 *                         description: Título del episodio más reciente
 *                       descripcion:
 *                         type: string
 *                         description: Descripción del episodio más reciente
 *       400:
 *         description: El podcaster no existe
 *       500:
 *         description: Error interno del servidor
 */

router.get('/podcaster', getPodcaster);

module.exports = router;