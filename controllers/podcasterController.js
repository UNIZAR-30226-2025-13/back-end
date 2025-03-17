const client = require('../db');

const getPodcaster = async (req, res) => {
    try {
        const { nombre_podcaster } = req.query; // obtener nombre del podcaster
        // console.log("Buscando podcaster:", nombre_podcaster); // Verifica el parámetro recibido
        const result_podcaster = await client.execute("SELECT * FROM Podcaster WHERE nombre_podcaster = ?", [nombre_podcaster]); // obtener perfil
        if (result_podcaster.rows.length === 0) {
            return res.status(400).json({ message: "El podcaster no existe" });
        }

        // obtener información del podcaster
        const creador_result = await client.execute("SELECT * FROM Creador WHERE nombre_creador = ?", [nombre_podcaster]);

        const creador = creador_result.rows[0];
        const biografia = creador.biografia;
        // const link_compartir = creador.link_compartir;
        const link_imagen = creador.link_imagen;

        // obtener número de seguidores del podcaster
        const seguidores_result = await client.execute("SELECT COUNT(*) AS seguidores FROM Sigue_a_creador WHERE nombre_creador = ?", [nombre_podcaster]);
        const num_seguidores = seguidores_result.rows[0].seguidores;

        // obtener la lista de reproducción de "This is" del podcaster
        const lista_podcaster_result = await client.execute("SELECT id_lista, nombre FROM Lista_reproduccion WHERE nombre = CONCAT('This is ', ?)", [nombre_podcaster]);

        // devolver la lista "This is", si existe
        let lista_this_is = null;
        if (lista_podcaster_result.rows.length > 0) {
            lista_this_is = lista_podcaster_result.rows[0];
        }

        // devolver todos los podcasts del podcaster y sus episodios
        const podcast_result = await client.execute("SELECT * FROM Tiene_podcast WHERE nombre_podcaster = ?", [nombre_podcaster]);
        let podcasts_info = []; // almacenar la información de los podcasts obtenidos
        let list_episodios = []; // almacenar los episodios de los podcasts
        let ep_mas_reciente = []; // almacenar el episodio más reciente del podcaster
        if (podcast_result.rows.length > 0) {
            const list_podcasts = podcast_result.rows.map((row) => row.id_podcast);
            // creación de lista dinámica en función del número de podcasts
            const dynamic_podcasts = list_podcasts.map(() => "?").join(",");
            
            // se obtiene la información necesaria de cada podcast
            const query_podcasts = `SELECT id_podcast, nombre, link_imagen FROM Podcast WHERE id_podcast IN (${dynamic_podcasts})`;
            const query_episodios = `SELECT p.link_imagen, c.id_cm AS id_episodio, c.titulo AS titulo_episodio
                                    FROM Episodio e
                                    JOIN Podcast p ON p.id_podcast = e.id_podcast
                                    JOIN Contenido_multimedia c ON c.id_cm = e.id_ep
                                    WHERE p.id_podcast IN (${dynamic_podcasts})`;
            const query_ep_mas_reciente = `SELECT p.link_imagen, c.id_cm AS id_episodio, c.titulo AS titulo_episodio, e.descripcion
                                    FROM Episodio e
                                    JOIN Podcast p ON p.id_podcast = e.id_podcast
                                    JOIN Contenido_multimedia c ON c.id_cm = e.id_ep
                                    WHERE p.id_podcast IN (${dynamic_podcasts})
                                    ORDER BY c.fecha_pub DESC
                                    LIMIT 1`;
            
            const podcasts_info_result = await client.execute(query_podcasts, list_podcasts);
            const episodios_result = await client.execute(query_episodios, list_podcasts);
            const ep_mas_reciente_result = await client.execute(query_ep_mas_reciente, list_podcasts);
            
            podcasts_info = podcasts_info_result.rows;
            list_episodios = episodios_result.rows;
            ep_mas_reciente = ep_mas_reciente_result.rows;
        }

        res.status(200).json({ // devolver todo el perfil del podcaster
            nombre_podcaster: result_podcaster.rows[0].nombre_podcaster,
            biografia: biografia,
            // link_compartir: link_compartir,
            link_imagen: link_imagen,
            seguidores: num_seguidores,
            lista_this_is: lista_this_is,
            podcasts_info: podcasts_info,
            list_episodios: list_episodios,
            ep_mas_reciente: ep_mas_reciente
        });

    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ message: "Hubo un error al obtener el perfil" });
    }
};

module.exports = { getPodcaster };