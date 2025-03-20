const client = require("../../db");
const utils = require("../utils/buscadorUtils");

// Función que contiene la lógica de negocio para obtener creadores similares
const obtenerCreadoresSimilares = async (cadena) => {
    if (!cadena) {
        throw new Error("La cadena no puede estar vacía");
    }

    const cadenaNormalizada = utils.quitarTildesYPuntuacion(cadena);

    // Consulta para obtener todos los creadores
    const result = await client.execute(`SELECT nombre_creador, link_imagen FROM Creador`);

    // Calcular la similitud de cada creador
    const creadoresConSimilitud = result.rows.map((creador) => {
        const nombreNormalizado = utils.quitarTildesYPuntuacion(creador.nombre_creador);
        const palabras = nombreNormalizado.split(" ");

        // Calcular la distancia más baja contra cualquier palabra
        const minDistancia = Math.min(
            ...palabras.map((palabra) => utils.calcularLevenshtein(cadenaNormalizada, palabra))
        );

        return {
            ...creador,
            similitud: minDistancia,
        };
    });

    // Ordenar creadores por similitud
    creadoresConSimilitud.sort((a, b) => a.similitud - b.similitud);

    const top5 = creadoresConSimilitud.slice(0, 5);

    if (top5.length === 0) {
        throw new Error("No se encontraron creadores similares.");
    }

    const nombresTop5 = top5.map((c) => c.nombre_creador);

    // Consulta para obtener los podcasteros
    const podcasterosResult = await client.execute(
        `SELECT nombre_podcaster FROM Podcaster WHERE nombre_podcaster IN (${nombresTop5
            .map(() => "?")
            .join(",")})`,
        nombresTop5
    );

    const podcasterosSet = new Set(podcasterosResult.rows.map((p) => p.nombre_podcaster));

    // Añadir tipo (Podcaster o Artista) a cada creador
    const top5ConTipo = top5.map((creador) => {
        const tipo = podcasterosSet.has(creador.nombre_creador) ? "Podcaster" : "Artista";
        return {
            ...creador,
            tipo,
        };
    });

    return top5ConTipo;
};

// Función que maneja la petición HTTP
const getSimilarCreators = async (req, res) => {
    try {
        const { cadena } = req.query;

        if (!cadena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Llamada a la función que contiene la lógica de negocio
        const creadoresSimilares = await obtenerCreadoresSimilares(cadena);

        return res.status(200).json({ creadores: creadoresSimilares });
    } catch (error) {
        console.error("Error al obtener contenido en el buscador:", error);
        return res.status(500).json({
            message: "Hubo un error al obtener contenido en el buscador",
        });
    }
};

module.exports = {
    obtenerCreadoresSimilares,
    getSimilarCreators,
};
