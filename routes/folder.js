const express = require('express');
const router = express.Router();
const { getFolder } = require('../controllers/folderController');

/**
 * @swagger
 * tags:
 *   name: Folders
 *   description: Endpoints relacionados con una carpeta
 */

/**
 * @swagger
 * /folder:
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
router.get('/folder', getFolder);

module.exports = router;