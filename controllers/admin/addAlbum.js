const cloudinary = require("cloudinary").v2;
const client = require("../../db");
const fs = require("fs");
const { format } = require("path");

const uploadAlbum = async (req, res) => {
    try {
        const imagenFile = req.files["imagen"]?.[0];
        const {
            nombre_album,
            creadores,
            fecha_pub, // AAAA-MM-DD
        } = req.body;

        if (!imagenFile) {
            return res.status(400).json({ error: "No se envió el archivo con la portada" });
        }
        if (!nombre_album || !creadores || !fecha_pub) {
            return res.status(400).json({
                error: "Faltan parámetros básicos como nombre, creadores o fecha de publicación",
            });
        }

        const portadaResult = await cloudinary.uploader.upload(imagenFile.path, {
            resource_type: "image",
            folder: "albums",
        });

        fs.unlinkSync(imagenFile.path);

        const result = await client.execute(
            "INSERT INTO Album (nombre_album, fecha_pub, es_disco, link_imagen) VALUES (?, ?, ?, ?) RETURNING id_album",
            [nombre_album, fecha_pub, true, portadaResult.secure_url]
        );

        const id_album = result.rows[0].id_album;

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

        res.json({
            message: "Album creado con éxito",
        });
    } catch (error) {
        console.error("Error al crear el album:", error);
        res.status(500).json({
            error: "Error al subir la portada a Cloudinary o al insertarlo en la BD",
        });
    }
};

module.exports = { uploadAlbum };
