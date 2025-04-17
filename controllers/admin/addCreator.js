const cloudinary = require("cloudinary").v2;
const client = require("../../db");
const fs = require("fs");
const { checkCreatorExists } = require("../utils/exists");

const uploadCreator = async (req, res) => {
    try {
        const imagenFile = req.files["imagen"]?.[0];
        const { nombre_creador, es_podcaster, biografia } = req.body;

        const isPodcaster = es_podcaster === "true" || es_podcaster === true;

        // ===== COMPROBACIONES =====
        if (!nombre_creador || !biografia || !imagenFile || !es_podcaster) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        // Comprobar si el creador ya existe
        if (checkCreatorExists(nombre_creador) === true) {
            return res.status(400).json({ error: "Ya existe un usuario con ese nombre" });
        }

        // ===== SUBIDA DE ARCHIVOS =====

        const imagenResult = await cloudinary.uploader.upload(imagenFile.path, {
            resource_type: "image",
            folder: "profile-images",
        });
        fs.unlinkSync(imagenFile.path);

        // ===== INSERTAR EN LA BASE DE DATOS =====

        // Insertar en la tabla de creadores
        const result = await client.execute(
            "INSERT INTO Creador (nombre_creador, link_imagen, biografia) VALUES (?, ?, ?)",
            [nombre_creador, imagenResult.secure_url, biografia]
        );

        if (isPodcaster) {
            // Insertar podcaster
            await client.execute("INSERT INTO Podcaster (nombre_podcaster) VALUES (?)", [
                nombre_creador,
            ]);
        } else {
            // Insertar artista
            await client.execute("INSERT INTO Artista (nombre_artista) VALUES (?)", [
                nombre_creador,
            ]);
        }
        // Respuesta exitosa
        res.json({
            message: "Creador creado con éxito",
        });
    } catch (error) {
        console.error("Error creando creador:", error);
        res.status(500).json({
            error: "Error al subir los archivos a Cloudinary o al insertar en la base de datos",
        });
    }
};

module.exports = { uploadCreator };
