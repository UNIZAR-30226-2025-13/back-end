const client = require('../db');

const getArtist = async (req, res) => {
    try {
        const { nombre_artista } = req.params; // obtener nombre del artista
        const result = await client.execute("SELECT * FROM Artista WHERE nombre_artista = ?", [nombre_artista]); // obtener perfil
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "El artista no existe" });
        }

    //const artista = result.rows[0];

        // obtener información del artista
        const creador_result = await client.execute("SELECT * FROM Creador WHERE nombre_creador = ?", [nombre_artista]);
        if (creador_result.rows.length == 0) { // verificacion por si acaso
            return res.status(400).json({ message: "El creador no existe" });
        }

        const creador = creador_result.rows[0];

        const biografia = creador.biografia;
        // const link_compartir = creador.link_compartir;
        const link_imagen = creador.link_imagen;

        let list_albumes = []; // almacenar los albumes del artista
        const albumes_result = await client.execute("SELECT id_album FROM Artista_posee_albumes WHERE nombre_artista = ?", [nombre_artista]);
        if (albumes_result.rows.length > 0) {
            list_albumes = albumes_result.rows.map((row) => row.id_album);
        }

        if (list_albumes.length > 0) {
            // creación de lista dinamica en función del nº de albumes que haya en el array albumes
            const dynamic = list_albumes.map(() => "?").join(",");
            // se obtiene la informacion necesaria únicamente de los albumes que sean discos
            const query = await client.execute("SELECT id_album, nombre_album, link_imagen FROM Album WHERE es_disco = TRUE and id_album IN (${dynamic})");
            // realizar la consulta
            const albumes_info_result = await client.execute(query, list_albumes);
            // se almacena la información
            const albumes_info = albumes_info_result.rows;
        }

        let list_canciones = []; // almacenar las canciones del artista
        const canciones_princ_result = await client.execute("SELECT id_cancion FROM Aritista_principal WHERE nombre_artista = ?", [nombre_artista]);
        if (canciones_princ_result.rows.length > 0) { // se almacenan las canciones de las que el artista sea artista principal
            list_canciones = canciones_princ_result.rows.map((row) => row.id_cancion);
        }
        const canciones_feat_result = await client.execute("SELECT id_cancion FROM Featuring WHERE nombre_artista = ?", [nombre_artista]);
        if (canciones_feat_result.rows.length > 0) { // se almacenan las canciones de las que el artista sea artista feat
            list_canciones = list_canciones.concat(canciones_feat_result.rows.map((row) => row.id_cancion));
        }

        if (list_canciones.length > 0) {
            // creación de lista dinamica en función del nº de canciones que haya en el array canciones
            const dynamic = list_canciones.map(() => "?").join(",");
            // se obtiene la informacion necesaria únicamente de las canciones
            const query = ` SELECT id_cancion, nombre_cancion, n_repros, link_img, duracion, fecha_pub 
                            FROM Cancion c, Contenido_multimedia cm, Artista_principal ap, Featuring f
                            WHERE c.id_cancion = cm.id_cm AND c.id_cancion = ap.id_cancion AND c.id_cancion = f.id_cancion
                            WHERE id_cancion 
                            IN (${dynamic})")
                            `;
            
            const query1 = await client.execute("SELECT id_cancion, n_repros FROM Cancion WHERE id_cancion IN (${dynamic})");
            const query2 = await client.execute("SELECT id_cm, titulo, duracion, link_img, fecha_pub FROM Contenido_multimedia WHERE id_cm IN (${dynamic})");
            const query3 = await client.execute("SELECT id_cancion, nombre_artista FROM Artista_principal WHERE id_cancion IN (${dynamic})"); // HACE FALTA?
            const query4 = await client.execute("SELECT id_cancion, nombre_artista FROM Featuring WHERE id_cancion IN (${dynamic})"); // ??
            // realizar la 1a consulta
            const albumes_info_result = await client.execute(query, list_canciones);
            // se almacena la información
            const albumes_info = albumes_info_result.rows;
        }
        // de una cancion hay que guardar -> foto nombre artista/s n_repros duracion fecha_pub


    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ message: "Hubo un error al obtener el perfil" });
    }
};

module.exports = { getArtist };