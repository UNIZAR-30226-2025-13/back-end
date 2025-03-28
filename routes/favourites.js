const express = require('express');
const router = express.Router();

const { followUser, followCreator, addToFavourites, unfollowUser, unfollowCreator, isAFollowerOfUser, isAFollowerOfCreator } = require('../controllers/favouritesController');

/**
 * @swagger
 * /follow-user:
 *   post:
 *     summary: Seguir a un usuario
 *     tags: [Favourites]
 *     description: Un usuario sigue a otro usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - nombre_usuario_a_seguir
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario que quiere seguir.
 *               nombre_usuario_a_seguir:
 *                 type: string
 *                 description: Nombre único del usuario al que se quiere seguir.
 *     responses:
 *       200:
 *         description: Un usuario ha seguido al otro usuario correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario seguido correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario/s no existe/n, mismo usuario o ya lo sigue).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario seguidor no existe"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al seguir al usuario"
 */
router.post('/follow-user', followUser);

/**
 * @swagger
 * /follow-creator:
 *   post:
 *     summary: Seguir a un creador
 *     tags: [Favourites]
 *     description: Un usuario sigue a un creador.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - nombre_creador
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario que quiere seguir.
 *               nombre_creador:
 *                 type: string
 *                 description: Nombre único del creador al que se quiere seguir.
 *     responses:
 *       200:
 *         description: Un usuario ha seguido a un creador correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Creador seguido correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario no existe, creador no existe o ya lo sigue).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario no existe"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al seguir al creador"
 */
router.post('/follow-creator', followCreator);

/**
 * @swagger
 * /add-to-favourites:
 *   post:
 *     summary: Añadir a favoritos un contenido multimedia
 *     tags: [Favourites]
 *     description: Añade un contenido multimedia a los favoritos de un usuario (en función de si es una canción o un episodio).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - id_cm
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario.
 *               id_cm:
 *                 type: integer
 *                 description: Identificador del contenido multimedia.
 *     responses:
 *       200:
 *         description: Se ha insertado el contenido multimedia correctamente en favoritos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cancion añadida a favoritos correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario no existe, contenido multimedia no existe o ya está añadido a favoritos).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario no existe"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al añadir a favoritos el contenido multimedia"
 */
router.post('/add-to-favourites', addToFavourites);

/**
 * @swagger
 * /unfollow-user:
 *   post:
 *     summary: Dejar de seguir a un usuario
 *     tags: [Favourites]
 *     description: Un usuario deja de seguir a otro usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - nombre_usuario_a_dejar_seguir
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario que quiere dejar de seguir.
 *               nombre_usuario_a_dejar_seguir:
 *                 type: string
 *                 description: Nombre único del usuario al que se quiere dejar de seguir.
 *     responses:
 *       200:
 *         description: Un usuario ha dejado de seguir al otro usuario correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario dejado de seguir correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario/s no existe/n, mismo usuario o no lo sigue).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario seguidor no existe"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al dejar de seguir al usuario"
 */
router.post('/unfollow-user', unfollowUser);

/**
 * @swagger
 * /unfollow-creator:
 *   post:
 *     summary: Dejar de seguir a un creador
 *     tags: [Favourites]
 *     description: Un usuario deja de seguir a un creador.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - nombre_creador
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario que quiere dejar de seguir.
 *               nombre_creador:
 *                 type: string
 *                 description: Nombre único del creador al que se quiere dejar de seguir.
 *     responses:
 *       200:
 *         description: Un usuario ha dejado de seguir a un creador correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Creador dejado de seguir correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario no existe, creador no existe o no lo sigue).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario no existe"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al dejar de seguir al creador"
 */
router.post('/unfollow-creator', unfollowCreator);

/**
 * @swagger
 * /is-a-follower-of-user:
 *   get:
 *     summary: Obtiene si un usuario sigue a otro usuario
 *     tags: [Favourites]
 *     description: Devuelve true si un usuario sigue a otro usuario, false en caso contrario.
 *     parameters:
 *       - in: query
 *         name: nombre_usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre único del usuario que quiere ver si sigue al otro usuario.
 *       - in: query
 *         name: nombre_usuario_a_seguir
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre único del usuario del que se quiere ver si se sigue.
 *     responses:
 *       200:
 *         description: Información sobre seguimiento obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                   es_seguidor:
 *                     type: boolean
 *                     example: true
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario/s no existe/n o mismo usuario).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario seguidor no existe"
 *       500:
 *         description: Error al ver si sigue al usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al ver si sigue al usuario"
 */
router.get('/is-a-follower-of-user', isAFollowerOfUser);

/**
 * @swagger
 * /is-a-follower-of-creator:
 *   get:
 *     summary: Obtiene si un usuario sigue a un creador
 *     tags: [Favourites]
 *     description: Devuelve true si un usuario sigue a un creador, false en caso contrario.
 *     parameters:
 *       - in: query
 *         name: nombre_usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre único del usuario que quiere ver si sigue al creador.
 *       - in: query
 *         name: nombre_creador
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del creador del que se quiere ver si se sigue.
 *     responses:
 *       200:
 *         description: Información sobre seguimiento obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                   es_seguidor:
 *                     type: boolean
 *                     example: true
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario no existe o creador no existe).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario seguidor no existe"
 *       500:
 *         description: Error al ver si sigue al creador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al ver si sigue al creador"
 */
router.get('/is-a-follower-of-creator', isAFollowerOfCreator);
module.exports = router;