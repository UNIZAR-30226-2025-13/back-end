const client = require('../db');

const getArtist = async (req, res) => {
    try {
        const { nombre_artista } = req.query; // obtener nombre del artista
        console.log("Buscando artista:", nombre_artista); // Verifica el parámetro recibido
        const result_artista = await client.execute("SELECT * FROM Artista WHERE nombre_artista = ?", [nombre_artista]); // obtener perfil
        if (result_artista.rows.length === 0) {
            return res.status(400).json({ message: "El artista no existe" });
        }

        // obtener información del artista
        const creador_result = await client.execute("SELECT * FROM Creador WHERE nombre_creador = ?", [nombre_artista]);
        /*
        if (creador_result.rows.length == 0) { // verificacion por si acaso
            return res.status(400).json({ message: "El creador no existe" });
        }
        */
        const creador = creador_result.rows[0];
        const biografia = creador.biografia;
        // const link_compartir = creador.link_compartir;
        const link_imagen = creador.link_imagen;

        let albumes_info = []; // almacenar la información de los albumes del artista
        const albumes_result = await client.execute("SELECT id_album FROM Artista_posee_albumes WHERE nombre_artista = ?", [nombre_artista]);
        if (albumes_result.rows.length > 0) {
            const list_albumes = albumes_result.rows.map((row) => row.id_album);
            // creación de lista dinamica en función del nº de albumes que haya en el array albumes
            const dynamic = list_albumes.map(() => "?").join(",");
            // se obtiene la informacion necesaria únicamente de los albumes que sean discos
            const query = ` SELECT id_album, nombre_album, link_imagen 
                            FROM Album WHERE es_disco = TRUE and id_album IN (${dynamic})`;
            // realizar la consulta
            const albumes_info_result = await client.execute(query, list_albumes);
            // se almacena la información
            albumes_info = albumes_info_result.rows;
        }

        let list_canciones = []; // almacenar las canciones del artista
        const canciones_princ_result = await client.execute("SELECT id_cancion FROM Artista_principal WHERE nombre_artista = ?", [nombre_artista]);
        if (canciones_princ_result.rows.length > 0) { // se almacenan las canciones de las que el artista sea artista principal
            list_canciones = canciones_princ_result.rows.map((row) => row.id_cancion);
        }
        const canciones_feat_result = await client.execute("SELECT id_cancion FROM Featuring WHERE nombre_artista = ?", [nombre_artista]);
        if (canciones_feat_result.rows.length > 0) { // se almacenan las canciones de las que el artista sea artista feat
            list_canciones = list_canciones.concat(canciones_feat_result.rows.map((row) => row.id_cancion));
        }

        let canciones_info = []; // almacenar la información de las canciones
        if (list_canciones.length > 0) {
            // creación de lista dinamica en función del nº de canciones que haya en el array canciones
            const dynamic = list_canciones.map(() => "?").join(",");
            // se obtiene la informacion necesaria únicamente de las canciones
            // si una cancion no tiene artistas feat, se devuelve la cadena vacía
            const query = ` SELECT c.id_cancion, cm.titulo, c.n_repros, cm.link_img, cm.duracion, cm.fecha_pub,
                                   ap.nombre_artista, COALESCE(GROUP_CONCAT(DISTINCT f.nombre_artista), '') AS artistas_feat
                            FROM Cancion c
                            JOIN Contenido_multimedia cm ON c.id_cancion = cm.id_cm
                            JOIN Artista_principal ap ON ap.id_cancion = c.id_cancion
                            LEFT JOIN Featuring f ON f.id_cancion = c.id_cancion
                            WHERE c.id_cancion IN (${dynamic})
                            GROUP BY c.id_cancion, cm.titulo, c.n_repros, cm.link_img, 
                                     cm.duracion, cm.fecha_pub, ap.nombre_artista
                            ORDER BY cm.fecha_pub DESC;
                            `;
            // realizar la 1a consulta
            const canciones_info_result = await client.execute(query, list_canciones);
            // se almacena la información
            canciones_info = canciones_info_result.rows;
        }

        res.status(200).json({ // devolver todo el perfil del artista
            nombre_artista: result_artista.rows[0].nombre_artista,
            biografia: biografia,
            // link_compartir: link_compartir,
            link_imagen: link_imagen,
            albumes: albumes_info,
            canciones: canciones_info
        });

    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ message: "Hubo un error al obtener el perfil" });
    }
};

module.exports = { getArtist };