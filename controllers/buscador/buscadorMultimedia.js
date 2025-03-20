const client = require("../../db");
const utils = require("../utils/buscadorUtils");

// Función que contiene la lógica de negocio para obtener contenido multimedia similar
const obtenerMultimediaSimilares = async (cadena) => {
    if (!cadena) {
        throw new Error("La cadena no puede estar vacía");
    }

    const cadenaNormalizada = utils.quitarTildesYPuntuacion(cadena);

    // Consulta para obtener todos los contenidos multimedia
    const result = await client.execute(`SELECT id_cm, titulo, link_imagen, duracion, fecha_pub
                                         FROM Contenido_multimedia`);

    // Filtrar los contenidos que contienen la subcadena
    const multimediaFiltrados = result.rows.filter((cm) => {
        const nombreNormalizado = utils.quitarTildesYPuntuacion(cm.titulo);
        return utils.contieneSubcadena(cadenaNormalizada, nombreNormalizado);
    });

    if (multimediaFiltrados.length === 0) {
        throw new Error("No se encontraron contenidos multimedia similares.");
    }

    // Ordenar los contenidos por la cantidad de palabras que contienen la subcadena
    const multimediaConSimilitud = multimediaFiltrados.map((cm) => {
        const nombreNormalizado = utils.quitarTildesYPuntuacion(cm.titulo);
        const palabras = nombreNormalizado.split(" ");
        const coincidencias = palabras.filter((palabra) =>
            utils.contieneSubcadena(cadenaNormalizada, palabra)
        ).length;
        return {
            ...cm,
            similitud: coincidencias,
        };
    });

    // Ordenar por la cantidad de coincidencias (más coincidencias = más relevante)
    multimediaConSimilitud.sort((a, b) => b.similitud - a.similitud);

    // Tomamos los 10 primeros resultados
    const top10 = multimediaConSimilitud.slice(0, 10);

    const idsTop10 = top10.map((c) => c.id_cm);

    // Obtener los episodios relacionados
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

    // Obtener los artistas principales y featurings
    const cantantes_result = await client.execute(
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

    const cantantesSet = new Map();
    const featuringSet = new Map();
    cantantes_result.rows.forEach((cant) => {
        cantantesSet.set(cant.id_cancion, cant.nombre_artista);
        featuringSet.set(cant.id_cancion, cant.artistas_feat);
    });

    // Mapear los contenidos multimedia y asignar tipo, nombre del podcast, artistas, etc.
    const top10Completo = top10.map((cm) => {
        const tipo = episodiosMap.has(cm.id_cm) ? "Episodio" : "Canción";
        const nombrePodcast = episodiosMap.get(cm.id_cm) || null;
        const nombreArtista = cantantesSet.get(cm.id_cm) || null;
        const nombreFeat = featuringSet.get(cm.id_cm) || null;
        return {
            ...cm,
            tipo,
            podcast: nombrePodcast,
            cantante: nombreArtista,
            feat: nombreFeat,
        };
    });

    return top10Completo;
};

// Función que maneja la petición HTTP
const getSimilarMultimedia = async (req, res) => {
    try {
        const { cadena } = req.query;

        if (!cadena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Llamada a la función que contiene la lógica de negocio
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
