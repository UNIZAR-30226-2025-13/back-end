const express = require('express');
const router = express.Router();
const { getArtist } = require('../controllers/artistController');

<<<<<<< Updated upstream
=======
/**
 * @swagger
 * tags:
 *   name: Artistas
 *   description: Endpoints relacionados con un artista
 */

/**
 * @swagger
 * /artist:
 *   get:
 *     summary: Obtiene el perfil de un artista
 *     tags: [Artistas]
 *     parameters:
 *       - in: query
 *         name: nombre_artista
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre del artista a consultar
 *     responses:
 *       200:
 *         description: Perfil del artista obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre_artista:
 *                   type: string
 *                   description: Nombre del artista
 *                 biografia:
 *                   type: string
 *                   description: Biografía del artista
 *                 link_imagen:
 *                   type: string
 *                   description: URL de la imagen del artista
 *                 albumes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_album:
 *                         type: integer
 *                         description: Identificador del álbum
 *                       nombre_album:
 *                         type: string
 *                         description: Nombre del álbum
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del álbum
 *                 canciones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_cancion:
 *                         type: integer
 *                         description: Identificador de la canción
 *                       titulo:
 *                         type: string
 *                         description: Título de la canción
 *                       n_repros:
 *                         type: integer
 *                         description: Número de reproducciones
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen de la canción
 *                       duracion:
 *                         type: string
 *                         format: time
 *                         description: Duración de la canción en formato HH:MM:SS
 *                         example: "00:03:45"  
 *                       fecha_pub:
 *                         type: string
 *                         format: date
 *                         description: Fecha de publicación de la canción YYYY-MM-DD
 *                         example: "2021-09-30" 
 *                       nombre_artista:
 *                         type: string
 *                         description: Nombre del artista principal
 *                       artistas_feat:
 *                         type: string
 *                         description: Artistas en colaboración (si existen)
 *                 seguidores:
 *                   type: integer
 *                   description: Número de seguidores del artista
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
 *       400:
 *         description: El artista no existe
 *       500:
 *         description: Error interno del servidor
 */
>>>>>>> Stashed changes
router.get('/artist', getArtist);

module.exports = router;