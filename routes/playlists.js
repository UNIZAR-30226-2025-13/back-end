const express = require('express');
const router = express.Router();
const { getPlaylistData, addSongToPlaylist } = require('../controllers/playlistsController');

/**
 * @swagger
 * tags:
 *   name: Playlist
 *   description: Endpoints relacionados con las Playlists
 */

/**
 * @swagger
 *   /get-playlist-data:
 *     get:
 *       summary: Obtener los datos de una playlist
 *       description: Esta API obtiene información sobre una playlist, incluyendo su nombre, color y canciones asociadas.
 *       tags: [Playlist]
 *       parameters:
 *         - in: query
 *           name: id_playlist
 *           required: true
 *           description: ID de la playlist que se quiere consultar.
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Datos de la playlist obtenidos exitosamente.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la playlist.
 *                   color:
 *                     type: string
 *                     description: Color asociado a la playlist.
 *                   canciones:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_cancion:
 *                           type: integer
 *                           description: ID de la canción.
 *                         titulo:
 *                           type: string
 *                           description: Título de la canción.
 *                         n_repros:
 *                           type: integer
 *                           description: Número de reproducciones de la canción.
 *                         link_imagen:
 *                           type: string
 *                           description: Enlace a la imagen de la canción.
 *                         duracion:
 *                           type: string
 *                           description: Duración de la canción.
 *                         fecha_pub:
 *                           type: string
 *                           format: date
 *                           description: Fecha de publicación de la canción.
 *                         nombre_artista:
 *                           type: string
 *                           description: Nombre del artista principal de la canción.
 *                         artistas_feat:
 *                           type: string
 *                           description: Artistas colaboradores (si existen) de la canción.
 *         400:
 *           description: La playlist no existe o falta el campo 'id_playlist'.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *         500:
 *           description: Hubo un error al obtener los datos de la playlist.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 */
router.get('/get-playlist-data', getPlaylistData);

/**
 * @swagger
 *   /add-song-playlist:
 *     post:
 *       summary: Añadir una canción a una playlist
 *       description: Añade una canción a una playlist, verificando que ambas existan y que la canción no esté ya en la playlist.
 *       tags: [Playlist]
 *       parameters:
 *         - in: body
 *           name: body
 *           description: Objeto con los IDs de la canción y la playlist.
 *           required: true
 *           schema:
 *             type: object
 *             properties:
 *               id_cancion:
 *                 type: string
 *                 description: El ID de la canción a añadir.
 *               id_playlist:
 *                 type: string
 *                 description: El ID de la playlist donde se añadirá la canción.
 *       responses:
 *         200:
 *           description: Canción añadida correctamente a la playlist.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *         400:
 *           description: Error debido a que falta algún campo necesario, la canción no existe, o la canción ya está en la playlist.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *         500:
 *           description: Error interno del servidor.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 */
router.post("/add-song-playlist", addSongToPlaylist)

module.exports = router;