const { obtenerMultimediaSimilares } = require("./buscadorMultimedia");
const { obtenerCreadoresSimilares } = require("./buscadorCreador");
const { obtenerDiscosSimilares } = require("./buscadorAlbum");
const { obtenerPodcastsSimilares } = require("./buscadorPodcast");
const { obtenerUsuariosSimilares } = require("./buscadorUsuario");
const { obtenerListasSimilares } = require("./buscadorLista");

// Función auxiliar para manejar los errores y devolver null en caso de fallo
const safeQuery = async (queryFunction, cadena) => {
    try {
        return await queryFunction(cadena);
    } catch (error) {
        console.error(`Error al obtener datos: ${error.message}`);
        return null; // En caso de error, devolver null
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
        const multimediaSimilares = await safeQuery(obtenerMultimediaSimilares, cadena);
        const creadoresSimilares = await safeQuery(obtenerCreadoresSimilares, cadena);
        const albumesSimilares = await safeQuery(obtenerDiscosSimilares, cadena);
        const podcastsSimilares = await safeQuery(obtenerPodcastsSimilares, cadena);
        const usuariosSimilares = await safeQuery(obtenerUsuariosSimilares, cadena);
        const listasSimilares = await safeQuery(obtenerListasSimilares, cadena);

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
