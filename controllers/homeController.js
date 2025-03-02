/*
A MOSTRAR:
10 artistas random -> this is ?artist (listas de reproduccion)  -> id_lista, nombre, nombre_artista, foto
10 podcasts -> id, nombre, foto
listas de reproduccion por genero -> 10 generos. otras 10 de idiomas -> id_lista, nombre, color

HACER:
- crear admin spongefy
- carpetas de listas de reproduccion
    - listas de géneros
    - listas de idiomas
    - listas de artistas
*/

const client = require('../db');

const getHome = async (req, res) => {
    try {
        // sacar id,nombre,foto de 10 podcasts
        const podcasts_info = await client.execute("SELECT id_podcast, nombre, link_imagen FROM Podcast LIMIT 10");

        // sacar 10 listas de reproduccion de géneros
        const carpeta_genero_result = await client.execute("SELECT id_carpeta, nombre FROM Carpeta WHERE nombre = 'Géneros'");
        let list_listas_genero = [];
        const listas_genero_result = await client.execute("SELECT id_lista FROM Listas_de_carpeta WHERE id_carpeta = ? LIMIT 10", [carpeta_genero_result.rows[0].id_carpeta]);
        if (listas_genero_result.rows.length > 0) {
            list_listas_genero = listas_genero_result.rows.map((row) => row.id_lista);
        }
        
        let listas_genero_info = [];
        if (listas_genero_result.rows.length > 0) {
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
        const carpeta_idioma_result = await client.execute("SELECT id_carpeta, nombre FROM Carpeta WHERE nombre = 'Idiomas'");
        let list_listas_idioma = [];
        const listas_idioma_result = await client.execute("SELECT id_lista FROM Listas_de_carpeta WHERE id_carpeta = ? LIMIT 10", [carpeta_idioma_result.rows[0].id_carpeta]);
        if (listas_idioma_result.rows.length > 0) {
            list_listas_idioma = listas_idioma_result.rows.map((row) => row.id_lista);
        }
        
        let listas_idioma_info = [];
        if (listas_idioma_result.rows.length > 0) {
            const dynamic_idioma = list_listas_idioma.map(() => "?").join(",");
            const query_idioma = ` SELECT id_lista, nombre, color 
                            FROM Lista_reproduccion 
                            WHERE id_lista IN (${dynamic_idioma})
                            LIMIT 10;
                            `;
            const listas_idioma_info_result = await client.execute(query_idioma, list_listas_idioma);
            listas_idioma_info = listas_idioma_info_result.rows;
        }

        res.status(200).json({ 
            podcasts: podcasts_info.rows,
            listas_genero_info: listas_genero_info,
            listas_idioma_info: listas_idioma_info
        });

    } catch (error) {
        console.error("Error al obtener home", error);
        res.status(500).json({ message: "Hubo un error al obtener home" });
    }
};

module.exports = { getHome };