const client = require('../db');

const getHome = async (req, res) => {
    try {
        // sacar id,nombre,foto de 10 podcasts
        const podcasts_info = await client.execute("SELECT id_podcast, nombre, link_imagen FROM Podcast LIMIT 10");

        // sacar 10 listas de reproduccion de géneros
        const carpeta_genero_result = await client.execute("SELECT c.id_carpeta FROM Carpeta c, Carpetas_del_usuario u WHERE c.nombre = 'Géneros' AND c.id_carpeta = u.id_carpeta AND u.nombre_usuario = 'spongefy'");
        let list_listas_genero = [];
        const listas_genero_result = await client.execute("SELECT id_lista FROM Listas_de_carpeta WHERE id_carpeta = ? LIMIT 10", [carpeta_genero_result.rows[0].id_carpeta]);
        let listas_genero_info = [];
        if (listas_genero_result.rows.length > 0) {
            list_listas_genero = listas_genero_result.rows.map((row) => row.id_lista);

            // sacar información de las listas de reproduccion de géneros
            const dynamic_genero = list_listas_genero.map(() => "?").join(",");
            const query_genero = ` SELECT id_lista, nombre, color 
                            FROM Lista_reproduccion 
                            WHERE id_lista IN (${dynamic_genero})
                            LIMIT 10;
                            `;
            const listas_genero_info_result = await client.execute(query_genero, list_listas_genero);
            listas_genero_info = listas_genero_info_result.rows;
        }

        // sacar 10 listas de reproduccion de idiomas
        const carpeta_idioma_result = await client.execute("SELECT c.id_carpeta FROM Carpeta c, Carpetas_del_usuario u WHERE c.nombre = 'Idiomas' AND c.id_carpeta = u.id_carpeta AND u.nombre_usuario = 'spongefy'");
        let list_listas_idioma = [];
        const listas_idioma_result = await client.execute("SELECT id_lista FROM Listas_de_carpeta WHERE id_carpeta = ? LIMIT 10", [carpeta_idioma_result.rows[0].id_carpeta]);
        let listas_idioma_info = [];
        if (listas_idioma_result.rows.length > 0) {
            list_listas_idioma = listas_idioma_result.rows.map((row) => row.id_lista);

            // sacar información de las listas de reproduccion de idiomas
            const dynamic_idioma = list_listas_idioma.map(() => "?").join(",");
            const query_idioma = ` SELECT id_lista, nombre, color 
                            FROM Lista_reproduccion 
                            WHERE id_lista IN (${dynamic_idioma})
                            LIMIT 10;
                            `;
            const listas_idioma_info_result = await client.execute(query_idioma, list_listas_idioma);
            listas_idioma_info = listas_idioma_info_result.rows;
        }

        // sacar 10 listas de reproduccion de artistas (This is ?artist)
        const carpeta_artistas_result = await client.execute("SELECT c.id_carpeta FROM Carpeta c, Carpetas_del_usuario u WHERE nombre = 'Artistas' AND c.id_carpeta = u.id_carpeta AND u.nombre_usuario = 'spongefy'");
        let list_listas_artistas = [];
        let listas_artistas_info = [];
        let datos_artistas = [];
        let listas_artistas_final = [];
        const listas_artistas_result = await client.execute("SELECT id_lista FROM Listas_de_carpeta WHERE id_carpeta = ? LIMIT 10", [carpeta_artistas_result.rows[0].id_carpeta]);
        if (listas_artistas_result.rows.length > 0) {
            list_listas_artistas = listas_artistas_result.rows.map((row) => row.id_lista);
            
            // sacar la información de las listas de reproduccion de artistas
            const dynamic_artistas = list_listas_artistas.map(() => "?").join(",");
            const query_artistas = ` SELECT id_lista, nombre 
                            FROM Lista_reproduccion 
                            WHERE id_lista IN (${dynamic_artistas})
                            LIMIT 10;
                            `;
            const listas_artistas_info_result = await client.execute(query_artistas, list_listas_artistas);
            listas_artistas_info = listas_artistas_info_result.rows;

            // sacar la información de los artistas de las listas de reproduccion obtenidas
            const nombre_artistas = listas_artistas_info.map(lista => lista.nombre.replace("This is ", "").trim());
            const dynamic_nombre_artistas = nombre_artistas.map(() => "?").join(",");
            const query_nombre_artistas = ` SELECT nombre_creador, link_imagen
                                        FROM Creador c 
                                        WHERE nombre_creador IN (${dynamic_nombre_artistas})`;
            const datos_artistas_result = await client.execute(query_nombre_artistas, nombre_artistas);
            datos_artistas = datos_artistas_result.rows;
            
            // fusionar la información de las listas de artistas con los datos de los artistas
            listas_artistas_final = listas_artistas_info.map(lista => {
                const artista = datos_artistas.find(a => a.nombre_creador === lista.nombre.replace("This is ", "").trim());
                return {
                    id_lista: lista.id_lista,
                    nombre: lista.nombre,
                    nombre_creador: artista ? artista.nombre_creador : null,
                    link_imagen: artista ? artista.link_imagen : null
                };
            });
        }

        res.status(200).json({ 
            podcasts: podcasts_info.rows,
            listas_genero_info: listas_genero_info,
            listas_idioma_info: listas_idioma_info,
            listas_artistas_info: listas_artistas_final
        });

    } catch (error) {
        console.error("Error al obtener home", error);
        res.status(500).json({ message: "Hubo un error al obtener home" });
    }
};

module.exports = { getHome };