/*
MOSTAR:
toda la info del album -> id, nombre, link_imagen, fecha_pub
nombre_artista del album
todas las canciones asociadas a ese album
    los cantantes de cada cancion (principales y featurings)
    id cancion
    nombre cancion
    num reproducciones
    duracion
*/
const client = require('../db');

const getAlbum = async (req, res) => {
    try {
        const { id_album } = req.query; // obtener id del album

        const result_album = await client.execute("SELECT * FROM Album WHERE id_album = ?", [id_album]); // obtener album
        if (result_album.rows.length === 0) {
            return res.status(400).json({ message: "El album no existe" });
        }
        const album = result_album.rows[0];

        // obtener información (solo nos interesa el nombre) del artista del album
        const artista_result = await client.execute("SELECT nombre_artista FROM Artista_posee_albumes WHERE id_album = ?", [id_album]);
        const artista = artista_result.rows[0];

        let list_canciones = []; // almacenar las canciones del album
        let canciones_info = []; // almacenar la información de las canciones
        const canciones_album_result = await client.execute("SELECT id_cancion FROM Numero_cancion_en_album WHERE id_album = ? ORDER BY numero_cancion ASC", [id_album]);
        if (canciones_album_result.rows.length > 0) { // se almacenan las canciones
            list_canciones = canciones_album_result.rows.map((row) => row.id_cancion);
    
            // creación de lista dinamica en función del nº de canciones que haya en el array canciones
            const dynamic = list_canciones.map(() => "?").join(",");
            // se obtiene la informacion necesaria únicamente de las canciones
            // si una cancion no tiene artistas feat, se devuelve la cadena vacía
            const query = ` SELECT c.id_cancion, cm.titulo, c.n_repros, cm.duracion, cm.fecha_pub,
                                   ap.nombre_artista, COALESCE(GROUP_CONCAT(DISTINCT f.nombre_artista), '') AS artistas_feat
                            FROM Cancion c
                            JOIN Contenido_multimedia cm ON c.id_cancion = cm.id_cm
                            JOIN Artista_principal ap ON ap.id_cancion = c.id_cancion
                            LEFT JOIN Featuring f ON f.id_cancion = c.id_cancion
                            WHERE c.id_cancion IN (${dynamic})
                            GROUP BY c.id_cancion, cm.titulo, c.n_repros, cm.link_imagen, 
                                     cm.duracion, cm.fecha_pub, ap.nombre_artista
                            ORDER BY cm.fecha_pub DESC;
                            `;
            // realizar la 1a consulta
            const canciones_info_result = await client.execute(query, list_canciones);
            // se almacena la información
            canciones_info = canciones_info_result.rows;
        }
        
        res.status(200).json({ // devolver toda la información del álbum
            album: {
                id: album.id_album,
                nombre: album.nombre_album,
                link_imagen: album.link_imagen,
                fecha_pub: album.fecha_pub
            },
            artista: artista.nombre_artista,
            canciones: canciones_info
        });

    } catch (error) {
        console.error("Error al obtener el álbum", error);
        res.status(500).json({ message: "Hubo un error al obtener el álbum" });
    }
};

module.exports = { getAlbum };