const client = require('../db');

const getPlaylistData = async (req, res) => {
    try{
        const { id_playlist } = req.query; // obtener nombre_usuario

        if (!id_playlist) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobar play list válida
        const playlist_valida = await client.execute(
            'SELECT * FROM Playlist WHERE id_playlist = ?',
            [id_playlist]
        );
        if (playlist_valida.rows.length === 0) {
            return res.status(400).json({ message: "La playlist no existe" });
        }

        // Obtener datos playlist, nombre, color
        const datos_playlist = await client.execute(
            'SELECT nombre, color FROM Lista_reproduccion WHERE id_lista = ?',
            [id_playlist]
        );
        const color = datos_playlist.rows[0].color;
        const nombre = datos_playlist.rows[0].nombre;

        // Obtenemos los id's que pertenecen a una playlist
        const canciones_playlist = await client.execute("SELECT id_cancion FROM Canciones_en_playlist WHERE id_playlist = ?", [id_playlist]);
        let list_canciones = []
        if (canciones_playlist.rows.length > 0) { // se almacenan las canciones de las que el artista sea artista principal
            list_canciones = canciones_playlist.rows.map((row) => row.id_cancion);
        }

        // Canciones una a una de la playlist
        let canciones = []; // almacenar la información de las canciones
        if (list_canciones.length > 0) {
            console.log(list_canciones);
            
            // creación de lista dinamica en función del nº de canciones que haya en el array canciones
            const dynamic = list_canciones.map(() => "?").join(",");
            // se obtiene la informacion necesaria únicamente de las canciones
            // si una cancion no tiene artistas feat, se devuelve la cadena vacía
            const query = ` SELECT c.id_cancion, cm.titulo, c.n_repros, cm.link_imagen, cm.duracion, cm.fecha_pub,
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
            canciones = canciones_info_result.rows;
        }

        res.status(200).json({
            nombre: nombre,
            color: color,
            canciones: canciones
        });

    } catch (error) {
        console.error("Error al obtener listas:", error);
        res.status(500).json({ message: "Hubo un error al obtener las listas" });
    }
}

// Dadas un id_cancion y un id_playlist añade la canción a la playlist si y solo si existen ambas y la canción no pertene previamente a la playlist
const addSongToPlaylist = async (req, res) => {
    try {
        const { id_cancion, id_playlist } = req.body;
        
        if (!id_cancion || !id_playlist) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }
        const result_playlist = await client.execute("SELECT * FROM Playlist WHERE id_playlist = ?", [id_playlist]);
        if (result_playlist.rows.length === 0) {
            return res.status(400).json({ message: "La playlist no existe" });
        }

        const result_song = await client.execute("SELECT * FROM Cancion WHERE id_cancion = ?", [id_cancion]);
        console.log(result_song)
        if (result_song.rows.length === 0) {
            return res.status(400).json({ message: "La cancion no existe" });
        }

        const song_in_playlist = await client.execute("SELECT * FROM Canciones_en_playlist WHERE id_cancion = ? AND id_playlist = ?", [id_cancion, id_playlist]);
        console.log(song_in_playlist.rows.length)
        if (song_in_playlist.rows.length === 1) {
            return res.status(400).json({ message: "La canción ya pertenece a la playlist" });
        }

        const result_playlist_check = await client.execute("SELECT * FROM Playlist WHERE id_playlist = ?", [id_playlist]);
        if (result_playlist_check.rows.length === 0) {
            // Si no existe, la añadimos a la tabla `Playlist`
            await client.execute("INSERT INTO Playlist (id_playlist) VALUES (?)", [id_playlist]);
            console.log("Playlist añadida a la tabla Playlist");
        }

        await client.execute("INSERT INTO Canciones_en_playlist (id_playlist, id_cancion) VALUES (?, ?)", [id_playlist, id_cancion]);
        res.status(200).json({ message: "Canción añadida correctamente" });
    } catch (error) {
        console.error("Error al añadir canción a la lista:", error);
        res.status(500).json({ message: "Hubo un error al añadir una canción a una lista" });
    }
}

module.exports = { getPlaylistData, addSongToPlaylist }