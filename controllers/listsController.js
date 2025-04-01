const client = require('../db');
const { getRating, getAverageRating } = require('./ratesController');

const getListData = async (req, res) => {
    try{
        const { id_lista, nombre_usuario } = req.query;

        // Comprobar lista válida
        const list_valida = await client.execute(
            'SELECT * FROM Lista_reproduccion WHERE id_lista = ?',
            [id_lista]
        );
        if (list_valida.rows.length === 0) {
            return res.status(400).json({ message: "La lista no existe" });
        }

        const nombre_usuario_result = await client.execute(
            'SELECT nombre_usuario FROM Listas_del_usuario WHERE id_lista = ?', [id_lista]
        );
        const nombre_usuario_lista = nombre_usuario_result.rows[0].nombre_usuario;

        // Saber si es una playlist o una lista de episodios
        const es_playlist = await client.execute(
            'SELECT * FROM Playlist WHERE id_playlist = ?', [id_lista]
        );

        let es_una_playlist = null;
        let contenido_multimedia = [];

        // Obtener datos lista -> nombre, color, privacidad
        const datos_playlist = await client.execute(
            'SELECT nombre, color, es_publica FROM Lista_reproduccion WHERE id_lista = ?',
            [id_lista]
        );
        const color = datos_playlist.rows[0].color;
        const nombre = datos_playlist.rows[0].nombre;
        const es_publica = datos_playlist.rows[0].es_publica;

        if (es_playlist.rows.length > 0) { // es una playlist
            es_una_playlist = true;

            // Obtenemos los id's que pertenecen a una playlist
            const canciones_playlist = await client.execute("SELECT id_cancion FROM Canciones_en_playlist WHERE id_playlist = ?", [id_lista]);
            let list_canciones = []
            if (canciones_playlist.rows.length > 0) { // se almacenan las canciones de las que el artista sea artista principal
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
                        nombre_creador: row.nombre_creador,
                        artistas_feat: row.artistas_feat,
                        id_grupo: row.id_grupo,
                        nombre_grupo: row.nombre_grupo,
                        valoracion_del_usuario,
                        valoracion_media
                    });
                }
            }
        } else { // es una lista de episodios
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
                [id_lista]);
            for (const row of episodios_lista_result.rows) {
                const valoracion_del_usuario = await getRating(row.id_cm, nombre_usuario);
                const valoracion_media = await getAverageRating(row.id_cm);
    
                contenido_multimedia.push({
                    id_cm: row.id_cm,
                    titulo: row.titulo,
                    link_imagen: row.link_imagen,
                    duracion: row.duracion,
                    nombre_creador: row.nombre_creador,
                    artistas_feat: row.artistas_feat,
                    id_grupo: row.id_grupo,
                    nombre_grupo: row.nombre_grupo,
                    valoracion_del_usuario,
                    valoracion_media
                });
            }
        }

        res.status(200).json({
            nombre: nombre,
            color: color,
            es_playlist: es_una_playlist,
            es_publica: es_publica,
            nombre_usuario: nombre_usuario_lista,
            contenido: contenido_multimedia
        });

    } catch (error) {
        console.error("Error al obtener la lista:", error);
        res.status(500).json({ message: "Hubo un error al obtener la lista" });
    }
}

module.exports = { getListData }