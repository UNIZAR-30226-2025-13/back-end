const express = require("express");
const { register, login, changePasswordRequest } = require("../controllers/autorizationController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autorización
 *   description: Endpoints relacionados el proceso de autenticación de la aplicación
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autorización]
 *     description: Crea un nuevo usuario en la base de datos y le asigna listas de reproducción por defecto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - contrasena
 *               - correo
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario.
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario (se almacenará encriptada).
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Dirección de correo electrónico del usuario.
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado correctamente"
 *       400:
 *         description: Error en la solicitud (falta de campos o usuario/correo en uso).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El nombre de usuario introducido ya está en uso"
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
router.post("/register", register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Inicia sesión en la aplicación
 *     tags: [Autorización]
 *     description: Verifica las credenciales del usuario y genera un token de autenticación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - contrasena
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre único del usuario.
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario.
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login exitoso"
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación.
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     nombre_usuario:
 *                       type: string
 *                     correo:
 *                       type: string
 *                 es_admin:
 *                   type: boolean
 *       400:
 *         description: Credenciales incorrectas o campos faltantes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña incorrecta"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al hacer login"
 */
router.post("/login", login);

/**
 * @swagger
 * /change-password-request:
 *   put:
 *     summary: Solicita un cambio de contraseña
 *     tags: [Autorización]
 *     description: Envía un código de verificación al correo del usuario para restablecer la contraseña.
 *     parameters:
 *       - in: query
 *         name: correo
 *         required: true
 *         schema:
 *           type: string
 *         description: Correo del usuario registrado.
 *     responses:
 *       200:
 *         description: Solicitud de cambio de contraseña exitosa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitud de cambio de contraseña exitosa"
 *       400:
 *         description: Error en la solicitud (correo faltante o inexistente).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No existe una cuenta con este correo"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al solicitar el cambio de contraseña"
 */
router.put("/change-password-request", changePasswordRequest);

module.exports = router;
