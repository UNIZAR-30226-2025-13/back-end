const express = require("express");
const router = express.Router();
const {
    addSongToPlaylist,
    addEpToListaEpisodios,
} = require("../controllers/addCMToListController");

/**
 * @swagger
 * tags:
 *   name: Playlist
 *   description: Endpoints relacionados con las Playlists
 */

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
 *                 type: integer
 *                 description: El ID de la canción a añadir.
 *               id_playlist:
 *                 type: integer
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
router.post("/add-song-playlist", addSongToPlaylist);

/**
 * @swagger
 *   /add-ep-lista-episodios:
 *     post:
 *       summary: Añadir un episodio a una lista de episodios
 *       description: Añade un episodio a una lista de episodios, verificando que ambas existan y que el episodio no este ya en la lista.
 *       tags: [Playlist]
 *       parameters:
 *         - in: body
 *           name: body
 *           description: Objeto con los IDs del episodio y de la lista.
 *           required: true
 *           schema:
 *             type: object
 *             properties:
 *               id_episodio:
 *                 type: integer
 *                 description: El ID del episodio a añadir.
 *               id_lista_ep:
 *                 type: integer
 *                 description: El ID de la playlist donde se añadirá la canción.
 *       responses:
 *         200:
 *           description: Episodio añadido correctamente.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *         400:
 *           description: Error debido a que falta algún campo necesario, el episodio no existe, o  ya está en la lista.
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
router.post("/add-ep-lista-episodios", addEpToListaEpisodios);

module.exports = router;
