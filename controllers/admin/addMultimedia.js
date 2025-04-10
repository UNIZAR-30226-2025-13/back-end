const cloudinary = require("cloudinary").v2;
const client = require("../../db");
const mm = require("music-metadata");
const fs = require("fs");
const { format } = require("path");

function formatDuration(seconds) {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // Asegura formato 2 dígitos
    const pad = (n) => String(n).padStart(2, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

// CANCIONES = Audio, Imagen, Título, Creador, Fecha, Idiomas, Letra, Featurings, Generos Pertenece a Album
// EPISODIOS = Audio, [Imagen OPCIONAL], Título, Id_podcast, Fecha, Idiomas

const uploadFileToCloudinary = async (req, res) => {
    try {
        const audioFile = req.files["audio"]?.[0];
        const imagenFile = req.files["imagen"]?.[0];
        const {
            titulo,
            creador,
            es_cancion,
            fecha_pub, // AAAA-MM-DD
            letra,
            featurings = [],
            generos = [],
            id_podcast,
            descripcion,
            idiomas, // [] o string
            id_album,
        } = req.body;

        //  ===== VALIDACIONES =====
        // Validación común
        if (!req.files.audio)
            return res.status(400).json({ error: "No se envió archivo de audio" });
        if (!titulo || !fecha_pub) {
            return res
                .status(400)
                .json({ error: "Faltan campos obligatorios como título o fecha" });
        }

        const isCancion = es_cancion === "true" || es_cancion === true;

        // SI ES CANCIÓN
        if (isCancion) {
            if (!letra || !creador) {
                return res
                    .status(400)
                    .json({ error: "Para canciones se requiere letra y nombre del creador" });
            }
            if (!imagenFile && !id_album)
                return res.status(400).json({ error: "No se envió archivo de imagen" });
        }
        // SI ES EPISODIO
        else {
            if (!id_podcast || !descripcion) {
                return res
                    .status(400)
                    .json({ error: "Para episodios se requiere id_podcast y descripción" });
            }
        }

        // ===== SUBIDA DE ARCHIVOS =====

        // Carpetas según tipo
        let audio_folder = isCancion ? "canciones" : "episodios";
        let imagen_folder = isCancion ? "covers" : "portadas episodios";

        // SUBIR AUDIO
        const audioResult = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video",
            folder: audio_folder,
        });

        let imagenResult = null;
        // SI ES CANCIÓN O EL FICHERO NO ESTA VACÍO SE SUBE
        if ((isCancion || imagenFile) && !id_album) {
            imagenResult = await cloudinary.uploader.upload(imagenFile.path, {
                resource_type: "image",
                folder: imagen_folder,
            });
            fs.unlinkSync(imagenFile.path);
        }

        // ===== INSERTAR EN LA BASE DE DATOS =====

        // Metadatos del audio
        const metadata = await mm.parseFile(audioFile.path);
        const durationInSeconds = metadata.format.duration;
        const durationFormat = formatDuration(durationInSeconds);

        fs.unlinkSync(audioFile.path);

        // Obtener el link de la imagen a insertar
        let imagenLink = "";
        if (imagenResult === null && !isCancion) {
            // Es un episodio y se pilla la del podcast
            const result = await client.execute(
                "SELECT link_imagen FROM Podcast WHERE id_podcast = ?",
                [id_podcast]
            );
            imagenLink = result.rows[0].link_imagen;
        } else if (isCancion && id_album) {
            const result = await client.execute(
                "SELECT link_imagen FROM Album WHERE id_album = ?",
                [id_album]
            );
            imagenLink = result.rows[0].link_imagen;
        } else {
            // Es una canción con su vaina
            imagenLink = imagenResult.secure_url;
        }

        // Insert Contenido Multimedia
        const result = await client.execute(
            "INSERT INTO Contenido_multimedia (link_cm, titulo, duracion, link_imagen, fecha_pub) VALUES (?, ?, ?, ?, ?) RETURNING id_cm",
            [audioResult.secure_url, titulo, durationFormat, imagenLink, fecha_pub]
        );

        const id_cm = result.rows[0].id_cm;

        // Después de obtener id_cm tras insertar en Contenido_multimedia:
        const idiomaList =
            typeof idiomas === "string"
                ? idiomas.split(",").map((i) => i.trim())
                : Array.isArray(idiomas)
                ? idiomas
                : [];

        for (const idioma of idiomaList) {
            await client.execute("INSERT INTO Idiomas_multimedia (id_cm, idioma) VALUES (?, ?)", [
                id_cm,
                idioma,
            ]);
        }

        if (isCancion) {
            // Insertar canción
            await client.execute(
                "INSERT INTO Cancion (id_cancion, n_repros, letra) VALUES (?, 0, ?)",
                [id_cm, letra]
            );

            // Insertar artista principal
            await client.execute(
                "INSERT INTO Artista_principal (nombre_artista, id_cancion) VALUES (?, ?)",
                [creador, id_cm]
            );

            // Insertar feats
            const featuringsList =
                typeof featurings === "string"
                    ? featurings.split(",").map((i) => i.trim())
                    : Array.isArray(featurings)
                    ? featurings
                    : [];

            for (const feat of featuringsList) {
                await client.execute(
                    "INSERT INTO Featuring (nombre_artista, id_cancion) VALUES (?, ?)",
                    [feat, id_cm]
                );
            }

            // Insertar géneros si existen
            const generosList =
                typeof generos === "string"
                    ? generos.split(",").map((i) => i.trim())
                    : Array.isArray(generos)
                    ? generos
                    : [];

            for (const genero of generosList) {
                await client.execute("INSERT INTO Generos (id_cancion, genero) VALUES (?, ?)", [
                    id_cm,
                    genero,
                ]);
            }

            if (id_album) {
                await client.execute(
                    `INSERT INTO Numero_cancion_en_album (id_album, id_cancion, numero_cancion)
                     VALUES (?, ?, COALESCE(
                         (SELECT MAX(numero_cancion) + 1 FROM Numero_cancion_en_album WHERE id_album = ?), 1))`,
                    [id_album, id_cm, id_album]
                );
            }
        } else {
            // Insertar episodio
            await client.execute(
                "INSERT INTO Episodio (id_ep, id_podcast, descripcion) VALUES (?, ?, ?)",
                [id_cm, id_podcast, descripcion]
            );
        }
        // Respuesta exitosa
        res.json({
            message: "Multimedia creado con éxito",
        });
    } catch (error) {
        console.error("Error creando multimedia:", error);
        res.status(500).json({
            error: "Error al subir los archivos a Cloudinary o al insertar en la base de datos",
        });
    }
};

module.exports = { uploadFileToCloudinary };
