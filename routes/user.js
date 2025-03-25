const express = require('express');
const router = express.Router();

const { getProfile, changePassword, getLists, createList, getPlaylists, getPublicLists, changeListPrivacy } = require('../controllers/userController');

const { verifyToken } = require('../middleware/autorizationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints relacionados con los usuarios
 */

/**
 * @swagger
 * /perfil:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre_usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario a consultar
 *         example: "prueba"
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre_usuario:
 *                   type: string
 *                   example: "prueba"
 *                 contrasena:
 *                   type: string
 *                   example: "$2b$10$7Ue1dy/LGgEB2Uxy2jiBJ.t7NL.386W4ESsTGpFeK5dBh5RFAGHAu"
 *                 correo:
 *                   type: string
 *                   format: email
 *                   example: "prueba@gmail.com"
 *                 link_compartir:
 *                   type: string
 *                   example: ""
 *                 es_admin:
 *                   type: integer
 *                   example: 0
 *       400:
 *         description: El usuario no existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario no existe"
 *       401:
 *         description: No autorizado (Token faltante o inválido)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No autorizado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener el perfil"
 */
router.get("/perfil", verifyToken, getProfile);

/**
 * @swagger
 * /change-password:
 *   post:
 *     summary: Cambia la contraseña del usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "ejemplo"
 *               token:
 *                 type: string
 *                 example: "f7d5be3a12ff0ce73bdc392c452e..."
 *               nueva_contrasena:
 *                 type: string
 *                 example: "Jaja123_"
 *     responses:
 *       200:
 *         description: Contraseña cambiada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña cambiada correctamente"
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               Campos vacíos:
 *                 value:
 *                   message: "Hay que rellenar todos los campos"
 *               Sin token asociado:
 *                 value:
 *                   message: "El usuario no tiene ningún token asociado"
 *               Token inválido:
 *                 value:
 *                   message: "El token suministrado no es válido"
 *               Token caducado:
 *                 value:
 *                   message: "El token ha caducado"
 *       500:
 *         description: Error interno al cambiar la contraseña
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al cambiar la contraseña"
 */
router.post("/change-password", changePassword);

/**
 * @swagger
 * /get-user-library:
 *   get:
 *     summary: Obtiene las listas, carpetas, artistas y podcasts favoritos del usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: nombre_usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario para obtener sus listas y preferencias
 *     responses:
 *       200:
 *         description: Listas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 listas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_lista:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: "Mi lista favorita"
 *                 carpetas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_carpeta:
 *                         type: integer
 *                         example: 5
 *                       nombre:
 *                         type: string
 *                         example: "Música Chill"
 *                 artistas_favoritos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre_artista:
 *                         type: string
 *                         example: "Coldplay"
 *                       link_imagen:
 *                         type: string
 *                         example: "https://imagen.com/coldplay.jpg"
 *                 podcasts_favoritos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre_podcaster:
 *                         type: string
 *                         example: "Joe Rogan"
 *                       link_imagen:
 *                         type: string
 *                         example: "https://imagen.com/joerogan.jpg"
 *       400:
 *         description: Faltan parámetros en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Falta el parámetro nombre_usuario"
 *       500:
 *         description: Error interno al obtener las listas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener las listas"
 */
router.get("/get-user-library",  getLists);

/**
 * @swagger
 * /get-playlists:
 *   get:
 *     summary: Obtiene las playlists del usuario (excluyendo "Tus canciones favoritas" y "Tus episodios favoritos")
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: nombre_usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario para obtener sus playlists
 *     responses:
 *       200:
 *         description: Playlists obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_lista:
 *                     type: integer
 *                     example: 12
 *                   nombre:
 *                     type: string
 *                     example: "Rock Clásico"
 *       400:
 *         description: Faltan parámetros en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Falta el parámetro nombre_usuario"
 *       500:
 *         description: Error interno al obtener las playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener las playlists"
 */
router.get("/get-playlists", getPlaylists);


/**
 * @swagger
 * /create-list:
 *   post:
 *     summary: Crea una nueva lista de reproducción para un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_lista:
 *                 type: string
 *                 example: "Mi nueva lista"
 *               nombre_usuario:
 *                 type: string
 *                 example: "usuario123"
 *               color:
 *                 type: string
 *                 example: "#FF5733"
 *               tipo:
 *                 type: string
 *                 enum: ["canciones", "episodios"]
 *                 example: "canciones"
 *     responses:
 *       200:
 *         description: Lista creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lista creada correctamente"
 *       400:
 *         description: Error en la solicitud (faltan parámetros o usuario no existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al crear la lista"
 */
router.post("/create-list", createList);

/**
 * @swagger
 * /get-public-lists:
 *   get:
 *     summary: Obtiene las listas públicas del usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: nombre_usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario para obtener sus listas públicas
 *     responses:
 *       200:
 *         description: Listas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_lista:
 *                     type: integer
 *                     example: 12
 *                   nombre:
 *                     type: string
 *                     example: "Rock Clásico"
 *                   color:
 *                     type: string
 *                     example: "#FF0000"
 *       400:
 *         description: Error en la solicitud (faltan parámetros o usuario no existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error interno al obtener las playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener las listas públicas"
 */
router.get("/get-public-lists", getPublicLists);

/**
 * @swagger
 * /change-list-privacy:
 *   post:
 *     summary: Actualiza la privacidad de una lista de reproducción para un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_lista:
 *                 type: integer
 *                 example: 2
 *               nombre_usuario:
 *                 type: string
 *                 example: "usuario123"
 *     responses:
 *       200:
 *         description: Lista actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Privacidad de la lista actualizada correctamente"
 *       400:
 *         description: Error en la solicitud (faltan parámetros, usuario no existe o lista no existe o no pertenece al usuario)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al cambiar la privacidad de la lista"
 */
router.post("/change-list-privacy", changeListPrivacy);

module.exports = router;