const client = require('../db');
const { getRating, getAverageRating } = require('./ratesController');

/*
por query se me pasa el id del episodio

PANTALLA EPISODIO:
- titulo
- podcast (id, nombre, foto)
- descripcion episodio
- fecha de publicacion
*/

// Muestra la información para la pantalla de un episodio
const getEpisode = async (req, res) => {
    try {
        const { id_ep } = req.query;

        if (!id_ep) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el episodio existe
        const result_ep_exists = await client.execute("SELECT * FROM Episodio WHERE id_ep = ?", [id_ep]);
        if (result_ep_exists.rows.length == 0) {
            return res.status(400).json({ message: "El episodio no existe" });
        }

        let info_ep = [];
        // mostrar información del episodio
        const result_ep_info = await client.execute(`
            SELECT cm.titulo AS nombre_ep, ep.id_podcast, p.nombre AS nombre_podcast, 
                   p.link_imagen, ep.descripcion, cm.fecha_pub
            FROM Episodio ep
            JOIN Contenido_multimedia cm ON cm.id_cm = ep.id_ep
            JOIN Podcast p ON ep.id_podcast = p.id_podcast
            WHERE ep.id_ep = ?`, [id_ep]);
        info_ep = result_ep_info.rows[0];
        res.status(200).json({
            nombre_ep: info_ep.nombre_ep,
            id_podcast: info_ep.id_podcast,
            nombre_podcast: info_ep.nombre_podcast,
            link_imagen: info_ep.link_imagen,
            descripcion: info_ep.descripcion,
            fecha_pub: info_ep.fecha_pub
        });

    } catch (error) {
        console.error("Error al obtener el episodio:", error);
        res.status(500).json({ message: "Hubo un error al obtener el episodio" });
    }
};

/*
por query se me pasa el usuario y el id del podcast

PANTALLA PODCAST:
- foto podcast
- nombre podcast
- descripcion podcast
- nombres creadores (1 o más)
- episodios (id, nombre, (no mostrar)fecha de publicacion(ordenado más reciente), duracion, descripcion)
- valoraciones del usuario de cada episodio
- valoraciones generales de cada episodio (media de valoraciones de todos los usuarios)
*/

// Muestra la información para la pantalla de un podcast
const getPodcast = async (req, res) => {
    try {
        const { id_podcast, nombre_usuario } = req.query;

        if (!id_podcast || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario existe
        const result_user_exists = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user_exists.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si el podcast existe
        const result_podcast_exists = await client.execute("SELECT * FROM Podcast WHERE id_podcast = ?", [id_podcast]);
        if (result_podcast_exists.rows.length == 0) {
            return res.status(400).json({ message: "El podcast no existe" });
        }

        // nombre de los creadores
        let info_creadores = [];
        const result_creadores = await client.execute(`
            SELECT tp.nombre_podcaster
            FROM Tiene_podcast tp
            JOIN Podcaster po ON po.nombre_podcaster = tp.nombre_podcaster
            JOIN Podcast p ON p.id_podcast = tp.id_podcast
            WHERE p.id_podcast = ?`, [id_podcast]);
        info_creadores = result_creadores.rows.map(row => row.nombre_podcaster);

        let info_podcast = [];
        // mostrar información del podcast
        const result_podcast_info = await client.execute(`
            SELECT p.nombre, p.descripcion, p.link_imagen
            FROM Podcast p
            WHERE p.id_podcast = ?`, [id_podcast]);
        info_podcast = result_podcast_info.rows.map(row => ({
            nombre_podcast: row.nombre,
            descripcion: row.descripcion,
            link_imagen: row.link_imagen
        }))[0];

        let info_ep = [];
        // mostrar episodios del podcast
        const result_ep_info = await client.execute(`
            SELECT ep.id_ep, cm.titulo, ep.descripcion, cm.duracion
            FROM Episodio ep
            JOIN Contenido_multimedia cm ON cm.id_cm = ep.id_ep
            WHERE ep.id_podcast = ?
            ORDER BY cm.fecha_pub ASC`, [id_podcast]);
            
        // recorrer los episodios y agregar la información con las valoraciones
        for (const row of result_ep_info.rows) {
            const valoracion_del_usuario = await getRating(row.id_ep, nombre_usuario);
            const valoracion_media = await getAverageRating(row.id_ep);

            info_ep.push({
                id_ep: row.id_ep,
                nombre_ep: row.titulo,
                duracion: row.duracion,
                descripcion: row.descripcion,
                valoracion_del_usuario,
                valoracion_media
            });
        }
        
        res.status(200).json({
            podcast: info_podcast,
            episodios: info_ep,
            creadores: info_creadores
        });

    } catch (error) {
        console.error("Error al obtener el podcast:", error);
        res.status(500).json({ message: "Hubo un error al obtener el podcast" });
    }
};

module.exports = { getEpisode, getPodcast };