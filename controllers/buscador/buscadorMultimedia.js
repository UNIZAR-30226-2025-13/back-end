const client = require("../../db");
const utils = require("../utils/buscadorUtils");
const { distance } = require("fastest-levenshtein");

const obtenerMultimediaSimilares = async (cadena) => {
    if (!cadena) {
        throw new Error("La cadena no puede estar vacía");
    }

    const cadenaNormalizada = utils.quitarTildesYPuntuacion(cadena);

    // Consulta para obtener todos los contenidos multimedia
    const result = await client.execute(
        `SELECT id_cm, titulo, link_imagen, duracion, fecha_pub FROM Contenido_multimedia`
    );

    // Filtrar los contenidos con similitud válida
    const multimediaConSimilitud = result.rows
        .map((cm) => {
            const nombreNormalizado = utils.quitarTildesYPuntuacion(cm.titulo);

            let dist = distance(cadenaNormalizada, nombreNormalizado);

            // Bonificación proporcional a la coincidencia inicial
            const bono = utils.bonificacionPrefijo(nombreNormalizado, cadenaNormalizada);
            dist -= bono; // Cuanto más coincidan al principio, más se resta

            return { ...cm, similitud: Math.max(0, dist) };
        })
        .filter((cm) => cm.similitud !== Number.MAX_VALUE); // Evita elementos sin coincidencias

    if (multimediaConSimilitud.length === 0) {
        throw new Error("No se encontraron contenidos multimedia similares.");
    }

    // Ordenar por similitud (menor distancia = más relevante)
    multimediaConSimilitud.sort((a, b) => a.similitud - b.similitud);

    // Tomamos los 10 primeros resultados
    const top10 = multimediaConSimilitud.slice(0, 10);
    const idsTop10 = top10.map((c) => c.id_cm);

    // Obtener episodios relacionados
    const episodiosResult = await client.execute(
        `SELECT e.id_ep AS id_ep, e.id_podcast, p.nombre AS nombre_podcast 
         FROM Episodio e
         JOIN Podcast p ON e.id_podcast = p.id_podcast
         WHERE e.id_ep IN (${idsTop10.map(() => "?").join(",")})`,
        idsTop10
    );

    const episodiosMap = new Map();
    episodiosResult.rows.forEach((ep) => {
        episodiosMap.set(ep.id_ep, ep.nombre_podcast);
    });

    // Obtener artistas principales y featurings
    const cantantesResult = await client.execute(
        `SELECT 
            a.nombre_artista, 
            a.id_cancion,
            COALESCE(GROUP_CONCAT(DISTINCT f.nombre_artista), '') AS artistas_feat
         FROM Artista_principal a
         LEFT JOIN Featuring f ON a.id_cancion = f.id_cancion
         WHERE a.id_cancion IN (${idsTop10.map(() => "?").join(",")})
         GROUP BY a.id_cancion, a.nombre_artista`,
        idsTop10
    );

    const cantantesMap = new Map();
    const featuringMap = new Map();
    cantantesResult.rows.forEach((cant) => {
        cantantesMap.set(cant.id_cancion, cant.nombre_artista);
        featuringMap.set(cant.id_cancion, cant.artistas_feat);
    });

    // Mapear los contenidos multimedia
    return top10.map((cm) => ({
        ...cm,
        tipo: episodiosMap.has(cm.id_cm) ? "Episodio" : "Canción",
        podcast: episodiosMap.get(cm.id_cm) || null,
        cantante: cantantesMap.get(cm.id_cm) || null,
        feat: featuringMap.get(cm.id_cm) || null,
    }));
};

// Función que maneja la petición HTTP
const getSimilarMultimedia = async (req, res) => {
    try {
        const { cadena } = req.query;

        if (!cadena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Llamada a la función que contiene la lógica de negocio
        //const multimediaSimilares = await obtenerMultimediaSimilares(cadena);
        const multimediaSimilares = await obtenerMultimediaSimilares(cadena);

        return res.status(200).json({ top10Completo: multimediaSimilares });
    } catch (error) {
        console.error("Error al obtener contenido multimedia:", error);
        return res.status(500).json({
            message: "Hubo un error al obtener contenido multimedia",
        });
    }
};

module.exports = {
    getSimilarMultimedia,
    obtenerMultimediaSimilares,
};
