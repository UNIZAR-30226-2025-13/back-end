const express = require('express');
const router = express.Router();
const { getHome } = require('../controllers/homeController');
const { getHomeMusic } = require('../controllers/homeMusicController');
const { getHomePodcast } = require('../controllers/homePodcastController');

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Endpoints relacionados con la portada inicial de la aplicación
 */

/**
 * @swagger
 *   /home:
 *     get:
 *       summary: Obtener información para la portada inicial de la aplicación
 *       description: Esta API devuelve la información para la portada inicial, que incluye datos de podcasts, listas de reproducción de géneros, idiomas y artistas.
 *       tags: [Home]
 *       responses:
 *         200:
 *           description: Información para la portada inicial obtenida correctamente.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   podcasts:
 *                     type: array
 *                     description: Lista de los 10 podcasts con su ID, nombre y enlace a la imagen.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_podcast:
 *                           type: integer
 *                           description: El ID único del podcast.
 *                         nombre:
 *                           type: string
 *                           description: El nombre del podcast.
 *                         link_imagen:
 *                           type: string
 *                           description: Enlace a la imagen del podcast.
 *                   listas_genero_info:
 *                     type: array
 *                     description: Listas de reproducción de géneros, con su ID, nombre y color.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_lista:
 *                           type: integer
 *                           description: El ID de la lista de reproducción.
 *                         nombre:
 *                           type: string
 *                           description: El nombre de la lista de reproducción.
 *                         color:
 *                           type: string
 *                           description: El color de la lista de reproducción.
 *                   listas_idioma_info:
 *                     type: array
 *                     description: Listas de reproducción de idiomas, con su ID, nombre y color.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_lista:
 *                           type: integer
 *                           description: El ID de la lista de reproducción.
 *                         nombre:
 *                           type: string
 *                           description: El nombre de la lista de reproducción.
 *                         color:
 *                           type: string
 *                           description: El color de la lista de reproducción.
 *                   listas_artistas_info:
 *                     type: array
 *                     description: Listas de reproducción de artistas, con su ID, nombre, nombre del creador y enlace a la imagen del creador.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_lista:
 *                           type: integer
 *                           description: El ID de la lista de reproducción.
 *                         nombre:
 *                           type: string
 *                           description: El nombre de la lista de reproducción.
 *                         nombre_creador:
 *                           type: string
 *                           description: El nombre del creador/artista de la lista de reproducción.
 *                         link_imagen:
 *                           type: string
 *                           description: Enlace a la imagen del creador/artista.
 *         500:
 *           description: Error interno del servidor al obtener la información para la portada.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Detalle del error ocurrido al intentar obtener la información para la portada.
 */
router.get('/home', getHome);

/**
 * @swagger
 *  /home-music:
 *    get:
 *      summary: Obtiene información de listas de reproducción de géneros, idiomas, artistas, canciones aleatorias y un artista random.
 *      description: Este endpoint retorna las listas de reproducción de géneros, idiomas y artistas, además de un artista random y sus canciones y álbumes más recientes.
 *      tags: [Home]
 *      responses:
 *        200:
 *          description: Información de la portada inicial de música.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  listas_genero_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        color:
 *                          type: string
 *                  listas_idioma_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        color:
 *                          type: string
 *                  listas_artistas_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        nombre_creador:
 *                          type: string
 *                        link_imagen:
 *                          type: string
 *                  listas_aleatorio_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        color:
 *                          type: string
 *                  artista:
 *                    type: object
 *                    properties:
 *                      nombre_artista:
 *                        type: string
 *                      link_imagen:
 *                        type: string
 *                      canciones_albumes:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: integer
 *                            titulo:
 *                              type: string
 *                            link_imagen:
 *                              type: string
 *                            fecha_pub:
 *                              type: string
 *                              format: date
 *                            tipo:
 *                              type: string
 *        500:
 *          description: Error al obtener la información de música.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Hubo un error al obtener home de música"
 */
router.get('/home-music', getHomeMusic);

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Endpoints relacionados con la portada inicial de la aplicación
 */

/**
 * @swagger
 *   /home:
 *     get:
 *       summary: Obtener información para la portada inicial de la aplicación
 *       description: Esta API devuelve la información para la portada inicial, que incluye datos de podcasts, listas de reproducción de géneros, idiomas y artistas.
 *       tags: [Home]
 *       responses:
 *         200:
 *           description: Información para la portada inicial obtenida correctamente.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   podcasts:
 *                     type: array
 *                     description: Lista de los 10 podcasts con su ID, nombre y enlace a la imagen.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_podcast:
 *                           type: integer
 *                           description: El ID único del podcast.
 *                         nombre:
 *                           type: string
 *                           description: El nombre del podcast.
 *                         link_imagen:
 *                           type: string
 *                           description: Enlace a la imagen del podcast.
 *                   listas_genero_info:
 *                     type: array
 *                     description: Listas de reproducción de géneros, con su ID, nombre y color.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_lista:
 *                           type: integer
 *                           description: El ID de la lista de reproducción.
 *                         nombre:
 *                           type: string
 *                           description: El nombre de la lista de reproducción.
 *                         color:
 *                           type: string
 *                           description: El color de la lista de reproducción.
 *                   listas_idioma_info:
 *                     type: array
 *                     description: Listas de reproducción de idiomas, con su ID, nombre y color.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_lista:
 *                           type: integer
 *                           description: El ID de la lista de reproducción.
 *                         nombre:
 *                           type: string
 *                           description: El nombre de la lista de reproducción.
 *                         color:
 *                           type: string
 *                           description: El color de la lista de reproducción.
 *                   listas_artistas_info:
 *                     type: array
 *                     description: Listas de reproducción de artistas, con su ID, nombre, nombre del creador y enlace a la imagen del creador.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id_lista:
 *                           type: integer
 *                           description: El ID de la lista de reproducción.
 *                         nombre:
 *                           type: string
 *                           description: El nombre de la lista de reproducción.
 *                         nombre_creador:
 *                           type: string
 *                           description: El nombre del creador/artista de la lista de reproducción.
 *                         link_imagen:
 *                           type: string
 *                           description: Enlace a la imagen del creador/artista.
 *         500:
 *           description: Error interno del servidor al obtener la información para la portada.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Detalle del error ocurrido al intentar obtener la información para la portada.
 */
router.get('/home', getHome);

/**
 * @swagger
 *  /home-music:
 *    get:
 *      summary: Obtiene información de listas de reproducción de géneros, idiomas, artistas, canciones aleatorias y un artista random.
 *      description: Este endpoint retorna las listas de reproducción de géneros, idiomas y artistas, además de un artista random y sus canciones y álbumes más recientes.
 *      tags: [Home]
 *      responses:
 *        200:
 *          description: Información de la portada inicial de música.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  listas_genero_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        color:
 *                          type: string
 *                  listas_idioma_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        color:
 *                          type: string
 *                  listas_artistas_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        nombre_creador:
 *                          type: string
 *                        link_imagen:
 *                          type: string
 *                  listas_aleatorio_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        color:
 *                          type: string
 *                  artista:
 *                    type: object
 *                    properties:
 *                      nombre_artista:
 *                        type: string
 *                      link_imagen:
 *                        type: string
 *                      canciones_albumes:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: integer
 *                            titulo:
 *                              type: string
 *                            link_imagen:
 *                              type: string
 *                            fecha_pub:
 *                              type: string
 *                              format: date
 *                              description: Fecha de publicación de la canción YYYY-MM-DD
 *                              example: "2021-09-30" 
 *                            tipo:
 *                              type: string
 *        500:
 *          description: Error al obtener la información de música.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Hubo un error al obtener home de música"
 */
router.get('/home-music', getHomeMusic);

/**
 * @swagger
 *  /home-podcast:
 *    get:
 *      summary: Obtiene información de podcasts, listas de reproducción de podcasters, episodios aleatorios y un podcast random.
 *      description: Este endpoint retorna los podcasts destacados, las listas de reproducción de podcasters, episodios aleatorios y un podcast random con sus episodios más recientes.
 *      tags: [Home]
 *      responses:
 *        200:
 *          description: Información de la portada inicial de podcasts.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  podcasts:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_podcast:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        link_imagen:
 *                          type: string
 *                  listas_podcasters_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        nombre_creador:
 *                          type: string
 *                        link_imagen:
 *                          type: string
 *                  listas_aleatorio_info:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id_lista:
 *                          type: integer
 *                        nombre:
 *                          type: string
 *                        color:
 *                          type: string
 *                  podcast:
 *                    type: object
 *                    properties:
 *                      nombre_podcast:
 *                        type: string
 *                      foto_podcast:
 *                        type: string
 *                      episodios_recientes:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            id_ep:
 *                              type: integer
 *                            titulo:
 *                              type: string
 *                            link_imagen:
 *                              type: string
 *                            fecha_pub:
 *                              type: string
 *                              format: date
 *                              description: Fecha de publicación de la canción YYYY-MM-DD
 *                              example: "2021-09-30" 
 *        500:
 *          description: Error al obtener la información de podcasts.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Hubo un error al obtener home de los podcasts"
 */
router.get('/home-podcast', getHomePodcast);

module.exports = router;