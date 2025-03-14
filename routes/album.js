const express = require('express');
const router = express.Router();
const { getAlbum } = require('../controllers/albumController');

/**
 * @swagger
 * tags:
 *   name: Album
 *   description: Endpoints relacionados con los albums de un artista
 */

/**
 * @swagger
 * /album:
 *   get:
 *     summary: Obtiene la información de un álbum
 *     tags: [Album]
 *     parameters:
 *       - in: query
 *         name: id_album
 *         schema:
 *           type: string
 *         required: true
 *         description: Identificador del álbum a consultar
 *     responses:
 *       200:
 *         description: Información del álbum obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 album:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Identificador del álbum
 *                     nombre:
 *                       type: string
 *                       description: Nombre del álbum
 *                     link_imagen:
 *                       type: string
 *                       description: URL de la imagen del álbum
 *                     fecha_pub:
 *                       type: string
 *                       format: date
 *                       description: Fecha de publicación del álbum
 *                 artista:
 *                   type: string
 *                   description: Nombre del artista del álbum
 *                 canciones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_cancion:
 *                         type: string
 *                         description: Identificador de la canción
 *                       titulo:
 *                         type: string
 *                         description: Título de la canción
 *                       n_repros:
 *                         type: integer
 *                         description: Número de reproducciones
 *                       duracion:
 *                         type: string
 *                         description: Duración de la canción
 *                       fecha_pub:
 *                         type: string
 *                         format: date
 *                         description: Fecha de publicación de la canción
 *                       nombre_artista:
 *                         type: string
 *                         description: Nombre del artista principal
 *                       artistas_feat:
 *                         type: string
 *                         description: Artistas en colaboración (si existen)
 *       400:
 *         description: El álbum no existe
 *       500:
 *         description: Error interno del servidor
 */
router.get('/album', getAlbum);

module.exports = router;