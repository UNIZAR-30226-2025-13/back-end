const client = require("../../db");
const utils = require("../utils/buscadorUtils");
const { distance } = require("fastest-levenshtein");

// Función que contiene la lógica del negocio
const obtenerDiscosSimilares = async (cadena) => {
    if (!cadena) {
        throw new Error("La cadena no puede estar vacía");
    }

    const cadenaNormalizada = utils.quitarTildesYPuntuacion(cadena);

    const result = await client.execute(`
        SELECT
            alb.id_album,
            alb.nombre_album,
            alb.link_imagen,
            alb.fecha_pub,
            STRING_AGG(apa.nombre_artista, ', ') AS artistas
        FROM Album alb
        JOIN Artista_posee_albumes apa ON alb.id_album = apa.id_album
        WHERE alb.es_disco = true
        GROUP BY alb.id_album, alb.nombre_album, alb.link_imagen, alb.fecha_pub;
    `);

    const discosConSimilitud = result.rows.map((disco) => {
        const nombreNormalizado = utils.quitarTildesYPuntuacion(disco.nombre_album);

        let dist = distance(cadenaNormalizada, nombreNormalizado);

        const bono = utils.bonificacionPrefijo(nombreNormalizado, cadenaNormalizada);
        dist -= bono; // Cuanto más coincidan al principio, más se resta

        return {
            ...disco,
            similitud: Math.max(0, dist),
        };
    });

    discosConSimilitud.sort((a, b) => a.similitud - b.similitud);

    return discosConSimilitud.slice(0, 10);
};

// Función que maneja las peticiones HTTP
const getSimilarAlbum = async (req, res) => {
    try {
        const { cadena } = req.query;

        if (!cadena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        const top5 = await obtenerDiscosSimilares(cadena);

        return res.status(200).json(top5);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

module.exports = {
    getSimilarAlbum,
    obtenerDiscosSimilares,
};
