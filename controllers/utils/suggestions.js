const client = require("../../db");
const suggestSongs = async (nombre_usuario) => {
    // Obtener todos los id_cm de la cola del usuario
    const userQueue = await client.execute(
        `SELECT id_cm FROM Cola_Reproduccion WHERE propietario = ?`,
        [nombre_usuario]
    );

    const queueIds = userQueue.rows.map((row) => row.id_cm);

    const favoritePlaylist = await client.execute(
        `SELECT l.id_lista FROM Lista_reproduccion l
         JOIN Listas_del_usuario lu ON l.id_lista = lu.id_lista
         WHERE l.nombre = 'Tus canciones favoritas' AND lu.nombre_usuario = ?`,
        [nombre_usuario]
    );

    let favoriteSongIds = [];
    if (favoritePlaylist.rows.length > 0) {
        const favoritePlaylistId = favoritePlaylist.rows[0].id_lista;
        const favoriteSongs = await client.execute(
            `SELECT id_cancion FROM Canciones_en_playlist WHERE id_playlist = ?`,
            [favoritePlaylistId]
        );
        favoriteSongIds = favoriteSongs.rows.map((row) => row.id_cancion);
    }

    const placeholders = queueIds.map(() => "?").join(",");
    const songDetails = await client.execute(
        `SELECT c.id_cm, g.genero, i.idioma, a.nombre_artista 
     FROM Contenido_multimedia c
     LEFT JOIN Generos g ON c.id_cm = g.id_cancion
     LEFT JOIN Idiomas_multimedia i ON c.id_cm = i.id_cm
     LEFT JOIN Artista_principal a ON c.id_cm = a.id_cancion
     WHERE c.id_cm IN (${placeholders})`,
        queueIds
    );

    // Filtra los valores vacíos o undefined para evitar pasar valores no válidos
    const generos = songDetails.rows
        .map((row) => row.genero)
        .filter((genero) => genero != null);  // Considera también valores nulos
    const idiomas = songDetails.rows
        .map((row) => row.idioma)
        .filter((idioma) => idioma != null);  // Considera también valores nulos
    const artistas = songDetails.rows
        .map((row) => row.nombre_artista)
        .filter((artista) => artista != null);  // Considera también valores nulos

    // Si no hay géneros, idiomas ni artistas, podemos retornar una respuesta vacía para evitar consultas innecesarias
    if (generos.length === 0 && idiomas.length === 0 && artistas.length === 0) {
        console.log("No hay datos suficientes para realizar sugerencias.");
        return [];
    }

    // Crear los marcadores de posición para los valores de cada array
    const placeholdersGeneros = generos.length > 0 ? generos.map(() => "?").join(",") : "";
    const placeholdersIdiomas = idiomas.length > 0 ? idiomas.map(() => "?").join(",") : "";
    const placeholdersArtistas = artistas.length > 0 ? artistas.map(() => "?").join(",") : "";

    // Ejecutar la consulta SQL con los placeholders dinámicos solo si hay valores disponibles
    let suggestedSongs = [];
    if (generos.length > 0 || idiomas.length > 0 || artistas.length > 0) {
        suggestedSongs = await client.execute(
            `SELECT DISTINCT c.id_cm, a.nombre_artista 
         FROM Contenido_multimedia c
         LEFT JOIN Generos g ON c.id_cm = g.id_cancion
         LEFT JOIN Idiomas_multimedia i ON c.id_cm = i.id_cm
         LEFT JOIN Artista_principal a ON c.id_cm = a.id_cancion
         JOIN Cancion ON c.id_cm = Cancion.id_cancion
         WHERE (${generos.length > 0 ? `g.genero IN (${placeholdersGeneros})` : '1=1'})
            OR (${idiomas.length > 0 ? `i.idioma IN (${placeholdersIdiomas})` : '1=1'})
            OR (${artistas.length > 0 ? `a.nombre_artista IN (${placeholdersArtistas})` : '1=1'})
         LIMIT 50`,
            [...generos, ...idiomas, ...artistas]
        );
    }

    let suggestedSongIds = suggestedSongs.rows.map((row) => row.id_cm);
    const suggestedSongsWithWeights = suggestedSongIds.map((id) => {
        let weight = 1; // Peso por defecto

        // Aumentar el peso si la canción está en favoritos
        if (favoriteSongIds.includes(id)) {
            weight += 2; // Puedes ajustar este valor según el peso deseado
        }

        // Aumentar el peso si la canción es del mismo artista
        const song = suggestedSongs.rows.find((song) => song.id_cm === id);
        if (song && artistas.includes(song.nombre_artista)) {
            weight += 1; // Puedes ajustar este valor según el peso deseado
        }

        return { id, weight };
    });

    // Filtrar canciones que ya están en la cola o que son favoritas
    const filteredSongs = suggestedSongsWithWeights.filter(
        (song) => !queueIds.includes(song.id) && !favoriteSongIds.includes(song.id)
    );

    // Ordenar las canciones por su peso (de mayor a menor)
    filteredSongs.sort((a, b) => b.weight - a.weight);

    // Devolver 10 canciones con mayor peso
    const topSuggestedSongs = filteredSongs.slice(0, 10).map((song) => song.id);

    return topSuggestedSongs;
};

const suggestPodcasts = async (nombre_usuario) => {
    // Obtener todos los id_ep de la cola del usuario
    const userQueue = await client.execute(
        `SELECT id_cm FROM Cola_Reproduccion WHERE propietario = ?`,
        [nombre_usuario]
    );

    const queueIds = userQueue.rows.map((row) => row.id_cm);

    // Obtener los podcasts favoritos del usuario
    const favoritePlaylist = await client.execute(
        `SELECT l.id_lista FROM Lista_reproduccion l
         JOIN Listas_del_usuario lu ON l.id_lista = lu.id_lista
         WHERE l.nombre = 'Tus episodios favoritos' AND lu.nombre_usuario = ?`,
        [nombre_usuario]
    );

    let favoritePodcastIds = [];
    if (favoritePlaylist.rows.length > 0) {
        const favoritePlaylistId = favoritePlaylist.rows[0].id_lista;
        const favoriteEpisodes = await client.execute(
            `SELECT id_cancion FROM Canciones_en_playlist WHERE id_playlist = ?`,
            [favoritePlaylistId]
        );
        favoritePodcastIds = favoriteEpisodes.rows.map((row) => row.id_cancion);
    }

    // Obtener detalles de los episodios en la cola
    const placeholders = queueIds.map(() => "?").join(",");
    const episodeDetails = await client.execute(
        `SELECT e.id_podcast, t.tematica, tp.nombre_podcaster
         FROM Episodio e
         JOIN Tematica_podcast t ON e.id_podcast = t.id_podcast
         JOIN Tiene_podcast tp ON e.id_podcast = tp.id_podcast
         WHERE e.id_ep IN (${placeholders})`,
        queueIds
    );

    console.log("Ep:");

    console.log(episodeDetails);

    // Extraer temáticas, podcasters y podcasts
    const tematicas = episodeDetails.rows.map((row) => row.tematica).filter(Boolean);
    const podcasters = episodeDetails.rows.map((row) => row.nombre_podcaster).filter(Boolean);
    const podcasts = episodeDetails.rows.map((row) => row.id_podcast).filter(Boolean);

    if (tematicas.length === 0 && podcasters.length === 0 && podcasts.length === 0) {
        console.log("No hay datos suficientes para realizar sugerencias de episodios.");
        return [];
    }

    // Crear placeholders dinámicos
    const placeholdersTematicas = tematicas.map(() => "?").join(",");
    const placeholdersPodcasters = podcasters.map(() => "?").join(",");
    const placeholdersPodcasts = podcasts.map(() => "?").join(",");

    // Buscar episodios de podcast similares o del mismo podcast, incluyendo el más reciente reproducido
    let suggestedEpisodes = await client.execute(
        `SELECT DISTINCT e.id_ep 
         FROM Episodio e
         JOIN Tematica_podcast t ON e.id_podcast = t.id_podcast
         JOIN Tiene_podcast tp ON e.id_podcast = tp.id_podcast
         WHERE t.tematica IN (${placeholdersTematicas}) 
            OR tp.nombre_podcaster IN (${placeholdersPodcasters})
            OR e.id_podcast IN (${placeholdersPodcasts})
            OR e.id_podcast = (SELECT ep.id_podcast FROM Episodio ep WHERE ep.id_ep IN (${placeholdersPodcasts}) )
         LIMIT 50`,
        [...tematicas, ...podcasters, ...podcasts, ...podcasts]
    );

    console.log("Episodios:");
    console.log(suggestedEpisodes);

    let suggestedEpisodeIds = suggestedEpisodes.rows.map((row) => row.id_ep);

    // Filtrar episodios que ya están en la cola o que son favoritos
    suggestedEpisodeIds = suggestedEpisodeIds.filter(
        (id) => !queueIds.includes(id) && !favoritePodcastIds.includes(id)
    );

    // Devolver 10 episodios aleatorios
    suggestedEpisodeIds = suggestedEpisodeIds.sort(() => 0.5 - Math.random()).slice(0, 10);
    return suggestedEpisodeIds;
};

module.exports = { suggestSongs, suggestPodcasts };
