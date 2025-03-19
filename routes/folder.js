const express = require('express');
const router = express.Router();
const { getFolder } = require('../controllers/folderController');
const { createFolder } = require('../controllers/folderController');

/**
 * @swagger
 * tags:
 *   name: Folders
 *   description: Endpoints relacionados con una carpeta
 */

/**
 * @swagger
 * /get-folder:
 *   get:
 *     summary: Obtiene las listas de reproducción de una carpeta
 *     tags: [Folders]
 *     parameters:
 *       - in: query
 *         name: id_carpeta
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identificador de la carpeta a consultar
 *     responses:
 *       200:
 *         description: Carpeta obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre_carpeta:
 *                   type: string
 *                   description: Nombre de la carpeta
 *                 listas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_lista:
 *                         type: integer
 *                         description: Identificador de la lista de reproducción
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la lista de reproducción
 *                       color:
 *                         type: string
 *                         description: Color de la lista de reproducción
 *       400:
 *         description: La carpeta no existe
 *       500:
 *         description: Error interno del servidor
 */
router.get('/get-folder', getFolder);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Crea una carpeta
 *     tags: [Folders]
 *     description: Crea una nueva carpeta y la asocia al usuario especificado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - nombre_carpeta
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario.
 *               nombre_carpeta:
 *                 type: string
 *                 description: Nombre de la carpeta a insertar.
 *     responses:
 *       201:
 *         description: Carpeta creada y asociada al usuario correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Carpeta creada correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos o usuario no en uso).
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
 *                   example: "Hubo un error al registrar el usuario"
 */
router.post('/create-folder', createFolder);

module.exports = router;