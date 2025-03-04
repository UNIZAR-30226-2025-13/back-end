const client = require('../db');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
    try {
        const { nombre_usuario } = req.payload; // obtener nombre_usuario
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]); // obtener perfil
        
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }
        
        res.status(200).json(result.rows[0]); // devolver perfil
    
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ message: "Hubo un error al obtener el perfil" });
    }
};

// Cambiar Contraseña dado un usuario, su token de cambio de contraseña y su nueva contraseña se actualiza
// su contraseña antigüa por la nueva dada
const changePassword = async (req, res) => {
    try {
        const { nombre_usuario, token, nueva_contrasena } = req.body; // Campos

        if (!nombre_usuario || !token || !nueva_contrasena) { // Ningún campo vacío
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Verificar si el token existe en la base de datos
        const result_token = await client.execute(
            "SELECT token, fecha_exp FROM Token WHERE nombre_usuario = ?", 
            [nombre_usuario]
        );

        if (result_token.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no tiene ningún token asociado" });
        }

        const storedToken = result_token.rows[0].token;
        const fechaExp = new Date(result_token.rows[0].fecha_exp);
        const fechaActual = new Date();

        // Comprobar que el token coincide
        if (storedToken !== token) {
            return res.status(400).json({ message: "El token suministrado no es válido" });
        }

        // Comprobar que no se ha caducado el token
        if (fechaExp < fechaActual) {
            return res.status(400).json({ message: "El token ha caducado" });
        }

        const salt = await bcrypt.genSalt(10); // Generamos salt para el hash
        const hashContrasena = await bcrypt.hash(nueva_contrasena, salt); // Generamos el hash de la nueva contraseña

        await client.execute("UPDATE Usuario SET contrasena = ? WHERE nombre_usuario = ?", 
            [hashContrasena, nombre_usuario]
        ); // Cambiar contraseña

        res.status(200).json({ message: "Contraseña cambiada correctamente" }); // Mensaje de éxito
    
    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ message: "Hubo un error al cambiar la contraseña" });
    }
};

const getLists = async (req, res) => {
    try{
        const { nombre_usuario } = req.body; // obtener nombre_usuario
         // Obtener listas y carpetas del usuario
        const listas = await client.execute(
            'SELECT lr.id_lista, lr.nombre FROM Lista_reproduccion lr JOIN Listas_del_usuario lu ON lr.id_lista = lu.id_lista WHERE lu.nombre_usuario = ?;',
            [nombre_usuario]
        );
        const carpetas = await client.execute(
            'SELECT c.id_carpeta, c.nombre FROM Carpeta c JOIN Carpetas_del_Usuario cu ON c.id_carpeta = cu.id_carpeta WHERE nombre_usuario = ?;',
            [nombre_usuario]
        );
        const artisitas_favoritos = await client.execute(
            'SELECT a.nombre_artista FROM Sigue_a_creador sc JOIN Artista a ON sc.nombre_creador = a.nombre_artista WHERE sc.nombre_usuario = ?;',
            [nombre_usuario]
        );
        const podcasts_favoritos = await client.execute(
            'SELECT p.nombre_podcaster FROM Sigue_a_creador sc JOIN Podcaster p ON sc.nombre_creador = p.nombre_podcaster WHERE sc.nombre_usuario = ?;',
            [nombre_usuario]
        );
        res.status(200).json({
            listas: listas.rows.length ? listas.rows : "No hay listas",
            carpetas: carpetas.rows.length ? carpetas.rows : "No hay carpetas",
            artistas_favoritos: artisitas_favoritos.rows.length ? artisitas_favoritos.rows : "No hay artistas favoritos",
            podcasts_favoritos: podcasts_favoritos.rows.length ? podcasts_favoritos.rows : "No hay podcasts favoritos"
        });

    } catch (error) {
        console.error("Error al obtener listas:", error);
        res.status(500).json({ message: "Hubo un error al obtener las listas" });
    }
}

const createList = async (req, res) => {
    try {
        const { nombre_lista, nombre_usuario } = req.body;
        if (!nombre_lista || !nombre_usuario) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }
        await client.execute("INSERT INTO Lista_reproduccion (nombre) VALUES (?)", [nombre_lista]);
        const id_lista = (await client.execute("SELECT id_lista FROM Lista_reproduccion WHERE nombre = ?", [nombre_lista])).rows[0].id_lista;
        await client.execute("INSERT INTO Listas_del_usuario (id_lista, nombre_usuario) VALUES (?, ?)", [id_lista, nombre_usuario]);
        res.status(200).json({ message: "Lista creada correctamente" });
    } catch (error) {
        console.error("Error al crear lista:", error);
        res.status(500).json({ message: "Hubo un error al crear la lista" });
    }
};

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

        await client.execute("INSERT INTO Canciones_en_playlist (id_playlist, id_cancion) VALUES (?, ?)", [id_playlist, id_cancion]);
        res.status(200).json({ message: "Canción añadida correctamente" });
    } catch (error) {
        console.error("Error al añadir canción a la lista:", error);
        res.status(500).json({ message: "Hubo un error al añadir una canción a una lista" });
    }
}

module.exports = { getProfile, changePassword, getLists, createList, addSongToPlaylist };