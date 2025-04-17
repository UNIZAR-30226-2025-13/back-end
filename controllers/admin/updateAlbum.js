const cloudinary = require("cloudinary").v2;
const client = require("../../db");
const fs = require("fs");

const updateAlbum = async (req, res) => {
    try {
        const imagenFile = req.files?.["imagen"]?.[0];
        const { id_album, nombre_album, creadores, fecha_pub } = req.body;

        if (!id_album) {
            return res.status(400).json({ error: "Se requiere el id_album para actualizar" });
        }

        const updates = [];
        const params = [];

        if (nombre_album) {
            updates.push("nombre_album = ?");
            params.push(nombre_album);
        }

        if (fecha_pub) {
            updates.push("fecha_pub = ?");
            params.push(fecha_pub);
        }

        if (imagenFile) {
            const portadaResult = await cloudinary.uploader.upload(imagenFile.path, {
                resource_type: "image",
                folder: "albums",
            });

            fs.unlinkSync(imagenFile.path);

            updates.push("link_imagen = ?");
            params.push(portadaResult.secure_url);
        }

        if (updates.length > 0) {
            const query = `UPDATE Album SET ${updates.join(", ")} WHERE id_album = ?`;
            params.push(id_album);

            await client.execute(query, params);
        }

        if (creadores) {
            // Eliminar los creadores anteriores
            await client.execute("DELETE FROM Artista_posee_albumes WHERE id_album = ?", [
                id_album,
            ]);

            const creadoresList =
                typeof creadores === "string"
                    ? creadores.split(",").map((i) => i.trim())
                    : Array.isArray(creadores)
                    ? creadores
                    : [];

            for (const creador of creadoresList) {
                await client.execute(
                    "INSERT INTO Artista_posee_albumes (nombre_artista, id_album) VALUES (?, ?)",
                    [creador, id_album]
                );
            }
        }

        res.json({
            message: "Álbum actualizado con éxito",
        });
    } catch (error) {
        console.error("Error al actualizar el álbum:", error);
        res.status(500).json({
            error: "Error al actualizar el álbum en la base de datos o la portada en Cloudinary",
        });
    }
};

module.exports = { updateAlbum };
