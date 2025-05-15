const client = require("../db");
const { getRating, getAverageRating } = require("./ratesController");

const getListData = async (req, res) => {
    try {
        const { id_lista, nombre_usuario } = req.query;

        // Comprobar lista válida
        const list_valida = await client.execute(
            "SELECT * FROM Lista_reproduccion WHERE id_lista = ?",
            [id_lista]
        );
        if (list_valida.rows.length === 0) {
            return res.status(400).json({ message: "La lista no existe" });
        }

        const nombre_usuario_result = await client.execute(
            "SELECT nombre_usuario FROM Listas_del_usuario WHERE id_lista = ?",
            [id_lista]
        );
        const nombre_usuario_lista = nombre_usuario_result.rows[0].nombre_usuario;

        // Saber si es una playlist o una lista de episodios
        const es_playlist = await client.execute("SELECT * FROM Playlist WHERE id_playlist = ?", [
            id_lista,
        ]);

        let es_una_playlist = null;
        let contenido_multimedia = [];

        // Obtener datos lista -> nombre, color, privacidad
        const datos_playlist = await client.execute(
            "SELECT nombre, color, es_publica FROM Lista_reproduccion WHERE id_lista = ?",
            [id_lista]
        );
        const color = datos_playlist.rows[0].color;
        const nombre = datos_playlist.rows[0].nombre;
        const es_publica = datos_playlist.rows[0].es_publica;

        if (es_playlist.rows.length > 0) {
            // es una playlist
            es_una_playlist = true;

            // Obtenemos los id's que pertenecen a una playlist
            const canciones_playlist = await client.execute(
                "SELECT id_cancion FROM Canciones_en_playlist WHERE id_playlist = ?",
                [id_lista]
            );
            let list_canciones = [];
            if (canciones_playlist.rows.length > 0) {
                // se almacenan las canciones de las que el artista sea artista principal
                list_canciones = canciones_playlist.rows.map((row) => row.id_cancion);
            }

            // Canciones una a una de la playlist
            if (list_canciones.length > 0) {
                // creación de lista dinamica en función del nº de canciones que haya en el array canciones
                const dynamic = list_canciones.map(() => "?").join(",");
                // se obtiene la informacion necesaria únicamente de las canciones
                // si una cancion no tiene artistas feat, se devuelve la cadena vacía
                const query = ` WITH AlbumSeleccionado AS (
                                    SELECT num.id_cancion, a.id_album, a.nombre_album,
                                        ROW_NUMBER() OVER (PARTITION BY num.id_cancion ORDER BY a.fecha_pub DESC) AS fila
                                    FROM Numero_cancion_en_album num
                                    JOIN Album a ON a.id_album = num.id_album
                                )
                                SELECT c.id_cancion AS id_cm, cm.titulo AS titulo, cm.link_imagen, cm.duracion, cm.fecha_pub, ap.nombre_artista AS nombre_creador, 
                                    COALESCE(GROUP_CONCAT(DISTINCT f.nombre_artista), '') AS artistas_feat, alb.id_album AS id_grupo, alb.nombre_album AS nombre_grupo
                                FROM Cancion c
                                JOIN Contenido_multimedia cm ON c.id_cancion = cm.id_cm
                                JOIN Artista_principal ap ON ap.id_cancion = c.id_cancion
                                LEFT JOIN Featuring f ON f.id_cancion = c.id_cancion
                                LEFT JOIN AlbumSeleccionado alb ON alb.id_cancion = c.id_cancion AND alb.fila = 1
                                WHERE c.id_cancion IN (${dynamic})
                                GROUP BY c.id_cancion, cm.titulo, cm.link_imagen, 
                                        cm.duracion, cm.fecha_pub, ap.nombre_artista
                                ORDER BY cm.fecha_pub DESC;
                                `;
                // realizar la 1a consulta
                const canciones_info_result = await client.execute(query, list_canciones);
                // se almacena la información
                for (const row of canciones_info_result.rows) {
                    const valoracion_del_usuario = await getRating(row.id_cm, nombre_usuario);
                    const valoracion_media = await getAverageRating(row.id_cm);

                    contenido_multimedia.push({
                        id_cm: row.id_cm,
                        titulo: row.titulo,
                        link_imagen: row.link_imagen,
                        duracion: row.duracion,
                        fecha_pub: row.fecha_pub,
                        nombre_creador: row.nombre_creador,
                        artistas_feat: row.artistas_feat,
                        id_grupo: row.id_grupo,
                        nombre_grupo: row.nombre_grupo,
                        valoracion_del_usuario,
                        valoracion_media,
                    });
                }
            }
        } else {
            // es una lista de episodios
            es_una_playlist = false;

            // obtenemos los episodios de una lista
            const episodios_lista_result = await client.execute(
                `SELECT DISTINCT e.id_ep AS id_cm, cm.titulo AS titulo, cm.link_imagen, cm.duracion, cm.fecha_pub,
                    '' AS nombre_creador,
                    '' AS artistas_feat, p.id_podcast AS id_grupo, p.nombre AS nombre_grupo
                 FROM Episodios_de_lista el
                 JOIN Podcast p ON el.id_podcast = p.id_podcast
                 JOIN Episodio e ON e.id_ep = el.id_ep
                 JOIN Contenido_multimedia cm ON cm.id_cm = el.id_ep
                 JOIN Tiene_podcast tp ON tp.id_podcast = el.id_podcast
                 WHERE el.id_lista_ep = ?`,
                [id_lista]
            );
            for (const row of episodios_lista_result.rows) {
                const valoracion_del_usuario = await getRating(row.id_cm, nombre_usuario);
                const valoracion_media = await getAverageRating(row.id_cm);

                contenido_multimedia.push({
                    id_cm: row.id_cm,
                    titulo: row.titulo,
                    link_imagen: row.link_imagen,
                    duracion: row.duracion,
                    fecha_pub: row.fecha_pub,
                    nombre_creador: row.nombre_creador,
                    artistas_feat: row.artistas_feat,
                    id_grupo: row.id_grupo,
                    nombre_grupo: row.nombre_grupo,
                    valoracion_del_usuario,
                    valoracion_media,
                });
            }
        }

        res.status(200).json({
            nombre: nombre,
            color: color,
            es_playlist: es_una_playlist,
            es_publica: es_publica,
            nombre_usuario: nombre_usuario_lista,
            contenido: contenido_multimedia,
        });
    } catch (error) {
        console.error("Error al obtener la lista:", error);
        res.status(500).json({ message: "Hubo un error al obtener la lista" });
    }
};

const removeCMFromList = async (req, res) => {
    try {
        const { id_cm, id_lista } = req.body;

        // Verificar si la lista es de episodios o de canciones
        const checkPlaylistType = await client.execute(
            `
            SELECT * 
            FROM Playlist 
            WHERE id_playlist = ?`,
            [id_lista]
        );

        if (checkPlaylistType.rows.length > 0) {
            // Es una playlist de canciones, eliminar de Canciones_en_playlist
            await client.execute(
                `
                DELETE FROM Canciones_en_playlist 
                WHERE id_playlist = ? AND id_cancion = ?`,
                [id_lista, id_cm]
            );

            return res.status(200).json({ message: "Canción eliminada de la lista correctamente" });
        }

        // Si no está en Playlist, verificar si es una lista de episodios
        const checkEpisodeList = await client.execute(
            `
            SELECT * 
            FROM Lista_Episodios 
            WHERE id_lista_ep = ?`,
            [id_lista]
        );

        if (checkEpisodeList.rows.length > 0) {
            // Es una lista de episodios, eliminar de Episodios_de_lista
            await client.execute(
                `
                DELETE FROM Episodios_de_lista 
                WHERE id_lista_ep = ? AND id_ep = ?`,
                [id_lista, id_cm]
            );

            return res
                .status(200)
                .json({ message: "Episodio eliminado de la lista correctamente" });
        }

        res.status(400).json({
            message: "La lista no existe o el contenido multimedia no se encuentra en ella",
        });
    } catch (error) {
        console.error("Error al eliminar contenido multimedia de la lista:", error);
        res.status(500).json({
            message: "Hubo un error al eliminar el contenido multimedia de la lista",
        });
    }
};

const deleteList = async (req, res) => {
    try {
        const { id_lista } = req.body;

        // Verificar si la lista existe en Playlist
        const checkPlaylist = await client.execute(
            `
            SELECT id_playlist FROM Playlist WHERE id_playlist = ?`,
            [id_lista]
        );

        if (checkPlaylist.rows.length > 0) {
            // Si es una playlist de canciones, eliminarla
            await client.execute(`DELETE FROM Playlist WHERE id_playlist = ?`, [id_lista]);
            await client.execute(`DELETE FROM Lista_reproduccion WHERE id_lista = ?`, [id_lista]);

            return res.status(200).json({ message: "Playlist eliminada correctamente" });
        }

        // Verificar si la lista existe en Lista_Episodios
        const checkEpisodeList = await client.execute(
            `
            SELECT id_lista_ep FROM Lista_Episodios WHERE id_lista_ep = ?`,
            [id_lista]
        );

        if (checkEpisodeList.rows.length > 0) {
            // Si es una lista de episodios, eliminarla
            await client.execute(`DELETE FROM Lista_Episodios WHERE id_lista_ep = ?`, [id_lista]);
            await client.execute(`DELETE FROM Lista_reproduccion WHERE id_lista = ?`, [id_lista]);

            return res.status(200).json({ message: "Lista de episodios eliminada correctamente" });
        }

        res.status(400).json({ message: "La lista no existe" });
    } catch (error) {
        console.error("Error al eliminar la lista:", error);
        res.status(500).json({ message: "Hubo un error al eliminar la lista" });
    }
};

const updateThisIsListsArtistas = async (req, res) => {
    try {
        const creadores = await client.execute("SELECT nombre_artista FROM Artista");
        for (const row of creadores.rows) {
            const nombre_artista = row.nombre_artista;
            const nombre_lista = "This is " + nombre_artista;

            console.log("Actualizando lista: " + nombre_lista);

            const id_lista = await client.execute(
                `SELECT lr.id_lista 
                FROM Lista_reproduccion lr 
                JOIN Playlist p ON lr.id_lista = p.id_playlist
                JOIN Listas_del_usuario lu ON lr.id_lista = lu.id_lista 
                WHERE lr.nombre = ? AND lu.nombre_usuario = 'spongefy'
                `,
                [nombre_lista]
            );

            // Obtener 15 canciones random del artista
            const canciones_artista = await client.execute(
                `
            SELECT DISTINCT c.id_cancion
            FROM Cancion c
            JOIN (
                SELECT id_cancion
                FROM Artista_principal
                WHERE nombre_artista = ?
                UNION
                SELECT id_cancion
                FROM Featuring
                WHERE nombre_artista = ?
            ) AS canciones_artista
            ON c.id_cancion = canciones_artista.id_cancion
            ORDER BY RANDOM()
            LIMIT 15;
            `,
                [nombre_artista, nombre_artista]
            );

            // Borrar las canciones previas de la lista
            await client.execute(`DELETE FROM Canciones_en_playlist WHERE id_playlist = ?`, [
                id_lista.rows[0].id_lista,
            ]);

            // Insertar las nuevas canciones en la lista
            for (const row of canciones_artista.rows) {
                await client.execute(
                    `INSERT INTO Canciones_en_playlist (id_playlist, id_cancion) VALUES (?, ?)`,
                    [id_lista.rows[0].id_lista, row.id_cancion]
                );
            }
        }

        res.status(200).json({ message: "Listas 'This is' artistas actualizadas correctamente" });
    } catch (error) {
        console.error("Error al actualizar listas 'This is':", error);
        res.status(500).json({
            message: "Hubo un error al actualizar las listas 'This is' artistas",
        });
    }
};

const updateThisIsListsPodcasters = async (req, res) => {
    try {
        const creadores = await client.execute("SELECT nombre_podcaster FROM Podcaster");
        for (const row of creadores.rows) {
            const nombre_podcaster = row.nombre_podcaster;
            const nombre_lista = "This is " + nombre_podcaster;

            console.log("Actualizando lista: " + nombre_lista);

            const id_lista = await client.execute(
                `SELECT lr.id_lista 
                FROM Lista_reproduccion lr 
                JOIN Lista_Episodios le ON lr.id_lista = le.id_lista_ep
                JOIN Listas_del_usuario lu ON lr.id_lista = lu.id_lista 
                WHERE lr.nombre = ? AND lu.nombre_usuario = 'spongefy'
                `,
                [nombre_lista]
            );

            // Obtener 15 episodios random del artista
            const ep_podcaster = await client.execute(
                `
            SELECT e.id_ep, e.id_podcast
            FROM Episodio e
            JOIN Tiene_podcast tp ON e.id_podcast = tp.id_podcast
            WHERE tp.nombre_podcaster = ?
            ORDER BY RANDOM()
            LIMIT 15;
            `,
                [nombre_podcaster]
            );

            // Borrar los episodios previas de la lista
            await client.execute(`DELETE FROM Episodios_de_lista WHERE id_lista_ep = ?`, [
                id_lista.rows[0].id_lista,
            ]);

            // Insertar los nuevos episodios en la lista
            for (const row of ep_podcaster.rows) {
                await client.execute(
                    `INSERT INTO Episodios_de_lista (id_lista_ep, id_ep, id_podcast) VALUES (?, ?, ?)`,
                    [id_lista.rows[0].id_lista, row.id_ep, row.id_podcast]
                );
            }
        }

        res.status(200).json({ message: "Listas 'This is' podcaster actualizadas correctamente" });
    } catch (error) {
        console.error("Error al actualizar listas 'This is' podcaster:", error);
        res.status(500).json({
            message: "Hubo un error al actualizar las listas 'This is' podcaster",
        });
    }
};

const updateGenerosList = async (req, res) => {
    try {
        const generos = await client.execute("SELECT DISTINCT genero FROM Generos");
        for (const row of generos.rows) {
            const nombre_genero = row.genero;
            const nombre_lista = nombre_genero.toUpperCase();

            console.log("Actualizando lista: " + nombre_lista);

            const id_lista = await client.execute(
                `SELECT lr.id_lista 
                FROM Lista_reproduccion lr 
                JOIN Playlist p ON lr.id_lista = p.id_playlist
                JOIN Listas_del_usuario lu ON lr.id_lista = lu.id_lista 
                WHERE lr.nombre = ? AND lu.nombre_usuario = 'spongefy'
                `,
                [nombre_lista]
            );

            // Obtener 15 canciones random de ese género
            const canciones_genero = await client.execute(
                `
            SELECT DISTINCT g.id_cancion
            FROM Generos g
            WHERE g.genero = ?
            ORDER BY RANDOM()
            LIMIT 15;
            `,
                [nombre_genero]
            );

            // Borrar las canciones previas de la lista
            await client.execute(`DELETE FROM Canciones_en_playlist WHERE id_playlist = ?`, [
                id_lista.rows[0].id_lista,
            ]);

            // Insertar las nuevas canciones en la lista
            for (const row of canciones_genero.rows) {
                await client.execute(
                    `INSERT INTO Canciones_en_playlist (id_playlist, id_cancion) VALUES (?, ?)`,
                    [id_lista.rows[0].id_lista, row.id_cancion]
                );
            }
        }

        res.status(200).json({ message: "Listas generos actualizadas correctamente" });
    } catch (error) {
        console.error("Error al actualizar listas generos:", error);
        res.status(500).json({
            message: "Hubo un error al actualizar las listas generos",
        });
    }
};

const updateLanguajesList = async (req, res) => {
    try {
        const idiomas = await client.execute("SELECT DISTINCT idioma FROM Idiomas_multimedia");
        for (const row of idiomas.rows) {
            const idioma = row.idioma;
            const nombre_lista = "TOP " + idioma.toUpperCase();

            console.log("Actualizando lista: " + nombre_lista);

            const id_lista = await client.execute(
                `SELECT lr.id_lista 
                FROM Lista_reproduccion lr 
                JOIN Playlist p ON lr.id_lista = p.id_playlist
                JOIN Listas_del_usuario lu ON lr.id_lista = lu.id_lista 
                WHERE lr.nombre = ? AND lu.nombre_usuario = 'spongefy'
                `,
                [nombre_lista]
            );

            // Obtener 15 canciones random de ese género
            const canciones_genero = await client.execute(
                `
            SELECT DISTINCT i.id_cm
            FROM Idiomas_multimedia i
            JOIN Cancion c ON i.id_cm = c.id_cancion
            WHERE i.idioma = ?
            ORDER BY RANDOM()
            LIMIT 15;
            `,
                [idioma]
            );

            // Borrar las canciones previas de la lista
            await client.execute(`DELETE FROM Canciones_en_playlist WHERE id_playlist = ?`, [
                id_lista.rows[0].id_lista,
            ]);

            // Insertar las nuevas canciones en la lista
            for (const row of canciones_genero.rows) {
                await client.execute(
                    `INSERT INTO Canciones_en_playlist (id_playlist, id_cancion) VALUES (?, ?)`,
                    [id_lista.rows[0].id_lista, row.id_cm]
                );
            }
        }

        res.status(200).json({ message: "Listas idomas actualizadas correctamente" });
    } catch (error) {
        console.error("Error al actualizar listas idomas:", error);
        res.status(500).json({
            message: "Hubo un error al actualizar las listas idomas",
        });
    }
};

module.exports = {
    getListData,
    removeCMFromList,
    deleteList,
    updateThisIsListsArtistas,
    updateThisIsListsPodcasters,
    updateGenerosList,
    updateLanguajesList,
};
