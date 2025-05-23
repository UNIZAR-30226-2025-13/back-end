const client = require("../db");
const { checkIsASong } = require("./utils/exists");

const showSong = async (req, res) => {
    try {
        const { id_cancion } = req.query;

        if (!(await checkIsASong(id_cancion))) {
            return res.status(500).json({ message: "El id no es de una cancion" });
        }

        const cm_result = await client.execute(
            "SELECT * FROM Contenido_multimedia WHERE id_cm = ?",
            [id_cancion]
        );

        /// Obtener autor principal y artistas featuring
        const query = `
        SELECT ap.nombre_artista, COALESCE(GROUP_CONCAT(DISTINCT f.nombre_artista), '') AS artistas_feat, c.n_repros
        FROM Cancion c
        JOIN Artista_principal ap ON ap.id_cancion = c.id_cancion
        LEFT JOIN Featuring f ON f.id_cancion = c.id_cancion
        WHERE c.id_cancion = ?
        GROUP BY c.id_cancion, ap.nombre_artista;
        `;

        const artists_result = await client.execute(query, [id_cancion], { prepare: true });

        // Extraer valores de artista principal y featurings
        const nombre_artista = artists_result.rows[0]?.nombre_artista || "Desconocido";
        const artistas_feat = artists_result.rows[0]?.artistas_feat
            ? artists_result.rows[0].artistas_feat.split(",").join(", ")
            : "";
        
        // Obtener generos e idiomas
        const generos_result = await client.execute(
            `SELECT genero 
             FROM Generos
             WHERE id_cancion = ?`,
            [id_cancion]
        );
        const idiomas_result = await client.execute(
            `SELECT idioma 
             FROM Idiomas_multimedia 
             WHERE id_cm = ?`,
            [id_cancion]
        );
        const generos = generos_result.rows.map(row => row.genero).join(", ");
        const idiomas = idiomas_result.rows.map(row => row.idioma).join(", ");

        res.status(200).json({
            id_cancion: id_cancion,
            reproducciones: artists_result.rows[0].n_repros,
            fecha_pub: cm_result.rows[0].fecha_pub,
            link_cm: cm_result.rows[0].link_cm,
            titulo: cm_result.rows[0].titulo,
            duracion: cm_result.rows[0].duracion,
            link_imagen: cm_result.rows[0].link_imagen,
            autor: nombre_artista,
            artistas_featuring: artistas_feat,
            idiomas: idiomas,
            generos: generos
        });
    } catch (error) {
        console.error("Error al seguir al usuario:", error);
        res.status(500).json({ message: "Hubo un error al mostrar una canción" });
    }
};

// Dado un id de una cancion, devuelve la letra de la canción
const showLyrics = async (req, res) => {
    try {
        const { id_cancion } = req.query;

        if (!id_cancion) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        if (!(await checkIsASong(id_cancion))) {
            return res.status(500).json({ message: "El identificador dado no pertenece a una cancion" });
        }

        const result = await client.execute(
            "SELECT letra FROM Cancion WHERE id_cancion = ?",
            [id_cancion]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No se encontró la letra de la canción" });
        }
        res.status(200).json({ letra: result.rows[0].letra });

    } catch (error) {
        console.error("Error al obtener la letra de la canción:", error);
        res.status(500).json({ message: "Hubo un error al mostrar la letra de la canción" });
    }
}

module.exports = { showSong, showLyrics };
