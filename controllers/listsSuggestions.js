const { GoogleGenAI } = require("@google/genai");
const client = require("../db");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generarPromptCanciones = (playlists, canciones) => `
Te voy a dar el título de una playlist y una lista de 100 canciones. Cada canción tiene un id, nombre, género e idioma. 
Tu tarea es decir qué canciones de las dadas podrían encajar en la playlist. Teniendo en cuenta su título, el género, idioma e información que tengas de esa canción.
Tienes que escoger 10 canciones. Tienes que devolver el id de la canción y el nombre.

Devuelve la respuesta con el siguiente formato:
{
    canciones: [
        {
            id_canción: "id de la canción",
            nombre: "nombre de la canción"
        }
    ]
}

Solo devuelve el JSON, sin ningún texto adicional.

Playlist:
${JSON.stringify(playlists, null, 2)}

Canciones:
${JSON.stringify(canciones, null, 2)}
`;

const generarPromptCancionesNuevaPlaylist = (nombre_playlists, contexto, canciones) => `
Te voy a dar el título de una playlist, un contexto y una lista de 100 canciones. Cada canción tiene un id, nombre, género e idioma. 
Tu tarea es decir qué canciones de las dadas podrían encajar en la playlist. Teniendo en cuenta su título, el género, idioma y el contexto.
Tienes que escoger 15 canciones. Tienes que devolver el id de la canción y el nombre.

Devuelve la respuesta con el siguiente formato:
{
    canciones: [
        {
            id_canción: "id de la canción",
            nombre: "nombre de la canción"
        }
    ]
}

Solo devuelve el JSON, sin ningún texto adicional.

Nombre de la playlist:
${JSON.stringify(nombre_playlists, null, 2)}

Contexto:
${JSON.stringify(contexto, null, 2)}

Canciones:
${JSON.stringify(canciones, null, 2)}
`;

const generarPromptEpisodios = (playlists, episodios) => `
Te voy a dar el título de una playlist de episodios y una lista de 100 episodios de podcasts diferentes. Cada episodio tiene un id, título, id_podcast y descripción. 
Tu tarea es decir qué episodios de las dadas podrían encajar en la playlist. Teniendo en cuenta su título y la descripción del episodio.
Tienes que escoger 10 episodios. Tienes que devolver el id del episodio, el título y el id_podcast.

Devuelve la respuesta con el siguiente formato:
{
    episodios: [
        {
            id_episodio: "id del episodio",
            titulo: "titulo del episodio",
            id_podcast: "id del podcast"
        }
    ]
}

Solo devuelve el JSON, sin ningún texto adicional.

Playlist:
${JSON.stringify(playlists, null, 2)}

Episoidos:
${JSON.stringify(episodios, null, 2)}
`;

const obtenerCanciones = async () => {
    try {
        const result = await client.execute(`
            SELECT 
                cm.id_cm AS id,
                cm.titulo AS nombre,
                g.genero,
                i.idioma
            FROM Cancion c
            JOIN Contenido_multimedia cm ON c.id_cancion = cm.id_cm
            JOIN Generos g ON c.id_cancion = g.id_cancion
            JOIN Idiomas_multimedia i ON c.id_cancion = i.id_cm
            ORDER BY RANDOM()
            LIMIT 100;
        `);
        return result.rows ?? result; // depende del driver que uses
    } catch (error) {
        console.error("Error al obtener canciones:", error);
        return null;
    }
};

const obtenerEpisodios = async () => {
    try {
        const result = await client.execute(`
            SELECT 
                cm.id_cm AS id_ep,
                cm.titulo AS nombre,
                e.id_podcast,
                e.descripcion
            FROM Episodio e
            JOIN Contenido_multimedia cm ON e.id_ep = cm.id_cm
            ORDER BY RANDOM()
            LIMIT 100;
        `);
        return result.rows ?? result; // depende del driver que uses
    } catch (error) {
        console.error("Error al obtener episodios:", error);
        return null;
    }
};

const asignarCanciones = async (req, res) => {
    const { playlist, id_playlist } = req.body;

    const canciones = await obtenerCanciones();

    console.log(canciones);

    if (!playlist || !canciones || !id_playlist) {
        return res.status(400).json({ error: "Faltan datos necesarios" });
    }

    const prompt = generarPromptCanciones(playlist, canciones);

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const respuesta = result.candidates[0]?.content?.parts[0]?.text;

        if (!respuesta) {
            throw new Error("La respuesta de Gemini no contiene texto");
        }

        // 🔥 Limpiar los bloques markdown tipo ```json ... ```
        const jsonLimpio = respuesta.replace(/```json|```/g, "").trim();

        let cancionesAI;
        try {
            cancionesAI = JSON.parse(jsonLimpio);
        } catch (error) {
            console.error("Error al parsear JSON:", error);
            console.log("Texto sin parsear:", jsonLimpio);
            return res.status(500).json({ error: "Respuesta de la IA malformada" });
        }

        // 1. Borrar canciones actuales de la playlist
        await client.execute(`DELETE FROM Canciones_en_playlist WHERE id_playlist = ?`, [
            id_playlist,
        ]);

        // 2. Insertar las nuevas canciones
        for (const cancion of cancionesAI.canciones) {
            const id = cancion.id_canción || cancion.id_cancion; // por si responde con acento
            await client.execute(
                `INSERT INTO Canciones_en_playlist (id_playlist, id_cancion) VALUES (?, ?)`,
                [id_playlist, id]
            );
        }

        return res.status(200).json({
            message: "Asignación actualizada con éxito",
            data: cancionesAI,
        });
    } catch (error) {
        console.error("Error al asignar canciones:", error);
        res.status(500).json({ error: "Error llamando a la IA o insertando en BD" });
    }
};

const asignarEpisodios = async (req, res) => {
    const { lista_ep, id_lista_ep } = req.body;

    const episodios = await obtenerEpisodios();

    if (!lista_ep || !episodios || !id_lista_ep) {
        return res.status(400).json({ error: "Faltan datos necesarios" });
    }

    const prompt = generarPromptEpisodios(lista_ep, episodios);

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const respuesta = result.candidates[0]?.content?.parts[0]?.text;

        if (!respuesta) {
            throw new Error("La respuesta de Gemini no contiene texto");
        }

        // 🔥 Limpiar los bloques markdown tipo ```json ... ```
        const jsonLimpio = respuesta.replace(/```json|```/g, "").trim();

        let episodiosAI;
        try {
            episodiosAI = JSON.parse(jsonLimpio);
        } catch (error) {
            console.error("Error al parsear JSON:", error);
            console.log("Texto sin parsear:", jsonLimpio);
            return res.status(500).json({ error: "Respuesta de la IA malformada" });
        }

        console.log(episodiosAI);

        // 1. Borrar episodios actuales de la playlist
        await client.execute(`DELETE FROM Episodios_de_lista WHERE id_lista_ep = ?`, [id_lista_ep]);

        // 2. Insertar los nuevos episodios
        for (const episodio of episodiosAI.episodios) {
            const id = episodio.id_episodio;
            const id_podcast = episodio.id_podcast;

            console.log("ID EPISODIO:", id);
            console.log("ID PODCAST:", id_podcast);
            console.log("ID LISTA EP:", id_lista_ep);

            await client.execute(
                `INSERT INTO Episodios_de_lista (id_lista_ep, id_ep, id_podcast) VALUES (?, ?, ?)`,
                [id_lista_ep, id, id_podcast]
            );
        }

        return res.status(200).json({
            message: "Asignación actualizada con éxito",
            data: episodiosAI,
        });
    } catch (error) {
        console.error("Error al asignar episodios:", error);
        res.status(500).json({ error: "Error llamando a la IA o insertando en BD" });
    }
};

const generarPlaylist = async (req, res) => {
    const { nombre_playlist, contexto, color, nombre_usuario } = req.body;

    if (!nombre_playlist || !contexto) {
        return res.status(400).json({ error: "Faltan datos necesarios" });
    }

    const canciones = await obtenerCanciones();

    const prompt = generarPromptCancionesNuevaPlaylist(nombre_playlist, contexto, canciones);

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const respuesta = result.candidates[0]?.content?.parts[0]?.text;

        if (!respuesta) {
            throw new Error("La respuesta de Gemini no contiene texto");
        }

        // 🔥 Limpiar los bloques markdown tipo ```json ... ```
        const jsonLimpio = respuesta.replace(/```json|```/g, "").trim();

        let cancionesAI;
        try {
            cancionesAI = JSON.parse(jsonLimpio);
        } catch (error) {
            console.error("Error al parsear JSON:", error);
            console.log("Texto sin parsear:", jsonLimpio);
            return res.status(500).json({ error: "Respuesta de la IA malformada" });
        }

        // 1. Crear la nueva playlist
        const lista = await client.execute(
            `INSERT INTO Lista_reproduccion (nombre, color) VALUES (?, ?) RETURNING id_lista`,
            [nombre_playlist, color]
        );

        const id_lista = lista.rows[0].id_lista;

        await client.execute(`INSERT INTO Playlist (id_playlist) VALUES (?)`, [id_lista]);

        await client.execute(
            `INSERT INTO Listas_del_usuario (id_lista, nombre_usuario) VALUES (?, ?)`,
            [id_lista, nombre_usuario]
        );

        for (const cancion of cancionesAI.canciones) {
            const id = cancion.id_canción || cancion.id_cancion; // por si responde con acento
            await client.execute(
                `INSERT INTO Canciones_en_playlist (id_playlist, id_cancion) VALUES (?, ?)`,
                [id_lista, id]
            );
        }

        return res.status(200).json({
            message: "Playlist generada con éxito",
            data: respuesta,
        });
    } catch (error) {
        console.error("Error al generar playlist:", error);
        res.status(500).json({ error: "Error llamando a la IA" });
    }
};

module.exports = {
    asignarCanciones,
    asignarEpisodios,
    generarPlaylist,
};
