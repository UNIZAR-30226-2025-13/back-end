const cloudinary = require("cloudinary").v2;
const client = require("../../db");
const fs = require("fs");

const updateCreator = async (req, res) => {
    try {
        const imagenFile = req.files?.["imagen"]?.[0];
        const { nombre_creador, biografia } = req.body;

        if (!nombre_creador) {
            return res.status(400).json({ error: "Se requiere el nombre_creador para actualizar" });
        }

        const updates = [];
        const params = [];

        if (biografia) {
            updates.push("biografia = ?");
            params.push(biografia);
        }

        if (imagenFile) {
            const imagenResult = await cloudinary.uploader.upload(imagenFile.path, {
                resource_type: "image",
                folder: "profile-images",
            });

            fs.unlinkSync(imagenFile.path);

            updates.push("link_imagen = ?");
            params.push(imagenResult.secure_url);
        }

        if (updates.length > 0) {
            const query = `UPDATE Creador SET ${updates.join(", ")} WHERE nombre_creador = ?`;
            params.push(nombre_creador);

            await client.execute(query, params);
        }

        res.json({
            message: "Creador actualizado con éxito",
        });
    } catch (error) {
        console.error("Error al actualizar creador:", error);
        res.status(500).json({
            error: "Error al actualizar el creador en la base de datos o la imagen en Cloudinary",
        });
    }
};

module.exports = { updateCreator };
