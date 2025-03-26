const client = require('../db');

// Seguir a otro usuario
const followUser = async (req, res) => {
    try {
        const { nombre_usuario, nombre_usuario_a_seguir } = req.body;

        if (!nombre_usuario_a_seguir || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario que intenta seguir existe
        const result_user1 = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user1.rows.length == 0) {
            return res.status(400).json({ message: "El usuario seguidor no existe" });
        }

        // comprobar si el usuario a seguir existe
        const result_user2 = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario_a_seguir]);
        if (result_user2.rows.length == 0) {
            return res.status(400).json({ message: "El usuario a seguir no existe" });
        }

        // comprobar que no se siga a uno mismo
        if (nombre_usuario === nombre_usuario_a_seguir) {
            return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
        }

        // comprobar que no intenta seguir a un usuario que ya se sigue
        const result_follow = await client.execute("SELECT * FROM Sigue_a_usuario WHERE nombre_usuario1 = ? AND nombre_usuario2 = ?", [nombre_usuario, nombre_usuario_a_seguir]);
        if (result_follow.rows.length > 0) {
            return res.status(400).json({ message: "Ya sigues a este usuario" });
        }

        // seguir al usuario
        await client.execute("INSERT INTO Sigue_a_usuario (nombre_usuario1, nombre_usuario2) VALUES (?, ?)", [nombre_usuario, nombre_usuario_a_seguir]);
        res.status(200).json({ message: "Usuario seguido correctamente" });

    } catch (error) {
        console.error("Error al seguir al usuario:", error);
        res.status(500).json({ message: "Hubo un error al seguir al usuario" });
    }
};

// Seguir a un creador
const followCreator = async (req, res) => {
    try {
        const { nombre_usuario, nombre_creador } = req.body;

        if (!nombre_creador || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario existe
        const result_user = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si el creador existe
        const result_creador = await client.execute("SELECT * FROM Creador WHERE nombre_creador = ?", [nombre_creador]);
        if (result_creador.rows.length == 0) {
            return res.status(400).json({ message: "El creador no existe" });
        }

        // comprobar si el usuario ya sigue al creador
        const result_follow = await client.execute("SELECT * FROM Sigue_a_creador WHERE nombre_usuario = ? AND nombre_creador = ?", [nombre_usuario, nombre_creador]);
        if (result_follow.rows.length > 0) {
            return res.status(400).json({ message: "Ya sigues a este creador" });
        }

        // seguir al creador
        await client.execute("INSERT INTO Sigue_a_creador (nombre_usuario, nombre_creador) VALUES (?, ?)", [nombre_usuario, nombre_creador]);
        res.status(200).json({ message: "Creador seguido correctamente" });

    } catch (error) {
        console.error("Error al seguir al creador:", error);
        res.status(500).json({ message: "Hubo un error al seguir al creador" });
    }
};

// Añadir a favoritos un contenido multimedia
const addToFavourites = async (req, res) => {
    try {
        const { nombre_usuario, id_cm } = req.body;

        if (!id_cm || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario existe
        const result_user = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si el contenido multimedia existe y si es una cancion o un episodio
        const result_cm = await client.execute("SELECT * FROM Contenido_multimedia WHERE id_cm = ?", [id_cm]);
        if (result_cm.rows.length == 0) {
            return res.status(400).json({ message: "El contenido multimedia no existe" });
        }
        const es_cancion_result = await client.execute("SELECT * FROM Cancion WHERE id_cancion = ?", [id_cm]);
        es_cancion = es_cancion_result.rows.length > 0;

        if (es_cancion) { // hay que añadir en la tabla de canciones favoritas
            // buscar lista de canciones favoritas del usuario
            const result_list_fav = await client.execute(`
                SELECT lr.id_lista 
                FROM Lista_reproduccion lr
                JOIN Listas_del_usuario ldu ON lr.id_lista = ldu.id_lista
                WHERE lr.nombre = "Tus canciones favoritas" AND ldu.nombre_usuario = ?`, [nombre_usuario]);

            // comprobar si no se ha añadido ya a favoritos
            const result_fav = await client.execute("SELECT * FROM Canciones_en_playlist WHERE id_cancion = ? AND id_playlist = ?", [id_cm, result_list_fav.rows[0].id_lista]);
            if (result_fav.rows.length > 0) {
                return res.status(400).json({ message: "La cancion ya está en tus favoritos" });
            }

            // añadir a favoritos
            await client.execute("INSERT INTO Canciones_en_playlist (id_cancion, id_playlist) VALUES (?, ?)", [id_cm, result_list_fav.rows[0].id_lista]);
            res.status(200).json({ message: "Cancion añadida a favoritos correctamente" });

        } else { // hay que añadir en la tabla de episodios favoritos
            // buscar lista de episodios favoritos del usuario
            const result_list_fav = await client.execute(`
                SELECT lr.id_lista 
                FROM Lista_reproduccion lr
                JOIN Listas_del_usuario ldu ON lr.id_lista = ldu.id_lista
                WHERE lr.nombre = "Tus episodios favoritos" AND ldu.nombre_usuario = ?`, [nombre_usuario]);

            // comprobar si no se ha añadido ya a favoritos
            const result_fav = await client.execute("SELECT * FROM Episodios_de_lista WHERE id_ep = ? AND id_lista_ep = ?", [id_cm, result_list_fav.rows[0].id_lista]);
            if (result_fav.rows.length > 0) {
                return res.status(400).json({ message: "El episodio ya está en tus favoritos" });
            }

            // buscar el podcast al que pertenece el episodio a insertar
            const result_podcast = await client.execute("SELECT id_podcast FROM Episodio WHERE id_ep = ?", [id_cm]);

            // añadir a favoritos
            await client.execute("INSERT INTO Episodios_de_lista (id_ep, id_lista_ep, id_podcast) VALUES (?, ?, ?)", [id_cm, result_list_fav.rows[0].id_lista, result_podcast.rows[0].id_podcast]);
            res.status(200).json({ message: "Episodio añadido a favoritos correctamente" });

        }

    } catch (error) {
        console.error("Error al añadir a favoritos el contenido multimedia:", error);
        res.status(500).json({ message: "Hubo un error al añadir a favoritos el contenido multimedia" });
    }
};

// Dejar de seguir a otro usuario
const unfollowUser = async (req, res) => {
    try {
        const { nombre_usuario, nombre_usuario_a_dejar_seguir } = req.body;

        if (!nombre_usuario_a_dejar_seguir || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario que intenta dejar de seguir existe
        const result_user1 = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user1.rows.length == 0) {
            return res.status(400).json({ message: "El usuario seguidor no existe" });
        }

        // comprobar si el usuario a dejar de seguir existe
        const result_user2 = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario_a_dejar_seguir]);
        if (result_user2.rows.length == 0) {
            return res.status(400).json({ message: "El usuario a dejar de seguir no existe" });
        }

        // comprobar que no sea uno mismo
        if (nombre_usuario === nombre_usuario_a_dejar_seguir) {
            return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
        }

        // comprobar que ya se sigue al usuario que se quiere dejar de seguir
        const result_follow = await client.execute("SELECT * FROM Sigue_a_usuario WHERE nombre_usuario1 = ? AND nombre_usuario2 = ?", [nombre_usuario, nombre_usuario_a_dejar_seguir]);
        if (result_follow.rows.length == 0) {
            return res.status(400).json({ message: "No sigues a este usuario" });
        }

        // seguir al usuario
        await client.execute("DELETE FROM Sigue_a_usuario WHERE nombre_usuario1 = ? AND nombre_usuario2 = ?", [nombre_usuario, nombre_usuario_a_dejar_seguir]);
        res.status(200).json({ message: "Usuario dejado de seguir correctamente" });

    } catch (error) {
        console.error("Error al dejar de seguir al usuario:", error);
        res.status(500).json({ message: "Hubo un error al dejar de seguir al usuario" });
    }
};

// Dejar de seguir a un creador
const unfollowCreator = async (req, res) => {
    try {
        const { nombre_usuario, nombre_creador } = req.body;

        if (!nombre_creador || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario existe
        const result_user = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si el creador existe
        const result_creador = await client.execute("SELECT * FROM Creador WHERE nombre_creador = ?", [nombre_creador]);
        if (result_creador.rows.length == 0) {
            return res.status(400).json({ message: "El creador no existe" });
        }

        // comprobar si el usuario no sigue al creador
        const result_follow = await client.execute("SELECT * FROM Sigue_a_creador WHERE nombre_usuario = ? AND nombre_creador = ?", [nombre_usuario, nombre_creador]);
        if (result_follow.rows.length == 0) {
            return res.status(400).json({ message: "No sigues a este creador" });
        }

        // seguir al creador
        await client.execute("DELETE FROM Sigue_a_creador WHERE nombre_usuario = ? AND nombre_creador = ?", [nombre_usuario, nombre_creador]);
        res.status(200).json({ message: "Creador dejado de seguir correctamente" });

    } catch (error) {
        console.error("Error al dejar de seguir al creador:", error);
        res.status(500).json({ message: "Hubo un error al dejar de seguir al creador" });
    }
};


module.exports = { followUser, followCreator, addToFavourites, unfollowUser, unfollowCreator };
