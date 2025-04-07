const client = require("../../db");
const utils = require("../utils/buscadorUtils");
const { distance } = require("fastest-levenshtein");

// Función que contiene la lógica de negocio para obtener usuarios similares
const obtenerUsuariosSimilares = async (cadena) => {
    if (!cadena) {
        throw new Error("La cadena no puede estar vacía");
    }

    const cadenaNormalizada = utils.quitarTildesYPuntuacion(cadena);

    // Consulta para obtener todos los usuarios
    const result = await client.execute(`
        SELECT nombre_usuario, link_compartir, correo 
        FROM Usuario;
    `);

    // Ordenar los usuarios por la cantidad de coincidencias
    const usuariosConSimilitud = result.rows.map((usuario) => {
        const nombreNormalizado = utils.quitarTildesYPuntuacion(usuario.nombre_usuario);

        let dist = distance(cadenaNormalizada, nombreNormalizado);

        // Bonificación proporcional a la coincidencia inicial
        const bono = utils.bonificacionPrefijo(nombreNormalizado, cadenaNormalizada);
        dist -= bono; // Cuanto más coincidan al principio, más se resta

        return {
            ...usuario,
            similitud: Math.max(0, dist),
        };
    });

    // Ordenar por la cantidad de coincidencias (más coincidencias = más relevante)
    usuariosConSimilitud.sort((a, b) => a.similitud - b.similitud);

    // Tomamos los 10 primeros resultados
    const top10 = usuariosConSimilitud.slice(0, 10);

    return top10;
};

// Función que maneja la petición HTTP
const getSimilarUsuarios = async (req, res) => {
    try {
        const { cadena } = req.query;

        if (!cadena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Llamada a la función que contiene la lógica de negocio
        const usuariosSimilares = await obtenerUsuariosSimilares(cadena);

        return res.status(200).json({ usuarios: usuariosSimilares });
    } catch (error) {
        console.error("Error al obtener usuarios similares:", error);
        return res.status(500).json({
            message: "Hubo un error al obtener usuarios similares",
        });
    }
};

module.exports = {
    getSimilarUsuarios,
    obtenerUsuariosSimilares,
};
