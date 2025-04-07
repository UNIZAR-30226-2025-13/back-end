const client = require("../../db");
const utils = require("../utils/buscadorUtils");
const { distance } = require("fastest-levenshtein");

// Función que contiene la lógica de negocio para obtener podcasts similares
const obtenerPodcastsSimilares = async (cadena) => {
    if (!cadena) {
        throw new Error("La cadena no puede estar vacía");
    }

    const cadenaNormalizada = utils.quitarTildesYPuntuacion(cadena);

    // Consulta para obtener todos los podcasts
    const result = await client.execute(`SELECT id_podcast, nombre, link_imagen FROM Podcast`);

    // Mapeamos los podcasts con similitud usando Levenshtein
    const podcastsConSimilitud = result.rows.map((podcast) => {
        const nombreNormalizado = utils.quitarTildesYPuntuacion(podcast.nombre);

        let dist = distance(cadenaNormalizada, nombreNormalizado);

        // Bonificación proporcional a la coincidencia inicial
        const bono = utils.bonificacionPrefijo(nombreNormalizado, cadenaNormalizada);
        dist -= bono; // Cuanto más coincidan al principio, más se resta

        return {
            ...podcast,
            similitud: Math.max(0, dist),
        };
    });

    // Ordenamos los podcasts por la similitud
    podcastsConSimilitud.sort((a, b) => a.similitud - b.similitud);

    // Tomamos los 10 podcasts más similares
    const top10 = podcastsConSimilitud.slice(0, 10);

    if (top10.length === 0) {
        throw new Error("No se encontraron podcasts similares.");
    }

    return top10;
};

// Función que maneja la petición HTTP
const getSimilarPodcasts = async (req, res) => {
    try {
        const { cadena } = req.query;

        if (!cadena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Llamada a la función que contiene la lógica de negocio
        const podcastsSimilares = await obtenerPodcastsSimilares(cadena);

        return res.status(200).json({ podcasts: podcastsSimilares });
    } catch (error) {
        console.error("Error al obtener podcasts similares:", error);
        return res.status(500).json({
            message: "Hubo un error al obtener podcasts similares",
        });
    }
};

module.exports = {
    getSimilarPodcasts,
    obtenerPodcastsSimilares,
};
