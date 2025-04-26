const express = require("express");
const router = express.Router();
const {
    getListData,
    removeCMFromList,
    deleteList,
    updateThisIsListsArtistas,
    updateThisIsListsPodcasters,
    updateGenerosList,
    updateLanguajesList,
} = require("../controllers/listsController");

const { asignarCanciones, asignarEpisodios } = require("../controllers/listsSuggestions");

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
 *         - in: query
 *           name: nombre_usuario
 *           required: true
 *           description: Nombre único del usuario que quiere consultar la lista.
 *           schema:
 *             type: string
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
 *                         valoracion_del_usuario:
 *                           type: integer
 *                           description: Valoración del contenido multimedia por parte del usuario (null si no ha hecho)
 *                         valoracion_media:
 *                           type: integer
 *                           description: Valoración media del contenido multimedia (null si no hay)
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

router.get("/get-list-data", getListData);

/**
 * @swagger
 * /remove-cm-from:
 *   post:
 *     summary: Eliminar una canción o episodio de una lista.
 *     description: Elimina una canción de una lista de reproducción o un episodio de una lista de episodios según el ID de la lista y el ID del contenido multimedia.
 *     tags:
 *       - Lists
 *     parameters:
 *       - in: query
 *         name: id_cm
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del contenido multimedia (canción o episodio) a eliminar.
 *       - in: query
 *         name: id_lista
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la lista de reproducción o lista de episodios de la cual eliminar el contenido.
 *     responses:
 *       200:
 *         description: Contenido eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Canción eliminada de la lista correctamente"
 *       400:
 *         description: La lista no existe o el contenido no se encuentra en ella.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "La lista no existe o el contenido multimedia no se encuentra en ella"
 *       500:
 *         description: Error interno del servidor al eliminar el contenido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al eliminar el contenido multimedia de la lista"
 */
router.post("/remove-cm-from", removeCMFromList);

/**
 * @swagger
 * /delete-list:
 *   post:
 *     summary: Eliminar una lista de reproducción o una lista de episodios.
 *     description: Elimina una lista de reproducción si existe en la tabla Playlist o una lista de episodios si está en Lista_Episodios.
 *     tags:
 *       - Lists
 *     parameters:
 *       - in: query
 *         name: id_lista
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la lista de reproducción o lista de episodios a eliminar.
 *     responses:
 *       200:
 *         description: Lista eliminada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Playlist eliminada correctamente"
 *       400:
 *         description: La lista no existe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "La lista no existe"
 *       500:
 *         description: Error interno del servidor al eliminar la lista.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al eliminar la lista"
 */
router.post("/delete-list", deleteList);

/**
 * @swagger
 * /update-this-is-lists-artists:
 *   post:
 *     summary: Actualiza automáticamente las listas "This Is" de artistas.
 *     description: Actualiza las listas de reproducción tipo "This Is" para artistas en base a 15 canciones aleatorias.
 *     tags:
 *       - Listas
 *     responses:
 *       200:
 *         description: Listas actualizadas correctamente.
 *       500:
 *         description: Error del servidor al actualizar las listas.
 */
router.post("/update-this-is-lists-artists", updateThisIsListsArtistas);

/**
 * @swagger
 * /update-this-is-lists-podcaster:
 *   post:
 *     summary: Actualiza automáticamente las listas "This Is" de podcasters.
 *     description:  Actualiza listas tipo "This Is" para podcasters en base a los episodios de sus podcasts 15 aleatorios.
 *     tags:
 *       - Listas
 *     responses:
 *       200:
 *         description: Listas actualizadas correctamente.
 *       500:
 *         description: Error del servidor al actualizar las listas.
 */
router.post("/update-this-is-lists-podcaster", updateThisIsListsPodcasters);

/**
 * @swagger
 * /update-gender-lists:
 *  post:
 *    summary: Actualiza automáticamente las listas de géneros.
 *    description: Actualiza las listas de reproducción tipo "GENERO" para géneros en base a 15 canciones aleatorias.
 *    tags:
 *      - Listas
 *    responses:
 *      200:
 *        description: Listas actualizadas correctamente.
 *      500:
 *        description: Error del servidor al actualizar las listas.
 */
router.post("/update-gender-lists", updateGenerosList);

/**
 * @swagger
 * /update-gender-lists:
 *  post:
 *    summary: Actualiza automáticamente las listas de géneros.
 *    description: Actualiza las listas de reproducción tipo "GENERO" para géneros en base a 15 canciones aleatorias.
 *    tags:
 *      - Listas
 *    responses:
 *      200:
 *        description: Listas actualizadas correctamente.
 *      500:
 *        description: Error del servidor al actualizar las listas.
 */
router.post("/update-languages-lists", updateLanguajesList);

/**
 * @swagger
 * /asignar-canciones:
 *   post:
 *     summary: Asigna canciones a una lista de reproducción.
 *     description: Asigna canciones a una lista de reproducción utilizando IA.
 *     tags:
 *       - Listas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_playlist:
 *                 type: integer
 *                 description: ID de la playlist a la que se le asignarán las canciones.
 *               playlist:
 *                 type: string
 *                 description: Nombre de la playlist en base a la que se asociarán las canciones.
 *     responses:
 *       200:
 *         description: Asignación actualizada con éxito.
 *       400:
 *         description: Faltan datos necesarios, respuesta no esperada de la IA.
 *       500:
 *         description: Error llamando a la IA o insertando en la base de datos.
 */
router.post("/asignar-canciones", asignarCanciones);

/**
 * @swagger
 * /asignar-episodios:
 *   post:
 *     summary: Asigna episodios a una lista de reproducción.
 *     description: Asigna episodios a una lista de reproducción utilizando IA.
 *     tags:
 *       - Listas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_lista_ep:
 *                 type: integer
 *                 description: ID de la playlist a la que se le asignarán los episodios.
 *               lista_ep:
 *                 type: string
 *                 description: Nombre de la playlist en base a la que se asociarán los episodios.
 *     responses:
 *       200:
 *         description: Asignación actualizada con éxito.
 *       400:
 *         description: Faltan datos necesarios, respuesta no esperada de la IA.
 *       500:
 *         description: Error llamando a la IA o insertando en la base de datos.
 */
router.post("/asignar-episodios", asignarEpisodios);

module.exports = router;
