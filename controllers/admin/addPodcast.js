const cloudinary = require("cloudinary").v2;
const client = require("../../db");
const fs = require("fs");

const uploadPodcast = async (req, res) => {
    try {
        const imagenFile = req.files["imagen"]?.[0];
        const { nombre_podcast, creadores, tematicas, descripcion } = req.body;

        if (!imagenFile) {
            return res.status(400).json({ error: "No se envió el archivo con la portada" });
        }
        if (!nombre_podcast || !creadores || !tematicas || !descripcion) {
            return res.status(400).json({
                error: "Faltan parámetros básicos como nombre, creadores, temáticas o descripción",
            });
        }

        const portadaResult = await cloudinary.uploader.upload(imagenFile.path, {
            resource_type: "image",
            folder: "podcast-cover",
        });

        fs.unlinkSync(imagenFile.path);

        const result = await client.execute(
            "INSERT INTO Podcast (nombre, descripcion, link_imagen) VALUES (?, ?, ?) RETURNING id_podcast",
            [nombre_podcast, descripcion, portadaResult.secure_url]
        );

        const id_podcast = result.rows[0].id_podcast;

        console.log("ID PODCAST:", id_podcast);

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

        res.json({
            message: "Podcast creado con éxito",
        });
    } catch (error) {
        console.error("Error al crear el podcast:", error);
        res.status(500).json({
            error: "Error al subir la portada a Cloudinary o al insertarlo en la BD",
        });
    }
};

module.exports = { uploadPodcast };
