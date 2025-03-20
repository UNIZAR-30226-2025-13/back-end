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
            id_cancion: id_cancion,
            link_cm: cm_result.rows[0].link_cm,
            titulo: cm_result.rows[0].titulo,
            duracion: cm_result.rows[0].duracion,
            link_imagen: cm_result.rows[0].link_imagen,
            autor: nombre_artista, 
            artistas_featuring: artistas_feat // String con los featuring separados por coma
        });
    
    } catch (error) {
        console.error("Error al obtener la canción:", error);
        res.status(500).json({ message: "Hubo un al obtener la canción" });
    }
};


// Guarda el último contenido multimedia que estuviera escuchando un usuario
const saveLastThingPlaying = async (req, res) => {
    try {
        const { nombre_usuario, id_cm, tiempo } = req.body;

        // Verificar cm válida y tiempo válido
        const cm_result = await client.execute("SELECT duracion FROM Contenido_Multimedia WHERE id_cm = ?", [id_cm])
        if (cm_result.rows.length === 0) {
            return res.status(400).json({message: "El contenido dado no existe"})
        } else if (cm_result.rows[0].duracion < tiempo){
            return res.status(400).json({message: "El tiempo dado excede el del contendio"})
        }

        // Obtenemos el resultado de consultar el usuario
        const user_result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario])
        if (user_result.rows.length === 0) {
            return res.status(400).json({message: "El usuario dado no existe"})
        }

        // Insertar el contenido multimedia en el usuario
        await client.execute("UPDATE Usuario SET ult_cm = ?, tiempo_ult_cm = ? WHERE nombre_usuario = ?", 
            [id_cm, tiempo, nombre_usuario]);

        res.status(200).json({
            msg: "El último contenido multimedia reproducido ha sido guardado correctamente"
        });

    } catch (error) {
        console.error("Error al guardar el último contenido sonando:", error);
        res.status(500).json({ message: "Hubo un al guardar el útlimo contenido sonando" });
    }
};

// Obtiene el id del último conentenido reproduciéndose
const recoverLastThingPlaying = async (req, res) => {
    try {
        const { nombre_usuario } = req.query;

        // Obtenemos el resultado de consultar el usuario
        const user_result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario])
        if (user_result.rows.length === 0) {
            return res.status(400).json({message: "El usuario dado no existe"})
        }

        res.status(200).json({
            id_cm: user_result.rows[0].ult_cm,
            tiempo: user_result.rows[0].tiempo_ult_cm
        });

    } catch (error) {
        console.error("Error al recuperar el último contenido sonando:", error);
        res.status(500).json({ message: "Hubo un al recuperar el útlimo contenido sonando" });
    }
}

module.exports = { playSong, saveLastThingPlaying, recoverLastThingPlaying };