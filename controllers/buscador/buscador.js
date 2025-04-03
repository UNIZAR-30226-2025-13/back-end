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
        const albumesSimilares = await safeQuery(obtenerDiscosSimilares, cadena);
        const podcastsSimilares = await safeQuery(obtenerPodcastsSimilares, cadena);
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
