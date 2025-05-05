const express = require("express");
const router = express.Router();

const { getSimilarCreators } = require("../controllers/buscador/buscadorCreador");
const { getSimilarUsuarios } = require("../controllers/buscador/buscadorUsuario");
const { getSimilarMultimedia } = require("../controllers/buscador/buscadorMultimedia");
const { getSimilarAlbum } = require("../controllers/buscador/buscadorAlbum");
const { getSimilarListas } = require("../controllers/buscador/buscadorLista");
const { getSimilarPodcasts } = require("../controllers/buscador/buscadorPodcast");
const { getSimilarEpisodios } = require("../controllers/buscador/buscadorEpisodios");
const { searchGlobal } = require("../controllers/buscador/buscador");

/**
 * @swagger
 * tags:
 *   name: Buscador
 *   description: Endpoints relacionados con el buscador
 */

/**
 *   @swagger
 * /search-creator:
 *   get:
 *     summary: Obtiene creadores similares basados en una cadena de búsqueda
 *     tags: [Buscador]
 *     description: Devuelve una lista de creadores que coinciden con una cadena de búsqueda proporcionada. Los resultados incluyen el nombre del creador, su imagen, el nivel de similitud y su tipo (por ejemplo, Artista, Podcaster, etc.).
 *     parameters:
 *       - in: query
 *         name: cadena
 *         required: true
 *         description: Cadena de texto para buscar creadores similares.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de creadores similares encontrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 creadores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre_creador:
 *                         type: string
 *                         description: Nombre del creador.
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del creador.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *                       tipo:
 *                         type: string
 *                         description: Tipo de creador (e.g., Artista, Podcaster).
 *         example:
 *           creadores:
 *             - nombre_creador: "María Becerra"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740766759/maria-becerra-img_dqi1db.jpg"
 *               similitud: 0
 *               tipo: "Artista"
 *             - nombre_creador: "Mariang Maturana"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740765428/mariang-img_plzhnd.jpg"
 *               similitud: 2
 *               tipo: "Podcaster"
 *             - nombre_creador: "Harry Styles"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740766759/harry-styles-img_szp2fi.jpg"
 *               similitud: 3
 *               tipo: "Artista"
 *             - nombre_creador: "Emilia"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740766758/emilia-img_kx5rfj.jpg"
 *               similitud: 3
 *               tipo: "Artista"
 *             - nombre_creador: "Omar Courtz"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1741465266/omarcourtz_ehtb7t.jpg"
 *               similitud: 3
 *               tipo: "Artista"
 *       400:
 *         description: Error de validación, falta la cadena en la consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error en el servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hubo un error al obtener contenido en el buscador"
 */
router.get("/search-creator", getSimilarCreators);

/**
 *   @swagger
 * /search-multimedia:
 *   get:
 *     summary: Obtiene contenido multimedia similar basado en una cadena de búsqueda
 *     tags: [Buscador]
 *     description: Devuelve una lista de contenido multimedia (canciones, episodios, etc.) que coinciden con una cadena de búsqueda proporcionada. Los resultados incluyen el título, la imagen, la duración, la fecha de publicación, la similitud y el tipo de contenido.
 *     parameters:
 *       - in: query
 *         name: cadena
 *         required: true
 *         description: Cadena de texto para buscar contenido multimedia similar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de contenido multimedia similar encontrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 top10Completo:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_cm:
 *                         type: integer
 *                         description: ID del contenido multimedia.
 *                       titulo:
 *                         type: string
 *                         description: Título del contenido multimedia.
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del contenido multimedia.
 *                       duracion:
 *                         type: string
 *                         description: Duración del contenido multimedia.
 *                       fecha_pub:
 *                         type: string
 *                         description: Fecha de publicación del contenido multimedia.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *                       tipo:
 *                         type: string
 *                         description: Tipo de contenido multimedia (e.g., Canción, Episodio).
 *                       podcast:
 *                         type: string
 *                         description: Nombre del podcast, si aplica.
 *                       cantante:
 *                         type: string
 *                         description: Nombre del cantante, si aplica.
 *                       feat:
 *                         type: string
 *                         description: Artista colaborador, si aplica.
 *         example:
 *           top10Completo:
 *             - id_cm: 8
 *               titulo: "Entrevista sobre Salud Mental"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740770862/wild180_a1cf4i.jpg"
 *               duracion: "00:01:11"
 *               fecha_pub: "2024-02-22"
 *               similitud: 2
 *               tipo: "Episodio"
 *               podcast: "The Wild Project"
 *               cantante: null
 *               feat: null
 *             - id_cm: 38
 *               titulo: "Cuando me siento bien"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1741796350/cuandomesientobien_cdsfun.jpg"
 *               duracion: "00:03:04"
 *               fecha_pub: "2015-12-20"
 *               similitud: 2
 *               tipo: "Canción"
 *               podcast: null
 *               cantante: "Efecto Pasillo"
 *               feat: null
 *       400:
 *         description: Error de validación, falta la cadena en la consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error en el servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hubo un error al obtener contenido multimedia"
 */
router.get("/search-multimedia", getSimilarMultimedia);

/**
 *   @swagger
 * /search-album:
 *   get:
 *     summary: Obtiene álbumes similares basados en una cadena de búsqueda
 *     tags: [Buscador]
 *     description: Devuelve una lista de álbumes que coinciden con una cadena de búsqueda proporcionada. Los resultados incluyen el nombre del álbum, su imagen, la fecha de publicación, el artista y el nivel de similitud.
 *     parameters:
 *       - in: query
 *         name: cadena
 *         required: true
 *         description: Cadena de texto para buscar álbumes similares.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de álbumes similares encontrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_album:
 *                     type: integer
 *                     description: ID del álbum.
 *                   nombre_album:
 *                     type: string
 *                     description: Nombre del álbum.
 *                   link_imagen:
 *                     type: string
 *                     description: URL de la imagen del álbum.
 *                   fecha_pub:
 *                     type: string
 *                     description: Fecha de publicación del álbum.
 *                   artista:
 *                     type: string
 *                     description: Artista del álbum.
 *                   similitud:
 *                     type: integer
 *                     description: Nivel de similitud.
 *         example:
 *           - id_album: 2
 *             nombre_album: "DeBÍ TiRAR MáS FOToS"
 *             link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740768017/DTMF_pq1pgl.jpg"
 *             fecha_pub: "2025-01-05"
 *             artista: "Bad Bunny"
 *             similitud: 5
 *           - id_album: 12
 *             nombre_album: "Happy Birthday Flakko"
 *             link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1741471200/happybirthdayflakko_hjl8xm.jpg"
 *             fecha_pub: "2019-10-17"
 *             artista: "Rels B"
 *             similitud: 6
 *       400:
 *         description: Error de validación, falta la cadena en la consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error en el servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Error del servidor"
 */
router.get("/search-album", getSimilarAlbum);

/**
 *   @swagger
 * /search-usuario:
 *   get:
 *     summary: Obtiene usuarios similares basados en una cadena de búsqueda
 *     tags: [Buscador]
 *     description: Devuelve una lista de usuarios que coinciden con una cadena de búsqueda proporcionada. Los resultados incluyen el nombre del usuario, su correo, el enlace para compartir y el nivel de similitud.
 *     parameters:
 *       - in: query
 *         name: cadena
 *         required: true
 *         description: Cadena de texto para buscar usuarios similares.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios similares encontrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre_usuario:
 *                         type: string
 *                         description: Nombre del usuario.
 *                       link_compartir:
 *                         type: string
 *                         description: Enlace para compartir el perfil del usuario (puede estar vacío).
 *                       correo:
 *                         type: string
 *                         description: Correo electrónico del usuario.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *         example:
 *           usuarios:
 *             - nombre_usuario: "jorge"
 *               link_compartir: ""
 *               correo: "jorge@gmail.com"
 *               similitud: 1
 *       400:
 *         description: Error de validación, falta la cadena en la consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error en el servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hubo un error al obtener usuarios similares"
 */
router.get("/search-usuario", getSimilarUsuarios);

/**
 *   @swagger
 * /search-lista:
 *   get:
 *     summary: Obtiene listas similares basadas en una cadena de búsqueda
 *     tags: [Buscador]
 *     description: Devuelve una lista de listas que coinciden con una cadena de búsqueda proporcionada. Los resultados incluyen el nombre de la lista, el color, el enlace para compartir y el tipo de lista, junto con el nivel de similitud.
 *     parameters:
 *       - in: query
 *         name: cadena
 *         required: true
 *         description: Cadena de texto para buscar listas similares.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de listas similares encontrada correctamente
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
 *                         description: ID de la lista.
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la lista.
 *                       color:
 *                         type: string
 *                         description: Color de la lista.
 *                       link_compartir:
 *                         type: string
 *                         description: Enlace para compartir la lista.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *                       tipo:
 *                         type: string
 *                         description: Tipo de lista (por ejemplo, "Lista de Episodios", "Lista de Canciones").
 *         example:
 *           listas:
 *             - id_lista: 28
 *               nombre: "This is Jordi Wild"
 *               color: "#000000"
 *               link_compartir: "https://example.com/share/thisisjordiwild"
 *               similitud: 0
 *               tipo: "Lista de Episodios"
 *             - id_lista: 15
 *               nombre: "This is Bigflo & Oli"
 *               color: "#000000"
 *               link_compartir: "https://example.com/share/thisisbigflooli"
 *               similitud: 3
 *               tipo: "Lista de Canciones"
 *       400:
 *         description: Error de validación, falta la cadena en la consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error en el servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hubo un error al obtener listas similares"
 */
router.get("/search-lista", getSimilarListas);

/**
 *   @swagger
 * /search-podcast:
 *   get:
 *     summary: Obtiene podcasts similares basados en una cadena de búsqueda
 *     tags: [Buscador]
 *     description: Devuelve una lista de podcasts que coinciden con una cadena de búsqueda proporcionada. Los resultados incluyen el nombre del podcast, la imagen y el nivel de similitud.
 *     parameters:
 *       - in: query
 *         name: cadena
 *         required: true
 *         description: Cadena de texto para buscar podcasts similares.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de podcasts similares encontrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 podcasts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_podcast:
 *                         type: integer
 *                         description: ID del podcast.
 *                       nombre:
 *                         type: string
 *                         description: Nombre del podcast.
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del podcast.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *         example:
 *           podcasts:
 *             - id_podcast: 2
 *               nombre: "The Wild Project"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740768719/thewildproject_ufwldg.jpg"
 *               similitud: 0
 *             - id_podcast: 1
 *               nombre: "La Pija y la Quinqui"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740768719/lapijaylaquinqui_vrgwui.jpg"
 *               similitud: 3
 *       400:
 *         description: Error de validación, falta la cadena en la consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error en el servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hubo un error al obtener podcasts similares"
 */
router.get("/search-podcast", getSimilarPodcasts);

/**
 *  @swagger
 * /search-episodios:
 *  get:
 *    summary: Obtiene episodios similares basados en una cadena de búsqueda
 *    tags: [Buscador]
 *    description: Devuelve una lista de episodios que coinciden con una cadena de búsqueda proporcionada. Los resultados incluyen el ID del episodio, el nombre del podcast, la imagen, duración, fecha de publicación y nivel de similitud.
 *    parameters:
 *      - in: query
 *        name: cadena
 *        required: true
 *        description: Cadena de texto para buscar episodios similares.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Lista de episodios similares encontrada correctamente
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                top10Episodios:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id_cm:
 *                        type: string
 *                        description: ID del contenido multimedia (episodio)
 *                      titulo:
 *                        type: string
 *                        description: Título del episodio
 *                      link_imagen:
 *                        type: string
 *                        description: URL de la imagen del episodio
 *                      duracion:
 *                        type: integer
 *                        description: Duración del episodio en segundos
 *                      fecha_pub:
 *                        type: string
 *                        format: date
 *                        description: Fecha de publicación del episodio
 *                      similitud:
 *                        type: number
 *                        description: Nivel de similitud (menor es más similar)
 *                      tipo:
 *                        type: string
 *                        example: "Episodio"
 *                      id_podcast:
 *                        type: string
 *                        description: ID del podcast al que pertenece
 *                      podcast:
 *                        type: string
 *                        description: Nombre del podcast
 *      400:
 *        description: Falta el parámetro requerido `cadena`
 *      500:
 *        description: Error interno al buscar episodios similares
 */
router.get("/search-episodios", getSimilarEpisodios);

/**
 *   @swagger
 * /search:
 *   get:
 *     summary: Realiza una búsqueda global en varias categorías (multimedia, creadores, álbumes, podcasts, usuarios y listas)
 *     tags: [Buscador]
 *     description: Realiza una búsqueda en varias categorías como multimedia, creadores, álbumes, podcasts, usuarios y listas, devolviendo los resultados de cada categoría, si existen, o null si no se encuentra información.
 *     parameters:
 *       - in: query
 *         name: cadena
 *         required: true
 *         description: Cadena de texto para realizar la búsqueda en las diferentes categorías.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda en todas las categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 multimedia:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_cm:
 *                         type: integer
 *                         description: ID del contenido multimedia.
 *                       titulo:
 *                         type: string
 *                         description: Título del contenido multimedia.
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del contenido multimedia.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *                       tipo:
 *                         type: string
 *                         description: Tipo de contenido (Canción, Episodio, etc.).
 *                 creadores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre_creador:
 *                         type: string
 *                         description: Nombre del creador.
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del creador.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *                       tipo:
 *                         type: string
 *                         description: Tipo de creador (Artista, Podcaster, etc.).
 *                 albumes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_album:
 *                         type: integer
 *                         description: ID del álbum.
 *                       nombre_album:
 *                         type: string
 *                         description: Nombre del álbum.
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del álbum.
 *                       artista:
 *                         type: string
 *                         description: Nombre del artista.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *                 podcasts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_podcast:
 *                         type: integer
 *                         description: ID del podcast.
 *                       nombre:
 *                         type: string
 *                         description: Nombre del podcast.
 *                       link_imagen:
 *                         type: string
 *                         description: URL de la imagen del podcast.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre_usuario:
 *                         type: string
 *                         description: Nombre del usuario.
 *                       correo:
 *                         type: string
 *                         description: Correo electrónico del usuario.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *                 listas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_lista:
 *                         type: integer
 *                         description: ID de la lista.
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la lista.
 *                       color:
 *                         type: string
 *                         description: Color de la lista.
 *                       link_compartir:
 *                         type: string
 *                         description: Enlace para compartir la lista.
 *                       similitud:
 *                         type: integer
 *                         description: Nivel de similitud.
 *                       tipo:
 *                         type: string
 *                         description: Tipo de lista (Lista de Canciones, Lista de Episodios, etc.).
 *         example:
 *           multimedia: null
 *           creadores:
 *             - nombre_creador: "Jordi Wild"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740765428/jordi-wild-img_n8qkho.jpg"
 *               similitud: 2
 *               tipo: "Podcaster"
 *             - nombre_creador: "Cruz Cafuné"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740765429/cruz-cafune-img_kykhvz.jpg"
 *               similitud: 4
 *               tipo: "Artista"
 *           albumes:
 *             - id_album: 10
 *               nombre_album: "Harry's House"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740768013/harryysuvarita_nrkjeq.jpg"
 *               fecha_pub: "2022-05-20"
 *               artista: "Harry Styles"
 *               similitud: 3
 *           podcasts:
 *             - id_podcast: 2
 *               nombre: "The Wild Project"
 *               link_imagen: "https://res.cloudinary.com/djsm3jfht/image/upload/v1740768719/thewildproject_ufwldg.jpg"
 *               similitud: 4
 *           usuarios:
 *             - nombre_usuario: "jorge"
 *               correo: "jorge@gmail.com"
 *               similitud: 1
 *           listas:
 *             - id_lista: 28
 *               nombre: "This is Jordi Wild"
 *               color: "#000000"
 *               link_compartir: "https://example.com/share/thisisjordiwild"
 *               similitud: 2
 *               tipo: "Lista de Episodios"
 *       400:
 *         description: Error de validación, falta la cadena en la consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hay que rellenar todos los campos"
 *       500:
 *         description: Error en el servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         example:
 *           message: "Hubo un error al obtener contenido multimedia"
 */
router.get("/search", searchGlobal);

module.exports = router;
