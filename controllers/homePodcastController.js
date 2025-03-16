const client = require('../db');

const getHomePodcast = async (req, res) => {
    try {
        // sacar id,nombre,foto de 10 podcasts
        const podcasts_info = await client.execute("SELECT id_podcast, nombre, link_imagen FROM Podcast LIMIT 10");

        // sacar 10 listas de reproduccion de podcasters (This is ?podcaster)
        const carpeta_podcasters_result = await client.execute("SELECT c.id_carpeta FROM Carpeta c, Carpetas_del_usuario u WHERE nombre = 'Podcasters' AND c.id_carpeta = u.id_carpeta AND u.nombre_usuario = 'spongefy'");
        let list_listas_podcasters = [];
        let listas_podcasters_info = [];
        let datos_podcasters = [];
        let listas_podcasters_final = [];
        const listas_podcasters_result = await client.execute("SELECT id_lista FROM Listas_de_carpeta WHERE id_carpeta = ? LIMIT 10", [carpeta_podcasters_result.rows[0].id_carpeta]);
        if (listas_podcasters_result.rows.length > 0) {
            list_listas_podcasters = listas_podcasters_result.rows.map((row) => row.id_lista);

            // sacar la información de las listas de reproduccion de podcasters
            const dynamic_podcasters = list_listas_podcasters.map(() => "?").join(",");
            const query_podcasters = ` SELECT id_lista, nombre 
                            FROM Lista_reproduccion 
                            WHERE id_lista IN (${dynamic_podcasters})
                            LIMIT 10;
                            `;
            const listas_podcasters_info_result = await client.execute(query_podcasters, list_listas_podcasters);
            listas_podcasters_info = listas_podcasters_info_result.rows;

            // sacar la información de los podcasters de las listas de reproduccion obtenidas
            const nombre_podcasters = listas_podcasters_info.map(lista => lista.nombre.replace("This is ", "").trim());
            const dynamic_nombre_podcasters = nombre_podcasters.map(() => "?").join(",");
            const query_nombre_podcasters = ` SELECT nombre_creador, link_imagen
                                        FROM Creador c 
                                        WHERE nombre_creador IN (${dynamic_nombre_podcasters})`;
            const datos_podcasters_result = await client.execute(query_nombre_podcasters, nombre_podcasters);
            datos_podcasters = datos_podcasters_result.rows;
            
            // fusionar la información de las listas de podcasters con los datos de los podcasters
            listas_podcasters_final = listas_podcasters_info.map(lista => {
                const podcaster = datos_podcasters.find(a => a.nombre_creador === lista.nombre.replace("This is ", "").trim());
                return {
                    id_lista: lista.id_lista,
                    nombre: lista.nombre,
                    nombre_creador: podcaster ? podcaster.nombre_creador : null,
                    link_imagen: podcaster ? podcaster.link_imagen : null
                };
            });
        }

        // sacar 6 listas de reproduccion de episodios aleatorias
        const carpeta_aleatorio_result = await client.execute("SELECT c.id_carpeta FROM Carpeta c, Carpetas_del_usuario u WHERE nombre = 'Aleatorio Episodios' AND c.id_carpeta = u.id_carpeta AND u.nombre_usuario = 'spongefy'");
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

        // obtener un podcast random
        const podcast_random_result = await client.execute(`SELECT id_podcast, nombre, link_imagen FROM Podcast ORDER BY RANDOM() LIMIT 1`);
        const podcast_random = podcast_random_result.rows[0];
        // obtener los 4 episodios más recientes del podcast random
        const episodios_random_result = await client.execute(
                `SELECT e.id_ep, cm.titulo, cm.link_imagen, cm.fecha_pub, e.descripcion
                FROM Episodio e
                JOIN Contenido_multimedia cm ON e.id_ep = cm.id_cm
                WHERE id_podcast = ? 
                ORDER BY cm.fecha_pub DESC LIMIT 4`, 
                [podcast_random.id_podcast]);

        res.status(200).json({ 
            podcasts: podcasts_info.rows,
            listas_podcasters_info: listas_podcasters_final,
            listas_aleatorio_info: listas_aleatorio_info,
            podcast: {
                nombre_podcast: podcast_random.nombre,
                foto_podcast: podcast_random.link_imagen,
                episodios_recientes: episodios_random_result.rows
            }
        });
        
    } catch (error) {
        console.error("Error al obtener home de los podcasts", error);
        res.status(500).json({ message: "Hubo un error al obtener home de los podcasts" });
    }
};

module.exports = { getHomePodcast };