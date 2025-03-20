const client = require("../../db");
const utils = require("../utils/buscadorUtils");

// Función que contiene la lógica de negocio para obtener listas similares
const obtenerListasSimilares = async (cadena) => {
    if (!cadena) {
        throw new Error("La cadena no puede estar vacía");
    }

    const cadenaNormalizada = utils.quitarTildesYPuntuacion(cadena);

    // Consulta para obtener todas las listas de reproducción
    const result = await client.execute(
        `SELECT id_lista, nombre, color, link_compartir FROM Lista_reproduccion`
    );

    // Mapeamos las listas con similitud usando Levenshtein
    const listasConSimilitud = result.rows.map((lista) => {
        const nombreNormalizado = utils.quitarTildesYPuntuacion(lista.nombre);
        const palabras = nombreNormalizado.split(" ");

        const minDistancia = Math.min(
            ...palabras.map((palabra) => utils.calcularLevenshtein(cadenaNormalizada, palabra))
        );

        return {
            ...lista,
            similitud: minDistancia,
        };
    });

    // Ordenamos las listas por la similitud
    listasConSimilitud.sort((a, b) => a.similitud - b.similitud);

    // Tomamos las 5 listas más similares
    const top5 = listasConSimilitud.slice(0, 5);

    if (top5.length === 0) {
        throw new Error("No se encontraron listas similares.");
    }

    const idsTop5 = top5.map((l) => l.id_lista);

    // Consultamos si las listas son de episodios
    const listasEpisodiosResult = await client.execute(
        `SELECT id_lista_ep FROM Lista_Episodios WHERE id_lista_ep IN (${idsTop5
            .map(() => "?")
            .join(",")})`,
        idsTop5
    );

    const listasEpisodiosSet = new Set(listasEpisodiosResult.rows.map((le) => le.id_lista_ep));

    // Agregamos el tipo a cada lista (Lista de Episodios o Lista de Canciones)
    const top5ConTipo = top5.map((lista) => {
        const tipo = listasEpisodiosSet.has(lista.id_lista)
            ? "Lista de Episodios"
            : "Lista de Canciones";
        return {
            ...lista,
            tipo,
        };
    });

    return top5ConTipo;
};

// Función que maneja la petición HTTP
const getSimilarListas = async (req, res) => {
    try {
        const { cadena } = req.query;

        if (!cadena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Llamada a la función que contiene la lógica de negocio
        const listasSimilares = await obtenerListasSimilares(cadena);

        return res.status(200).json({ listas: listasSimilares });
    } catch (error) {
        console.error("Error al obtener listas similares:", error);
        return res.status(500).json({
            message: "Hubo un error al obtener listas similares",
        });
    }
};

module.exports = {
    getSimilarListas,
    obtenerListasSimilares,
};
