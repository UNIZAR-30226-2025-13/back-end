const client = require("../../db");
const utils = require("../utils/buscadorUtils");
const { distance } = require("fastest-levenshtein");

const obtenerEpisodiosSimilares = async (cadena) => {
    if (!cadena) {
        throw new Error("La cadena no puede estar vacía");
    }

    const cadenaNormalizada = utils.quitarTildesYPuntuacion(cadena);

    // Obtener todos los contenidos multimedia
    const result = await client.execute(
        `SELECT id_cm, titulo, link_imagen, duracion, fecha_pub FROM Contenido_multimedia`
    );

    // Obtener IDs de episodios existentes
    const episodiosIDsResult = await client.execute(`SELECT id_ep FROM Episodio`);
    const idsEpisodiosSet = new Set(episodiosIDsResult.rows.map((row) => row.id_ep));

    // Filtrar y calcular similitud solo para episodios
    const episodiosSimilares = result.rows
        .filter((cm) => idsEpisodiosSet.has(cm.id_cm)) // Solo episodios
        .map((ep) => {
            const tituloNormalizado = utils.quitarTildesYPuntuacion(ep.titulo);
            let dist = distance(cadenaNormalizada, tituloNormalizado);
            const bono = utils.bonificacionPrefijo(tituloNormalizado, cadenaNormalizada);
            dist -= bono;

            return { ...ep, similitud: Math.max(0, dist) };
        })
        .sort((a, b) => a.similitud - b.similitud)
        .slice(0, 10);

    if (episodiosSimilares.length === 0) {
        throw new Error("No se encontraron episodios similares.");
    }

    // Obtener nombres de los podcasts
    const idsTop10 = episodiosSimilares.map((e) => e.id_cm);
    const podcastResult = await client.execute(
        `SELECT e.id_ep AS id_ep, p.nombre AS nombre_podcast 
         FROM Episodio e
         JOIN Podcast p ON e.id_podcast = p.id_podcast
         WHERE e.id_ep IN (${idsTop10.map(() => "?").join(",")})`,
        idsTop10
    );

    const podcastMap = new Map();
    podcastResult.rows.forEach((row) => {
        podcastMap.set(row.id_ep, row.nombre_podcast);
    });

    return episodiosSimilares.map((ep) => ({
        ...ep,
        tipo: "Episodio",
        id_podcast: podcastMap.get(ep.id_ep) || null,
        podcast: podcastMap.get(ep.id_cm) || null,
    }));
};

const getSimilarEpisodios = async (req, res) => {
    try {
        const { cadena } = req.query;

        if (!cadena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        const episodiosSimilares = await obtenerEpisodiosSimilares(cadena);

        return res.status(200).json({ top10Episodios: episodiosSimilares });
    } catch (error) {
        console.error("Error al obtener episodios similares:", error);
        return res.status(500).json({
            message: "Hubo un error al obtener episodios similares",
        });
    }
};

module.exports = {
    getSimilarEpisodios,
    obtenerEpisodiosSimilares,
};
