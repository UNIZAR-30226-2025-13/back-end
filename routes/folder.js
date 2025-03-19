const express = require('express');
const router = express.Router();
const { getFolder, createFolder, addListToFolder, listUserFolder } = require('../controllers/folderController');

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
 * /create-folder:
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

/**
 * @swagger
 * /add-list-to-folder:
 *   post:
 *     summary: Añade lista a carpeta
 *     tags: [Folders]
 *     description: Añade una lista existente a una carpeta existente, perteneciendo ambas a un usuario especificado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - id_carpeta
 *               - id_lista
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario.
 *               id_carpeta:
 *                 type: integer
 *                 description: Identificador de la carpeta en la que insertar.
 *               id_lista:
 *                 type: integer
 *                 description: Identificador de la lista que insertar.
 *     responses:
 *       201:
 *         description: Lista añadida a la carpeta correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lista añadida correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos, usuario no en uso, carpeta o lista no pertenecen al usuario).
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
router.post('/add-list-to-folder', addListToFolder);

/**
  * @swagger 
  * /list-user-folder:
  *   get:
  *     summary: Obtiene las carpetas de un usuario
  *     tags: [Folders]
  *     description: Se obtienen todas las carpetas de un usuario
  *     parameters:
  *       - in: query
  *         name: nombre_usuario
  *         schema:
  *           type: string
  *         required: true
  *         description: Nombre del usuario para obtener sus carpetas.
  *     responses:
  *       201:
  *         description: Lista de carpetas del usuario
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 carpetas:
  *                   type: array
  *                   items:
  *                     type: object
  *                     properties:
  *                       id_carpeta:
  *                         type: integer
  *                         description: Identificador de la carpeta
  *                         example: 1
  *                       nombre_carpeta:
  *                         type: string
  *                         description: Nombre de la carpeta
  *                         example: "Mi Carpeta"
  *       400:
  *         description: Error en la solicitud (usuario no existe o parámetro faltante)
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 message:
  *                   type: string
  *                   example: "El usuario no existe"
  *       500:
  *         description: Error interno del servidor
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 message:
  *                   type: string
  *                   example: "Hubo un error al listar las carpetas"
*/
router.get('/list-user-folder', listUserFolder);

module.exports = router;