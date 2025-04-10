const express = require("express");

module.exports = (io) => {
    const router = express.Router();

    require("dotenv").config(); // para acceder a las variables de entorno

    const multer = require("multer");
    const cloudinary = require("cloudinary").v2;
    const { uploadFileToCloudinary } = require("../controllers/admin/addMultimedia");
    const { uploadAlbum } = require("../controllers/admin/addAlbum");

    const app = express();
    const upload = multer({ dest: "uploads/" }); // Carpeta temporal para archivos

    // Configuración de Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    /**
     * @swagger
     * tags:
     *   name: Admin
     *   description: Endpoints relacionados con funcionalidades del administrador
     */

    /**
     * @swagger
     * /admin/upload-multimedia:
     *   post:
     *     summary: Sube un archivo de audio (canción o episodio) a Cloudinary y guarda su metadata en la base de datos.
     *     tags: [Admin]
     *     consumes:
     *       - multipart/form-data
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - audio
     *               - titulo
     *               - fecha_pub
     *             properties:
     *               audio:
     *                 type: string
     *                 format: binary
     *                 description: Archivo de audio (obligatorio)
     *               imagen:
     *                 type: string
     *                 format: binary
     *                 description: Imagen de portada (obligatoria si es canción sin álbum)
     *               titulo:
     *                 type: string
     *                 description: Título del contenido multimedia
     *               creador:
     *                 type: string
     *                 description: Nombre del creador (obligatorio si es canción)
     *               es_cancion:
     *                 type: boolean
     *                 description: Indica si el contenido es una canción
     *               fecha_pub:
     *                 type: string
     *                 format: date
     *                 description: Fecha de publicación en formato AAAA-MM-DD
     *               letra:
     *                 type: string
     *                 description: Letra de la canción (obligatorio si es canción)
     *               featurings:
     *                 oneOf:
     *                   - type: string
     *                   - type: array
     *                     items:
     *                       type: string
     *                 description: Lista de artistas en colaboración (featurings)
     *               generos:
     *                 oneOf:
     *                   - type: string
     *                   - type: array
     *                     items:
     *                       type: string
     *                 description: Lista de géneros musicales
     *               id_podcast:
     *                 type: string
     *                 description: ID del podcast (obligatorio si es episodio)
     *               descripcion:
     *                 type: string
     *                 description: Descripción del episodio (obligatorio si es episodio)
     *               idiomas:
     *                 oneOf:
     *                   - type: string
     *                   - type: array
     *                     items:
     *                       type: string
     *                 description: Lista de idiomas del contenido
     *               id_album:
     *                 type: string
     *                 description: ID del álbum al que pertenece la canción (opcional)
     *     responses:
     *       200:
     *         description: Archivos subidos con éxito
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Archivos subidos con éxito
     *       400:
     *         description: Error de validación (campos obligatorios faltantes o incorrectos)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *       500:
     *         description: Error en la subida o en la base de datos
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    router.post(
        "/upload-multimedia",
        upload.fields([
            { name: "audio", maxCount: 1 },
            { name: "imagen", maxCount: 1 },
        ]),
        uploadFileToCloudinary
    );

    /**
     * @swagger
     * /admin/upload-album:
     *   post:
     *     summary: Crea un nuevo álbum con su respectiva portada e información.
     *     tags: [Admin]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - imagen
     *               - nombre_album
     *               - creadores
     *               - fecha_pub
     *             properties:
     *               imagen:
     *                 type: string
     *                 format: binary
     *                 description: Imagen de portada del álbum.
     *               nombre_album:
     *                 type: string
     *                 description: Nombre del álbum.
     *                 example: Mi Primer Álbum
     *               creadores:
     *                 type: string
     *                 description: Nombres de los creadores separados por comas.
     *                 example: Artista1, Artista2
     *               fecha_pub:
     *                 type: string
     *                 format: date
     *                 description: Fecha de publicación en formato AAAA-MM-DD.
     *                 example: 2024-05-01
     *     responses:
     *       200:
     *         description: Álbum creado con éxito.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Album creado con éxito
     *       400:
     *         description: Parámetros faltantes o archivo no enviado.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Faltan parámetros básicos como nombre, creadores o fecha de publicación
     *       500:
     *         description: Error interno al subir la portada o insertar en la base de datos.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Error al subir la portada a Cloudinary o al insertarlo en la BD
     */
    router.post("/upload-album", upload.fields([{ name: "imagen", maxCount: 1 }]), uploadAlbum);

    return router;
};
