const cloudinary = require("cloudinary").v2;
const client = require("../../db");
const fs = require("fs");

const updatePodcast = async (req, res) => {
    try {
        const imagenFile = req.files?.["imagen"]?.[0];
        const { id_podcast, nombre_podcast, descripcion, creadores, tematicas } = req.body;

        if (!id_podcast) {
            return res.status(400).json({ error: "Se requiere el id_podcast para actualizar" });
        }

        const updates = [];
        const params = [];

        if (nombre_podcast) {
            updates.push("nombre = ?");
            params.push(nombre_podcast);
        }

        if (descripcion) {
            updates.push("descripcion = ?");
            params.push(descripcion);
        }

        if (imagenFile) {
            const portadaResult = await cloudinary.uploader.upload(imagenFile.path, {
                resource_type: "image",
                folder: "podcast-cover",
            });

            fs.unlinkSync(imagenFile.path);

            updates.push("link_imagen = ?");
            params.push(portadaResult.secure_url);
        }

        if (updates.length > 0) {
            const query = `UPDATE Podcast SET ${updates.join(", ")} WHERE id_podcast = ?`;
            params.push(id_podcast);

            await client.execute(query, params);
        }

        if (creadores) {
            // Eliminar creadores actuales
            await client.execute("DELETE FROM Tiene_podcast WHERE id_podcast = ?", [id_podcast]);

            const creadoresList =
                typeof creadores === "string"
                    ? creadores.split(",").map((i) => i.trim())
                    : Array.isArray(creadores)
                    ? creadores
                    : [];

            for (const creador of creadoresList) {
                await client.execute(
                    "INSERT INTO Tiene_podcast (nombre_podcaster, id_podcast) VALUES (?, ?)",
                    [creador, id_podcast]
                );
            }
        }

        if (tematicas) {
            // Eliminar temáticas actuales
            await client.execute("DELETE FROM Tematica_podcast WHERE id_podcast = ?", [id_podcast]);

            const tematicasList =
                typeof tematicas === "string"
                    ? tematicas.split(",").map((i) => i.trim())
                    : Array.isArray(tematicas)
                    ? tematicas
                    : [];

            for (const tematica of tematicasList) {
                await client.execute(
                    "INSERT INTO Tematica_podcast (tematica, id_podcast) VALUES (?, ?)",
                    [tematica, id_podcast]
                );
            }
        }

        res.json({
            message: "Podcast actualizado con éxito",
        });
    } catch (error) {
        console.error("Error al actualizar el podcast:", error);
        res.status(500).json({
            error: "Error al actualizar el podcast en la base de datos o la portada en Cloudinary",
        });
    }
};

module.exports = { updatePodcast };
