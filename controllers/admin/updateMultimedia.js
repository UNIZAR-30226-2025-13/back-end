const cloudinary = require("cloudinary").v2;
const client = require("../../db");
const mm = require("music-metadata");
const fs = require("fs");

function formatDuration(seconds) {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // Asegura formato 2 dígitos
    const pad = (n) => String(n).padStart(2, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

const updateMultimedia = async (req, res) => {
    try {
        const audioFile = req.files["audio"]?.[0];
        const imagenFile = req.files["imagen"]?.[0];
        const {
            titulo,
            creador,
            es_cancion,
            fecha_pub,
            letra,
            featurings = [],
            generos = [],
            id_podcast,
            descripcion,
            idiomas,
            id_album,
            id_cm,
        } = req.body;

        if (!id_cm) return res.status(400).json({ error: "Falta ID del contenido multimedia" });

        const isCancion = es_cancion === "true" || es_cancion === true;

        let updates = [];
        let params = [];

        // ===== ACTUALIZAR AUDIO =====
        if (audioFile) {
            const audioResult = await cloudinary.uploader.upload(audioFile.path, {
                resource_type: "video",
                folder: isCancion ? "canciones" : "episodios",
            });

            const metadata = await mm.parseFile(audioFile.path);
            const durationInSeconds = metadata.format.duration;
            const durationFormat = formatDuration(durationInSeconds);

            fs.unlinkSync(audioFile.path);

            updates.push("link_cm = ?", "duracion = ?");
            params.push(audioResult.secure_url, durationFormat);
        }

        // ===== ACTUALIZAR IMAGEN =====
        if (imagenFile) {
            const imagenResult = await cloudinary.uploader.upload(imagenFile.path, {
                resource_type: "image",
                folder: isCancion ? "covers" : "portadas episodios",
            });

            fs.unlinkSync(imagenFile.path);

            updates.push("link_imagen = ?");
            params.push(imagenResult.secure_url);
        }

        // ===== ACTUALIZAR CAMPOS BÁSICOS =====
        if (titulo) {
            updates.push("titulo = ?");
            params.push(titulo);
        }
        if (fecha_pub) {
            updates.push("fecha_pub = ?");
            params.push(fecha_pub);
        }

        // Si hay algo que actualizar en Contenido_multimedia
        if (updates.length > 0) {
            const updateQuery = `UPDATE Contenido_multimedia SET ${updates.join(
                ", "
            )} WHERE id_cm = ?`;
            await client.execute(updateQuery, [...params, id_cm]);
        }

        // ===== ACTUALIZAR IDIOMAS =====
        if (idiomas) {
            await client.execute("DELETE FROM Idiomas_multimedia WHERE id_cm = ?", [id_cm]);
            const idiomaList =
                typeof idiomas === "string" ? idiomas.split(",").map((i) => i.trim()) : idiomas;
            for (const idioma of idiomaList) {
                await client.execute(
                    "INSERT INTO Idiomas_multimedia (id_cm, idioma) VALUES (?, ?)",
                    [id_cm, idioma]
                );
            }
        }

        if (isCancion) {
            // ===== ACTUALIZAR CANCIÓN =====
            if (letra) {
                await client.execute("UPDATE Cancion SET letra = ? WHERE id_cancion = ?", [
                    letra,
                    id_cm,
                ]);
            }

            if (creador) {
                await client.execute("DELETE FROM Artista_principal WHERE id_cancion = ?", [id_cm]);
                await client.execute(
                    "INSERT INTO Artista_principal (nombre_artista, id_cancion) VALUES (?, ?)",
                    [creador, id_cm]
                );
            }

            if (featurings) {
                await client.execute("DELETE FROM Featuring WHERE id_cancion = ?", [id_cm]);
                const featuringsList =
                    typeof featurings === "string"
                        ? featurings.split(",").map((i) => i.trim())
                        : featurings;
                for (const feat of featuringsList) {
                    await client.execute(
                        "INSERT INTO Featuring (nombre_artista, id_cancion) VALUES (?, ?)",
                        [feat, id_cm]
                    );
                }
            }

            if (generos) {
                await client.execute("DELETE FROM Generos WHERE id_cancion = ?", [id_cm]);
                const generosList =
                    typeof generos === "string" ? generos.split(",").map((i) => i.trim()) : generos;
                for (const genero of generosList) {
                    await client.execute("INSERT INTO Generos (id_cancion, genero) VALUES (?, ?)", [
                        id_cm,
                        genero,
                    ]);
                }
            }

            if (id_album) {
                // Eliminar la canción de su álbum actual
                await client.execute(
                    "DELETE FROM Numero_cancion_en_album WHERE id_cancion = ? AND id_album = ?",
                    [id_cm, id_album]
                );
                console.log("id_album", id_album);
                await client.execute(
                    `INSERT INTO Numero_cancion_en_album (id_album, id_cancion, numero_cancion)
                     VALUES (?, ?, COALESCE(
                         (SELECT MAX(numero_cancion) + 1 FROM Numero_cancion_en_album WHERE id_album = ?), 1))`,
                    [id_album, id_cm, id_album]
                );
            }
        } else {
            // ===== ACTUALIZAR EPISODIO =====
            if (descripcion) {
                await client.execute("UPDATE Episodio SET descripcion = ? WHERE id_ep = ?", [
                    descripcion,
                    id_cm,
                ]);
            }

            if (id_podcast) {
                await client.execute("UPDATE Episodio SET id_podcast = ? WHERE id_ep = ?", [
                    id_podcast,
                    id_cm,
                ]);
            }
        }

        res.json({ message: "Contenido multimedia actualizado con éxito" });
    } catch (error) {
        console.error("Error actualizando multimedia:", error);
        res.status(500).json({
            error: "Error al actualizar el contenido multimedia",
        });
    }
};

module.exports = { updateMultimedia };
