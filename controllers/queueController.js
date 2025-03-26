const client = require("../db");
const { checkUserExists } = require("./utils/exists");

const getCM = async (req, res) => {
    try {
        const { nombre_usuario, posicion } = req.body;

        const userExists = await checkUserExists(nombre_usuario);

        if (userExists) {
            // Comprobar que existe la posicion en la cola
            const cm = await client.execute(
                `
                SELECT id_cm
                FROM Cola_Reproduccion 
                WHERE propietario = ? AND posicion = ?
                `,
                [nombre_usuario, posicion]
            );
            if (cm.rows.length > 0) {
                return res.status(200).json({
                    id_cm: cm.rows[0].id_cm,
                });
            } else {
                return res.status(400).json({ error: "Posición incorrecta" });
            }
        } else {
            return res.status(400).json({ error: "El usuario no existe" });
        }
    } catch (error) {
        console.error("Error al obtener la canción actual:", error);
        res.status(500).json({ message: "Error al obtener la canción actual" });
    }
};

const addSong = async (req, res, io) => {
    try {
        const { id_cm, nombre_usuario } = req.body;
        if (!id_cm || !nombre_usuario) {
            return res.status(400).json({ error: "Hay que rellenar todos los parámetros" });
        }

        // Verificar que la canción exista
        const cmExists = await client.execute(
            "SELECT * FROM Contenido_multimedia WHERE id_cm = ?",
            [id_cm]
        );
        if (cmExists.rows.length == 0) {
            return res.status(400).json({ message: "El contenido multimedia no existe" });
        }

        // Verificar que el usuario existe
        const userExists = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [
            nombre_usuario,
        ]);
        if (userExists.rows.length == 0) {
            return res.status(400).json({ error: "El usuario no existe" });
        }

        // Obtener la última posición en la cola del usuario
        const lastPosition = await client.execute(
            `
            SELECT COALESCE(MAX(posicion), -1) + 1 AS next_position
            FROM Cola_Reproduccion 
            WHERE propietario = ?
            `,
            [nombre_usuario]
        );

        if (lastPosition.rows[0].next_position < 0) {
            return res.status(400).json({ error: "Error lastPosition" });
        }

        await client.execute(
            `
            INSERT INTO Cola_Reproduccion (propietario, id_cm, posicion) 
            VALUES (?, ?, ?)
            `,
            [nombre_usuario, id_cm, lastPosition.rows[0].next_position]
        );

        const updatedQueue = await client.execute(
            `
            SELECT cm.* FROM Cola_Reproduccion cr
            JOIN Contenido_multimedia cm ON cr.id_cm = cm.id_cm
            WHERE cr.propietario = ?
            ORDER BY cr.posicion
            `,
            [nombre_usuario]
        );

        // Aquí usamos el `io` que pasamos como argumento, en lugar de `req.io`
        io.emit(`queueUpdate:${nombre_usuario}`, updatedQueue);

        res.status(200).json({ message: "Canción agregada" });
    } catch (error) {
        console.error("Error al agregar la canción:", error);
        res.status(500).json({ message: "Error al agregar la canción" });
    }
};

const clearQueue = async (req, res, io) => {
    try {
        const { nombre_usuario } = req.body;

        if (!nombre_usuario) {
            return res.status(400).json({ error: "El nombre de usuario es requerido" });
        }

        // Verificar que el usuario existe
        const userExists = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [
            nombre_usuario,
        ]);

        if (userExists.rows.length === 0) {
            return res.status(400).json({ error: "El usuario no existe" });
        }

        // Eliminar todas las canciones de la cola del usuario
        await client.execute("DELETE FROM Cola_Reproduccion WHERE propietario = ?", [
            nombre_usuario,
        ]);

        // Emitir evento para actualizar la cola del usuario (ahora vacía)
        io.emit(`queueUpdate:${nombre_usuario}`, []);

        res.status(200).json({ message: "Cola eliminada correctamente" });
    } catch (error) {
        console.error("Error al limpiar la cola:", error);
        res.status(500).json({ message: "Error al limpiar la cola" });
    }
};

const shuffleQueue = async (req, res) => {
    try {
        const { nombre_usuario, posicion } = req.body;

        // Verificar existencia del usuario
        const userExists = await checkUserExists(nombre_usuario);

        if (userExists) {
            // Obtener la cola de reproducción para ese usuario, ordenada por posición
            const result = await client.execute(
                "SELECT * FROM Cola_Reproduccion WHERE propietario = ? AND posicion > ? ORDER BY posicion ASC",
                [nombre_usuario, posicion]
            );

            // Verificar si `result` es un array o tiene los datos en alguna propiedad, como `rows`
            const cola = result.rows || result; // Ajustar dependiendo de la estructura de `result`

            // Verificar si `cola` es un array antes de usar `.filter()`
            if (Array.isArray(cola)) {
                // Si hay elementos después de la posición, asignar nuevas posiciones aleatorias
                if (cola.length > 0) {
                    // Crear un arreglo con las posiciones disponibles para asignar
                    const posicionesDisponibles = [];
                    for (let i = posicion + 1; i <= posicion + cola.length; i++) {
                        posicionesDisponibles.push(i);
                    }

                    // Reorganizar aleatoriamente las posiciones
                    posicionesDisponibles.sort(() => Math.random() - 0.5);

                    // Actualizar las posiciones en la base de datos
                    for (let i = 0; i < cola.length; i++) {
                        const nuevoValor = posicionesDisponibles[i]; // Nueva posición aleatoria
                        const item = cola[i].id_cola;

                        // console.log("El id: " + item + " va a tener posición: " + nuevoValor);

                        // Actualizar la base de datos
                        await client.execute(
                            "UPDATE Cola_Reproduccion SET posicion = ? WHERE id_cola = ?",
                            [nuevoValor, item]
                        );
                    }
                }
            } else {
                return res.status(500).json({ message: "La consulta no devolvió un array válido" });
            }
        } else {
            return res.status(400).json({ error: "El usuario no existe" });
        }

        // Responder con éxito
        res.status(200).json({ message: "Cola de reproducción reorganizada correctamente" });
    } catch (error) {
        console.error("Error al aleatorizar la cola:", error);
        res.status(500).json({ message: "Error al aleatorizar la cola" });
    }
};

const showQueue = async (req, res) => {
    try {
        const { nombre_usuario, posicion } = req.body;

        // Verificar si el usuario existe
        const userExists = await checkUserExists(nombre_usuario);
        if (!userExists) {
            return res.status(400).json({ error: "El usuario no existe" });
        }

        // Obtener la cola de reproducción del usuario después de cierta posición
        const result = await client.execute(
            "SELECT id_cm, posicion FROM Cola_Reproduccion WHERE propietario = ? AND posicion > ? ORDER BY posicion ASC",
            [nombre_usuario, posicion]
        );

        const queue = [];

        for (const row of result.rows) {
            const { id_cm } = row;
            // Obtener detalles del contenido multimedia
            const mediaQuery = await client.execute(
                "SELECT titulo, duracion, link_imagen, fecha_pub FROM Contenido_multimedia WHERE id_cm = ?",
                [id_cm]
            );
            if (mediaQuery.rows.length > 0) {
                let item = mediaQuery.rows[0];
                item.posicion = row.posicion;
                // Verificar si es una canción
                const artistQuery = await client.execute(
                    "SELECT nombre_artista FROM Artista_principal WHERE id_cancion = ?",
                    [id_cm]
                );
                const featuringQuery = await client.execute(
                    "SELECT nombre_artista FROM Featuring WHERE id_cancion = ?",
                    [id_cm]
                );

                if (artistQuery.rows.length > 0) {
                    item.artista = artistQuery.rows[0].nombre_artista;
                    item.featurings = featuringQuery.rows.map((f) => f.nombre_artista);
                }

                // Verificar si es un episodio de podcast
                const episodeQuery = await client.execute(
                    "SELECT id_podcast FROM Episodio WHERE id_ep = ?",
                    [id_cm]
                );

                if (episodeQuery.rows.length > 0) {
                    const { id_podcast, descripcion } = episodeQuery.rows[0];

                    const podcastQuery = await client.execute(
                        "SELECT nombre FROM Podcast WHERE id_podcast = ?",
                        [id_podcast]
                    );

                    if (podcastQuery.rows.length > 0) {
                        item.podcast = podcastQuery.rows[0].nombre;
                        item.descripcion = descripcion;
                    }
                }

                queue.push(item);
            }
        }

        return res.status(200).json({ cola: queue });
    } catch (error) {
        console.error("Error al obtener la cola de reproducción:", error);
        res.status(500).json({ message: "Error al obtener la cola de reproducción" });
    }
};

module.exports = { getCM, addSong, shuffleQueue, clearQueue, showQueue };
