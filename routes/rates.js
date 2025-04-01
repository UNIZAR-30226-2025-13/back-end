const express = require('express');
const router = express.Router();

const { getRate, postRate, deleteRate, getAverageRate } = require('../controllers/ratesController');

/**
 * @swagger
 * /get-rate:
 *   get:
 *     summary: Obtiene la valoración de un contenido multimedia
 *     tags: [Valoraciones]
 *     description: Devuelve la valoración de un usuario a un contenido multimedia
 *     parameters:
 *       - in: query
 *         name: id_cm
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del contenido multimedia
 *       - in: query
 *         name: nombre_usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único del usuario
 *     responses:
 *       200:
 *         description: Valoración del contenido multimedia por el usuario
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                   valoracion:
 *                     type: integer
 *                     example: 4
 *       400:
 *         description: Error en la solicitud (falta de campos, contenido multimedia o usuario no existe, usuario no ha valorado ese contenido multimedia).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario no existe"
 *       500:
 *         description: Error al obtener la valoración
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener la valoración"
 */
router.get('/get-rate', getRate);

/**
 * @swagger
 * /post-rate:
 *   post:
 *     summary: Hacer una valoración
 *     tags: [Valoraciones]
 *     description: Un usuario realiza una valoración a un contenido multimedia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_cm
 *               - nombre_usuario
 *               - valoracion
 *             properties:
 *               id_cm:
 *                 type: integer
 *                 description: Identificador del contenido multimedia
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario
 *               valoracion:
 *                 type: integer
 *                 description: Valoración del usuario sobre un contenido multimedia
 *     responses:
 *       200:
 *         description: Un usuario ha realizado la valoración de un contenido multimedia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Valoración realizada correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario o contenido multimedia no existe o usuario ya ha valorado el contenido multimedia).
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
 *                   example: "Hubo un error al realizar la valoración"
 */
router.post('/post-rate', postRate);

/**
 * @swagger
 * /delete-rate:
 *   post:
 *     summary: Borrar una valoración
 *     tags: [Valoraciones]
 *     description: Un usuario borra una valoración de un contenido multimedia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_cm
 *               - nombre_usuario
 *             properties:
 *               id_cm:
 *                 type: integer
 *                 description: Identificador del contenido multimedia
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario
 *     responses:
 *       200:
 *         description: Un usuario ha borrado la valoración de un contenido multimedia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Valoración borrada correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario o contenido multimedia no existe o usuario no ha valorado el contenido multimedia).
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
 *                   example: "Hubo un error al borrar la valoración"
 */
router.post('/delete-rate', deleteRate);

/**
 * @swagger
 * /get-average-rate:
 *   get:
 *     summary: Obtiene la valoración media de un contenido multimedia
 *     tags: [Valoraciones]
 *     description: Devuelve la valoración media de un contenido multimedia
 *     parameters:
 *       - in: query
 *         name: id_cm
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del contenido multimedia
 *     responses:
 *       200:
 *         description: Valoración del contenido multimedia
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                   valoracion:
 *                     type: integer
 *                     example: 4
 *       400:
 *         description: Error en la solicitud (falta de campos, contenido multimedia no existe).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El contenido multimedia no existe"
 *       500:
 *         description: Error al obtener la valoración media
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener la valoración media"
 */
router.get('/get-average-rate', getAverageRate);

module.exports = router;