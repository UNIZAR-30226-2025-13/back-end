const express = require("express");
const { updateCreator } = require("../controllers/admin/updateCreator");

module.exports = (io) => {
    const router = express.Router();

    require("dotenv").config(); // para acceder a las variables de entorno

    const multer = require("multer");
    const cloudinary = require("cloudinary").v2;
    const { uploadFileToCloudinary } = require("../controllers/admin/addMultimedia");
    const { uploadAlbum } = require("../controllers/admin/addAlbum");
    const { uploadPodcast } = require("../controllers/admin/addPodcast");
    const { uploadCreator } = require("../controllers/admin/addCreator");

    const { updateMultimedia } = require("../controllers/admin/updateMultimedia");
    const { updateAlbum } = require("../controllers/admin/updateAlbum");
    const { updatePodcast } = require("../controllers/admin/updatePodcast");
    const { updateCreator } = require("../controllers/admin/updateCreator");

    const {
        deleteMultimedia,
        deleteAlbum,
        deletePodcast,
        deleteCreador,
    } = require("../controllers/admin/deletes");

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

    /**
     * @swagger
     * /admin/upload-podcast:
     *   post:
     *     summary: Subir un nuevo podcast con su portada, creadores y temáticas.
     *     description: Carga un nuevo podcast incluyendo la imagen de portada, los nombres de los creadores y las temáticas asociadas. La imagen se sube a Cloudinary.
     *     tags: [Admin]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               imagen:
     *                 type: string
     *                 format: binary
     *                 description: Imagen de portada del podcast.
     *               nombre_podcast:
     *                 type: string
     *                 description: Nombre del podcast.
     *               creadores:
     *                 type: string
     *                 description: Lista de creadores separada por comas (o array si es posible).
     *               tematicas:
     *                 type: string
     *                 description: Lista de temáticas separada por comas (o array si es posible).
     *               descripcion:
     *                 type: string
     *                 description: Descripción breve del podcast.
     *     responses:
     *       200:
     *         description: Podcast creado con éxito.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Podcast creado con éxito
     *       400:
     *         description: Error por falta de parámetros obligatorios o portada.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *       500:
     *         description: Error interno al subir imagen o insertar en la base de datos.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    router.post("/upload-podcast", upload.fields([{ name: "imagen", maxCount: 1 }]), uploadPodcast);

    /**
     * @swagger
     * /admin/upload-creator:
     *   post:
     *     summary: Sube un nuevo creador (artista o podcaster) con su imagen y biografía.
     *     description: Permite a un administrador crear un nuevo creador, ya sea un artista o un podcaster, subiendo su imagen de perfil y biografía. También clasifica automáticamente según el tipo (artista o podcaster).
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
     *               - imagen
     *               - nombre_creador
     *               - biografia
     *               - es_podcaster
     *             properties:
     *               imagen:
     *                 type: string
     *                 format: binary
     *                 description: Imagen de perfil del creador (archivo).
     *               nombre_creador:
     *                 type: string
     *                 description: Nombre del creador (único).
     *               biografia:
     *                 type: string
     *                 description: Breve biografía del creador.
     *               es_podcaster:
     *                 type: boolean
     *                 description: Indica si el creador es un podcaster (`true`) o un artista (`false`).
     *     responses:
     *       200:
     *         description: Creador creado con éxito.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Creador creado con éxito
     *       400:
     *         description: Error por campos faltantes o creador ya existente.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Faltan campos obligatorios
     *       500:
     *         description: Error interno en la subida de imagen o base de datos.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Error al subir los archivos a Cloudinary o al insertar en la base de datos
     */
    router.post("/upload-creator", upload.fields([{ name: "imagen", maxCount: 1 }]), uploadCreator);

    /**
     * @swagger
     * /admin/update-multimedia:
     *   post:
     *     summary: Actualiza un contenido multimedia (canción o episodio)
     *     description: Actualiza información de un contenido multimedia existente (audio, imagen, título, idiomas, etc.). Puede actualizar parcial o totalmente. Soporta multipart/form-data.
     *     tags:
     *       - Admin
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               id_cm:
     *                 type: integer
     *                 description: ID del contenido multimedia a actualizar
     *               audio:
     *                 type: string
     *                 format: binary
     *                 description: Nuevo archivo de audio (opcional)
     *               imagen:
     *                 type: string
     *                 format: binary
     *                 description: Nueva imagen de portada (opcional)
     *               titulo:
     *                 type: string
     *                 description: Nuevo título del contenido (opcional)
     *               creador:
     *                 type: string
     *                 description: Nombre del creador principal (solo para canciones)
     *               es_cancion:
     *                 type: boolean
     *                 description: Indica si es canción (true) o episodio (false)
     *               fecha_pub:
     *                 type: string
     *                 format: date
     *                 description: Nueva fecha de publicación (AAAA-MM-DD)
     *               letra:
     *                 type: string
     *                 description: Nueva letra de la canción (solo canciones)
     *               featurings:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de artistas colaboradores (solo canciones)
     *               generos:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de géneros musicales (solo canciones)
     *               id_podcast:
     *                 type: string
     *                 description: Nuevo ID del podcast asociado (solo episodios)
     *               descripcion:
     *                 type: string
     *                 description: Nueva descripción del episodio (solo episodios)
     *               idiomas:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de idiomas en que está disponible el contenido (opcional)
     *               id_album:
     *                 type: string
     *                 description: ID del álbum al que pertenece la canción (opcional, solo canciones)
     *     responses:
     *       200:
     *         description: Contenido multimedia actualizado con éxito
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Contenido multimedia actualizado con éxito
     *       400:
     *         description: Error de validación (faltan campos o datos incorrectos)
     *       500:
     *         description: Error interno del servidor (fallo al actualizar datos o subir archivos)
     */
    router.post(
        "/update-multimedia",
        upload.fields([
            { name: "audio", maxCount: 1 },
            { name: "imagen", maxCount: 1 },
        ]),
        updateMultimedia
    );
    /**
     * @swagger
     * /admin/update-album:
     *   post:
     *     tags:
     *       - Admin
     *     summary: Actualiza un álbum existente
     *     description: |
     *       Permite actualizar los datos de un álbum, incluyendo nombre, fecha de publicación, portada (imagen) y creadores.
     *       Solo se actualizan los campos enviados en la solicitud.
     *       Si se envían nuevos creadores, se reemplazan los anteriores.
     *     consumes:
     *       - multipart/form-data
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - id_album
     *             properties:
     *               id_album:
     *                 type: integer
     *                 description: ID del álbum que se desea actualizar.
     *               nombre_album:
     *                 type: string
     *                 description: Nuevo nombre del álbum (opcional).
     *               fecha_pub:
     *                 type: string
     *                 format: date
     *                 description: Nueva fecha de publicación en formato AAAA-MM-DD (opcional).
     *               creadores:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de nombres de creadores (opcional). Puede enviarse como array o string separado por comas.
     *               imagen:
     *                 type: string
     *                 format: binary
     *                 description: Nueva portada del álbum (opcional).
     *     responses:
     *       200:
     *         description: Álbum actualizado con éxito
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Álbum actualizado con éxito
     *       400:
     *         description: Error por falta de parámetros obligatorios
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Se requiere el id_album para actualizar
     *       500:
     *         description: Error interno al actualizar el álbum
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Error al actualizar el álbum en la base de datos o la portada en Cloudinary
     */

    router.post("/update-album", upload.fields([{ name: "imagen", maxCount: 1 }]), updateAlbum);

    /**
     * @swagger
     * /admin/update-podcast:
     *   post:
     *     tags:
     *       - Admin
     *     summary: Actualiza un podcast existente
     *     description: |
     *       Permite actualizar los datos de un podcast, incluyendo nombre, descripción, portada (imagen), creadores y temáticas.
     *       Solo se actualizan los campos enviados en la solicitud.
     *       Si se envían nuevos creadores o temáticas, se reemplazan los anteriores.
     *     consumes:
     *       - multipart/form-data
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - id_podcast
     *             properties:
     *               id_podcast:
     *                 type: integer
     *                 description: ID del podcast que se desea actualizar.
     *               nombre_podcast:
     *                 type: string
     *                 description: Nuevo nombre del podcast (opcional).
     *               descripcion:
     *                 type: string
     *                 description: Nueva descripción del podcast (opcional).
     *               creadores:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de nombres de podcasters (opcional). Puede enviarse como array o como string separado por comas.
     *               tematicas:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de temáticas del podcast (opcional). Puede enviarse como array o como string separado por comas.
     *               imagen:
     *                 type: string
     *                 format: binary
     *                 description: Nueva portada del podcast (opcional).
     *     responses:
     *       200:
     *         description: Podcast actualizado con éxito
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Podcast actualizado con éxito
     *       400:
     *         description: Error por falta de parámetros obligatorios
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Se requiere el id_podcast para actualizar
     *       500:
     *         description: Error interno al actualizar el podcast
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Error al actualizar el podcast en la base de datos o la portada en Cloudinary
     */
    router.post("/update-podcast", upload.fields([{ name: "imagen", maxCount: 1 }]), updatePodcast);

    /**
     * @swagger
     * /admin/update-creator:
     *   post:
     *     tags:
     *       - Admin
     *     summary: Actualiza un creador (artista o podcaster)
     *     description: |
     *       Permite actualizar los datos de un creador, incluyendo biografía e imagen de perfil.
     *       No está permitido cambiar el tipo de creador (de artista a podcaster o viceversa).
     *     consumes:
     *       - multipart/form-data
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - nombre_creador
     *             properties:
     *               nombre_creador:
     *                 type: string
     *                 description: Nombre del creador que se desea actualizar.
     *               biografia:
     *                 type: string
     *                 description: Nueva biografía del creador (opcional).
     *               imagen:
     *                 type: string
     *                 format: binary
     *                 description: Nueva imagen de perfil del creador (opcional).
     *     responses:
     *       200:
     *         description: Creador actualizado con éxito
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Creador actualizado con éxito
     *       400:
     *         description: Error por falta de nombre_creador
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *       500:
     *         description: Error interno al actualizar el creador
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Error al actualizar el creador en la base de datos o la imagen en Cloudinary
     */
    router.post("/update-creator", upload.fields([{ name: "imagen", maxCount: 1 }]), updateCreator);

    /**
     * @swagger
     * /admin/delete-multimedia:
     *   post:
     *     summary: Borra un contenido multimedia
     *     description: Elimina un contenido multimedia existente a partir de su ID.
     *     tags:
     *       - Admin
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id_cm:
     *                 type: integer
     *                 description: ID del contenido multimedia a eliminar
     *     responses:
     *       200:
     *         description: Contenido multimedia borrado con éxito
     *       400:
     *         description: Faltan parámetros necesarios
     *       500:
     *         description: Error interno del servidor
     */
    router.post("/delete-multimedia", deleteMultimedia);

    /**
     * @swagger
     * /admin/delete-album:
     *   post:
     *     summary: Borra un álbum
     *     description: Elimina un álbum existente a partir de su ID.
     *     tags:
     *       - Admin
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id_album:
     *                 type: integer
     *                 description: ID del álbum a eliminar
     *     responses:
     *       200:
     *         description: Álbum borrado con éxito
     *       400:
     *         description: Faltan parámetros necesarios
     *       500:
     *         description: Error interno del servidor
     */
    router.post("/delete-album", deleteAlbum);

    /**
     * @swagger
     * /admin/delete-podcast:
     *   post:
     *     summary: Borra un podcast
     *     description: Elimina un podcast existente a partir de su ID.
     *     tags:
     *       - Admin
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id_podcast:
     *                 type: integer
     *                 description: ID del podcast a eliminar
     *     responses:
     *       200:
     *         description: Podcast borrado con éxito
     *       400:
     *         description: Faltan parámetros necesarios
     *       500:
     *         description: Error interno del servidor
     */
    router.post("/delete-podcast", deletePodcast);

    /**
     * @swagger
     * /admin/delete-creator:
     *   post:
     *     summary: Borra un creador
     *     description: Elimina un creador existente a partir de su nombre.
     *     tags:
     *       - Admin
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nombre_creador:
     *                 type: string
     *                 description: Nombre del creador a eliminar
     *                 example: "Juan Pérez"
     *     responses:
     *       200:
     *         description: Creador borrado con éxito
     *       400:
     *         description: Faltan parámetros necesarios
     *       500:
     *         description: Error interno del servidor
     */
    router.post("/delete-creator", deleteCreador);

    return router;
};
