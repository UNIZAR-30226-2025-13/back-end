const express = require('express');
const router = express.Router();
const { sendMessage, deleteMessage, getMessages } = require('../controllers/messagesController');

/**
 * @swagger
 * tags:
 *   name: Mensajes
 *   description: Endpoints relacionados con los mensajes entre usuarios
 */

/**
 * @swagger
 * /send-message:
 *   post:
 *     summary: Enviar un mensaje de un usuario a otro
 *     tags: [Mensajes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario_envia:
 *                 type: string
 *                 example: "usuario1"
 *               nombre_usuario_recibe:
 *                 type: string
 *                 example: "usuario2"
 *               mensaje:
 *                 type: string
 *                 example: "hola"
 *     responses:
 *       200:
 *         description: Mensaje enviado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mensaje enviado"
 *       400:
 *         description: Error en la solicitud (faltan parámetros o usuario/s no existe/n)
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
 *       500:
 *         description: Error interno al enviar el mensaje
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al enviar el mensaje"
 */
router.post('/send-message', sendMessage);

/**
 * @swagger
 * /delete-message:
 *   post:
 *     summary: Borrar un mensaje de un usuario a otro
 *     tags: [Mensajes]
 *     parameters:
 *       - in: query
 *         name: id_mensaje
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador del mensaje a borrar
 *     responses:
 *       200:
 *         description: Mensaje eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mensaje eliminado"
 *       400:
 *         description: Error en la solicitud (faltan parámetros o mensaje no existe)
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
 *       500:
 *         description: Error interno al borrar el mensaje
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al borrar el mensaje"
 */
router.post('/delete-message', deleteMessage);

/**
 * @swagger
 * /get-messages:
 *   get:
 *     summary: Obtiene los mensajes entre dos usuarios
 *     tags: [Mensajes]
 *     parameters:
 *       - in: query
 *         name: nombre_usuario_envia
 *         required: true
 *         schema:
 *           type: string
 *           example: "usuario_envia"
 *         description: Nombre de usuario que envia el mensaje
 *       - in: query
 *         name: nombre_usuario_recibe
 *         required: true
 *         schema:
 *           type: string
 *           example: "usuario_recibe"
 *         description: Nombre de usuario que recibe el mensaje
 *     responses:
 *       200:
 *         description: Mensajes obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                 id_mensaje:
 *                  type: integer
 *                  example: 1
 *                 nombre_usuario_envia:
 *                  type: string
 *                  example: "usuario_envia"
 *                 nombre_usuario_recibe:
 *                  type: string
 *                  example: "usuario_recibe"
 *                 contenido:
 *                  type: string
 *                  example: "Hola, ¿cómo estás?"
 *                 fecha:
 *                  type: string
 *                  format: date-time
 *                  example: "2023-10-01 12:00:00"
 *       400:
 *         description: Error en la solicitud (faltan parámetros o usuario/s no existe/n)
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
 *       500:
 *         description: Error interno al obtener los mensajes entre los usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener los mensajes entre los usuarios"
 */
router.get('/get-messages', getMessages);

module.exports = router;