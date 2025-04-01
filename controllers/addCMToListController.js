const client = require("../db");

// Dadas un id_cancion y un id_playlist añade la canción a la playlist si y solo si existen ambas y la canción no pertene previamente a la playlist
const addSongToPlaylist = async (req, res) => {
    try {
        const { id_cancion, id_playlist } = req.body;

        if (!id_cancion || !id_playlist) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }
        const result_playlist = await client.execute(
            "SELECT * FROM Playlist WHERE id_playlist = ?",
            [id_playlist]
        );
        if (result_playlist.rows.length === 0) {
            return res.status(400).json({ message: "La playlist no existe" });
        }

        const result_song = await client.execute("SELECT * FROM Cancion WHERE id_cancion = ?", [
            id_cancion,
        ]);
        console.log(result_song);
        if (result_song.rows.length === 0) {
            return res.status(400).json({ message: "La cancion no existe" });
        }

        const song_in_playlist = await client.execute(
            "SELECT * FROM Canciones_en_playlist WHERE id_cancion = ? AND id_playlist = ?",
            [id_cancion, id_playlist]
        );
        console.log(song_in_playlist.rows.length);
        if (song_in_playlist.rows.length === 1) {
            return res.status(400).json({ message: "La canción ya pertenece a la playlist" });
        }

        const result_playlist_check = await client.execute(
            "SELECT * FROM Playlist WHERE id_playlist = ?",
            [id_playlist]
        );
        if (result_playlist_check.rows.length === 0) {
            // Si no existe, la añadimos a la tabla `Playlist`
            await client.execute("INSERT INTO Playlist (id_playlist) VALUES (?)", [id_playlist]);
            console.log("Playlist añadida a la tabla Playlist");
        }

        await client.execute(
            "INSERT INTO Canciones_en_playlist (id_playlist, id_cancion) VALUES (?, ?)",
            [id_playlist, id_cancion]
        );
        res.status(200).json({ message: "Canción añadida correctamente" });
    } catch (error) {
        console.error("Error al añadir canción a la lista:", error);
        res.status(500).json({ message: "Hubo un error al añadir una canción a una lista" });
    }
};

const addEpToListaEpisodios = async (req, res) => {
    try {
        const { id_episodio, id_lista_ep } = req.body;

        if (!id_episodio || !id_lista_ep) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }
        const result_playlist = await client.execute(
            "SELECT * FROM Lista_Episodios WHERE id_lista_ep = ?",
            [id_lista_ep]
        );
        if (result_playlist.rows.length === 0) {
            return res.status(400).json({ message: "La Lista de Episodios no existe" });
        }

        const result_song = await client.execute("SELECT * FROM Episodio WHERE id_ep = ?", [
            id_episodio,
        ]);
        console.log(result_song);
        if (result_song.rows.length === 0) {
            return res.status(400).json({ message: "El episodio no existe" });
        }

        const song_in_playlist = await client.execute(
            "SELECT * FROM Episodios_de_lista WHERE id_ep = ? AND id_lista_ep = ?",
            [id_episodio, id_lista_ep]
        );
        console.log(song_in_playlist.rows.length);
        if (song_in_playlist.rows.length === 1) {
            return res.status(400).json({ message: "El episodio ya pertenece a la lista" });
        }

        const result_playlist_check = await client.execute(
            "SELECT * FROM Lista_Episodios WHERE id_lista_ep = ?",
            [id_lista_ep]
        );
        if (result_playlist_check.rows.length === 0) {
            // Si no existe, la añadimos a la tabla `Playlist`
            await client.execute("INSERT INTO Lista_Episodios (id_lista_ep) VALUES (?)", [
                id_lista_ep,
            ]);
            console.log("Lista añadida a la tabla Listas de Episodios");
        }

        await client.execute("INSERT INTO Episodios_de_lista (id_lista_ep, id_ep) VALUES (?, ?)", [
            id_lista_ep,
            id_episodio,
        ]);
        res.status(200).json({ message: "Episodio añadido correctamente" });
    } catch (error) {
        console.error("Error al añadir episodio a la lista:", error);
        res.status(500).json({ message: "Hubo un error al añadir un episodio a una lista" });
    }
};

module.exports = { addSongToPlaylist, addEpToListaEpisodios };
