const { obtenerMultimediaSimilares } = require("./buscadorMultimedia");
const { obtenerCreadoresSimilares } = require("./buscadorCreador");
const { obtenerDiscosSimilares } = require("./buscadorAlbum");
const { obtenerPodcastsSimilares } = require("./buscadorPodcast");
const { obtenerUsuariosSimilares } = require("./buscadorUsuario");
const { obtenerListasSimilares } = require("./buscadorLista");
const client = require("../../db");

// Función auxiliar para manejar los errores y devolver null en caso de fallo
const safeQuery = async (queryFunction, cadena) => {
    try {
        return await queryFunction(cadena);
    } catch (error) {
        console.error(`Error al obtener datos: ${error.message}`);
        return null; // En caso de error, devolver null
    }
};

const popularSongs = async (artista) => {
    try {
        // Realiza la consulta SQL para obtener las canciones del artista
        const query = `
            SELECT cm.id_cm, cm.titulo, cm.link_imagen, cm.duracion, cm.fecha_pub,
                   ap.nombre_artista AS cantante,
                   (SELECT GROUP_CONCAT(f.nombre_artista) 
                    FROM Featuring f 
                    WHERE f.id_cancion = c.id_cancion AND f.nombre_artista != ap.nombre_artista) AS feat
            FROM Cancion c
            JOIN Artista_principal ap ON c.id_cancion = ap.id_cancion
            JOIN Contenido_multimedia cm ON c.id_cancion = cm.id_cm
            WHERE ap.nombre_artista = ?
            ORDER BY c.n_repros DESC
            LIMIT 5
        `;

        // Ejecuta la consulta usando el nombre del artista pasado como parámetro
        const result = await client.execute(query, [artista]);

        // Accede a la propiedad 'rows' del resultado
        const rows = result.rows;

        // Si no hay filas, devuelve un array vacío
        if (rows.length === 0) {
            console.log("No se encontraron canciones para el artista:", artista);
            return [];
        }

        console.log(rows);

        // Devuelve las canciones en el formato deseado
        return rows.map((row) => ({
            id_cm: row.id_cm,
            titulo: row.titulo,
            link_imagen: row.link_imagen,
            duracion: row.duracion,
            fecha_pub: row.fecha_pub,
            cantante: row.cantante,
            tipo: "Canción",
            similitud: 3,
            feat: row.feat ? row.feat.split(",") : null, // Si hay artistas de featuring, los separa en un array
        }));
    } catch (error) {
        console.error("Error al obtener canciones populares:", error);
        throw error;
    }
};

const popularEpisodes = async (podcaster) => {
    try {
        // Realiza la consulta SQL para obtener las canciones del artista
        const query = `
            SELECT cm.id_cm, cm.titulo, cm.link_imagen, cm.duracion, cm.fecha_pub,
                   p.nombre AS podcast
            FROM Episodio ep
            JOIN Tiene_podcast tp ON ep.id_podcast = tp.id_podcast
            JOIN Contenido_multimedia cm ON ep.id_ep = cm.id_cm
            JOIN Podcast p ON ep.id_podcast = p.id_podcast
            WHERE tp.nombre_podcaster = ?
            LIMIT 5
        `;

        // Ejecuta la consulta usando el nombre del artista pasado como parámetro
        const result = await client.execute(query, [podcaster]);

        // Accede a la propiedad 'rows' del resultado
        const rows = result.rows;

        // Si no hay filas, devuelve un array vacío
        if (rows.length === 0) {
            console.log("No se encontraron episodios para el artista:", artista);
            return [];
        }

        console.log(rows);

        // Devuelve los episodios en el formato deseado
        return rows.map((row) => ({
            id_cm: row.id_cm,
            titulo: row.titulo,
            link_imagen: row.link_imagen,
            duracion: row.duracion,
            fecha_pub: row.fecha_pub,
            podcast: row.podcast,
            tipo: "Episodio",
            similitud: 3,
        }));
    } catch (error) {
        console.error("Error al obtener canciones populares:", error);
        throw error;
    }
};

const albumesOfCreator = async (creador) => {
    try {
        // Realiza la consulta SQL para obtener los álbumes del creador
        const query = `
            SELECT a.id_album, a.nombre_album, a.link_imagen, a.fecha_pub,
                   aa.nombre_artista AS artista
            FROM Album a
            JOIN Artista_posee_albumes aa ON a.id_album = aa.id_album
            WHERE aa.nombre_artista = ?
            LIMIT 5
        `;

        // Ejecuta la consulta usando el nombre del artista pasado como parámetro
        const result = await client.execute(query, [creador]);

        // Accede a la propiedad 'rows' del resultado
        const rows = result.rows;

        // Si no hay filas, devuelve un array vacío
        if (rows.length === 0) {
            console.log("No se encontraron álbumes para el creador:", creador);
            return [];
        }

        console.log(rows);

        // Devuelve los álbumes en el formato deseado
        return rows.map((row) => ({
            id_album: row.id_album,
            nombre_album: row.nombre_album,
            link_imagen: row.link_imagen,
            fecha_pub: row.fecha_pub,
            artistas: row.artista,
            similitud: 3,
        }));
    } catch (error) {
        console.error("Error al obtener álbumes populares:", error);
        throw error;
    }
};

const podcastOfCreator = async (creador) => {
    try {
        // Realiza la consulta SQL para obtener los episodios del creador
        const query = `
            SELECT p.id_podcast, p.nombre, p.link_imagen
            FROM Podcast p
            JOIN Tiene_podcast tp ON p.id_podcast = tp.id_podcast
            WHERE tp.nombre_podcaster = ?
            LIMIT 5
        `;

        // Ejecuta la consulta usando el nombre del artista pasado como parámetro
        const result = await client.execute(query, [creador]);

        // Accede a la propiedad 'rows' del resultado
        const rows = result.rows;

        // Si no hay filas, devuelve un array vacío
        if (rows.length === 0) {
            console.log("No se encontraron episodios para el creador:", creador);
            return [];
        }

        console.log(rows);

        // Devuelve los episodios en el formato deseado
        return rows.map((row) => ({
            id_podcast: row.id_podcast,
            nombre: row.nombre,
            link_imagen: row.link_imagen,
            similitud: 3,
        }));
    } catch (error) {
        console.error("Error al obtener episodios populares:", error);
        throw error;
    }
};

// Función que maneja la petición HTTP
const searchGlobal = async (req, res) => {
    try {
        const { cadena } = req.query;

        if (!cadena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Realizar las consultas de manera segura
        let multimediaSimilares = await safeQuery(obtenerMultimediaSimilares, cadena);
        const creadoresSimilares = await safeQuery(obtenerCreadoresSimilares, cadena);
        let albumesSimilares = await safeQuery(obtenerDiscosSimilares, cadena);
        let podcastsSimilares = await safeQuery(obtenerPodcastsSimilares, cadena);
        const usuariosSimilares = await safeQuery(obtenerUsuariosSimilares, cadena);
        const listasSimilares = await safeQuery(obtenerListasSimilares, cadena);

        // Verificar creadores con similitud por debajo de 1
        const creadoresConSimilitudBaja = creadoresSimilares.filter(
            (creador) => creador.similitud <= 1
        );

        let hayCreadoresIguales = false;
        let multimediaPopular = [];
        for (let creador of creadoresConSimilitudBaja) {
            if (creador.tipo === "Artista") {
                hayCreadoresIguales = true;

                // Si el creador es un artista, obtener sus canciones más populares
                multimediaPopular = await popularSongs(creador.nombre_creador);

                const albumesCreador = await albumesOfCreator(creador.nombre_creador);
                if (albumesCreador.length > 0) {
                    let albumesFiltrado = albumesSimilares.filter((item) => item.similitud < 2);
                    albumesSimilares = [...albumesFiltrado, ...albumesCreador];
                }
            } else {
                hayCreadoresIguales = true;
                // Si el creador es un podcaster, obtener sus episodios más populares
                multimediaPopular = await popularEpisodes(creador.nombre_creador);

                const podcastsCreador = await podcastOfCreator(creador.nombre_creador);
                if (podcastsCreador.length > 0) {
                    let podcastsFiltrados = podcastsSimilares.filter((item) => item.similitud < 2);
                    podcastsSimilares = [...podcastsFiltrados, ...podcastsCreador];
                }
            }
        }

        if (hayCreadoresIguales === true) {
            let multimediaFiltrado = multimediaSimilares.filter((item) => item.similitud < 2);
            multimediaSimilares = [...multimediaFiltrado, ...multimediaPopular];
        }
        return res.status(200).json({
            multimedia: multimediaSimilares,
            creadores: creadoresSimilares,
            albumes: albumesSimilares,
            podcasts: podcastsSimilares,
            usuarios: usuariosSimilares,
            listas: listasSimilares,
        });
    } catch (error) {
        console.error("Error al obtener contenido multimedia:", error);
        return res.status(500).json({
            message: "Hubo un error al obtener contenido multimedia",
        });
    }
};

module.exports = { searchGlobal };
