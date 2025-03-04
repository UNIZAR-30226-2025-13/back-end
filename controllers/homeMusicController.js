/*
A MOSTRAR:
- TODO LO DEL HOME NORMAL (menos los podcasts)
- de 1 carpeta de spongefy llamada ALEATORIO CANCIONES:
    obtener 6 listas de reproducción aleatorias
- de un artista aleatorio:
        - su foto
        - su nombre
        - las 5 cosas más recientes (ya sean canciones o albumes)
*/

const client = require('../db');

const getHomeMusic = async (req, res) => {
    try {
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
        const listas_artistas_result = await client.execute("SELECT id_lista FROM Listas_de_carpeta WHERE id_carpeta = ? LIMIT 10", [carpeta_artistas_result.rows[0].id_carpeta]);
        if (listas_artistas_result.rows.length > 0) {
            list_listas_artistas = listas_artistas_result.rows.map((row) => row.id_lista);
        }

        let listas_artistas_info = [];
        let datos_artistas = [];
        let listas_artistas_final = [];
        if (listas_artistas_result.rows.length > 0) {
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
        
        // sacar 6 listas de reproduccion de canciones aleatorias
        const carpeta_aleatorio_result = await client.execute("SELECT c.id_carpeta FROM Carpeta c, Carpetas_del_usuario u WHERE nombre = 'Aleatorio Canciones' AND c.id_carpeta = u.id_carpeta AND u.nombre_usuario = 'spongefy'");
        const listas_aleatorio_result = await client.execute("SELECT id_lista FROM Listas_de_carpeta WHERE id_carpeta = ? LIMIT 6", [carpeta_aleatorio_result.rows[0].id_carpeta]);
        let list_listas_aleatorio = [];
        let listas_aleatorio_info = [];
        if (listas_aleatorio_result.rows.length > 0) {
            list_listas_aleatorio = listas_aleatorio_result.rows.map((row) => row.id_lista);

            // sacar información de las listas de reproduccion aleatorias
            const dynamic_aleatorio = list_listas_aleatorio.map(() => "?").join(",");
            const query_aleatorio = ` SELECT id_lista, nombre, color 
                            FROM Lista_reproduccion 
                            WHERE id_lista IN (${dynamic_aleatorio})
                            LIMIT 6;
                            `;
            const listas_aleatorio_info_result = await client.execute(query_aleatorio, list_listas_aleatorio);
            listas_aleatorio_info = listas_aleatorio_info_result.rows;
        }

        const artista_result = await client.execute("SELECT nombre_artista, link_imagen FROM Artista ORDER BY RANDOM() LIMIT 1");
        const artista = artista_result.rows[0];
        // obtener las 5 canciones y álbumes más recientes del artista random
        const canciones_albumes_result = await client.execute(
          ` SELECT c.id_cancion, cm.titulo, cm.link_imagen
            FROM Cancion c
            JOIN Contenido_multimedia cm ON c.id_cancion = cm.id_cm
            WHERE nombre_artista = ?
            UNION ALL
            SELECT id_album, nombre_album, link_imagen
            FROM Album
            WHERE nombre_artista = ? AND es_disco = TRUE
            ORDER BY fecha_lanzamiento DESC
            LIMIT 5`, 
            [artista.nombre_artista, artista.nombre_artista]
        );

        res.status(200).json({ 
            podcasts: podcasts_info.rows,
            listas_genero_info: listas_genero_info,
            listas_idioma_info: listas_idioma_info,
            listas_artistas_info: listas_artistas_final,
            listas_aleatorio_info: listas_aleatorio_info,
            artista: {
                nombre_artista: artista.nombre_artista,
                link_imagen: artista.link_imagen,
                canciones_albumes: canciones_albumes_result.rows
            }
        });

    } catch (error) {
        console.error("Error al obtener home de música", error);
        res.status(500).json({ message: "Hubo un error al obtener home de música" });
    }
};

module.exports = { getHomeMusic };