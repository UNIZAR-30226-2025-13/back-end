const express = require('express');
const router = express.Router();
const { getListData } = require('../controllers/listsController');

/**
 * @swagger
 * tags:
 *   name: Lists
 *   description: Endpoints relacionados con las Listas de reproducción
 */

/**
 * @swagger
 *   /get-list-data:
 *     get:
 *       summary: Obtener los datos de una lista de reproducción
 *       description: Esta API obtiene información sobre una lista de reproducción, incluyendo su nombre, color y contenido multimedia asociado.
 *       tags: [Lists]
 *       parameters:
 *         - in: query
 *           name: id_lista
 *           required: true
 *           description: ID de la lista que se quiere consultar.
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Datos de la lista obtenidos exitosamente.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la lista de reproducción.
 *                   color:
 *                     type: string
 *                     description: Color asociado a la lista de reproducción.
 *                   es_playlist:
 *                     type: boolean
 *                     description: Indica si la lista es una playlist (true) o una lista de episodios (false).
 *                   es_publica:
 *                     type: boolean
 *                     description: Indica si la lista es una pública (true) o privada (false).
 *                   nombre_usuario:
 *                     type: string
 *                     description: Nombre del usuario al que pertenece la lista.
 *                   contenido:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_cm:
 *                           type: integer
 *                           description: Identificador del contenido multimedia.
 *                         titulo:
 *                           type: string
 *                           description: Título del contenido multimedia.
 *                         link_imagen:
 *                           type: string
 *                           description: Enlace a la imagen del contenido multimedia.
 *                         duracion:
 *                           type: string
 *                           format: time
 *                           description: Duración del contenido multimedia en formato HH:MM:SS
 *                           example: "00:03:45"
 *                         fecha_pub:
 *                           type: string
 *                           format: date
 *                           description: Fecha de publicación del contenido multimedia YYYY-MM-DD
 *                           example: "2021-09-30" 
 *                         nombre_creador:
 *                           type: string
 *                           description: Nombre del creador de la canción o '' para el creador de un episodio.
 *                         artistas_feat:
 *                           type: string
 *                           description: Artistas colaboradores (si existen) de la canción. En caso de episodios es "".
 *                         id_grupo:
 *                           type: integer
 *                           description: Identificador del podcast o album del contenido multimedia.
 *                         nombre_grupo:
 *                           type: string
 *                           description: Nombre del podcast o album del contenido multimedia.
 *         400:
 *           description: La lista no existe.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *         500:
 *           description: Hubo un error al obtener la lista.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 */

router.get('/get-list-data', getListData);

module.exports = router;