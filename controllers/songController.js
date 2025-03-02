const client = require('../db');

// Función para reproducir el contendio de una canción ( No mostrar info canción )
const playSong = async (req, res) => {
    try {
        const { id_cancion } = req.query; // obtener id de una canción
        const cm_result = await client.execute("SELECT * FROM Contenido_multimedia WHERE id_cm = ?", [id_cancion]); // obtener canción
        
        if (cm_result.rows.length === 0) {
            return res.status(400).json({ message: "No existe la canción" });
        }

        // Obtenemos el resultado de consultar la canción
        const song_result = await client.execute("SELECT * FROM Cancion WHERE id_cancion = ?", [id_cancion])
        
        if (song_result.rows.length === 0) {
            return res.status(400).json({message: "El contenido solicitado es un episodio de podcast, no una canción"})
        }
        
        // Obtener autor principal y artistas featuring
        const query = `
            SELECT ap.nombre_artista, COALESCE(GROUP_CONCAT(DISTINCT f.nombre_artista), '') AS artistas_feat
            FROM Cancion c
            JOIN Artista_principal ap ON ap.id_cancion = c.id_cancion
            LEFT JOIN Featuring f ON f.id_cancion = c.id_cancion
            WHERE c.id_cancion = ?
            GROUP BY c.id_cancion, ap.nombre_artista;
        `;

        const artists_result = await client.execute(query, [id_cancion], { prepare: true });

        // Extraer valores de artista principal y featurings
        const nombre_artista = artists_result.rows[0]?.nombre_artista || "Desconocido";
        const artistas_feat = artists_result.rows[0]?.artistas_feat ? artists_result.rows[0].artistas_feat.split(",").join(", ") : "";

        res.status(200).json({
            link_cm: cm_result.rows[0].link_cm,
            titulo: cm_result.rows[0].titulo,
            duracion: cm_result.rows[0].duracion,
            link_imagen: cm_result.rows[0].link_img,
            autor: nombre_artista, 
            artistas_featuring: artistas_feat // String con los featuring separados por coma
        });
    
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ message: "Hubo un error al obtener el perfil" });
    }
};

module.exports = { playSong };