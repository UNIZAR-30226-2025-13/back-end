const client = require('../db');

// Función para calcular la valoración media de un contenido multimedia
const getRating = async (id_cm, nombre_usuario) => {
    // calcular la valoración media
    const result_rate = await client.execute("SELECT valoracion FROM Valoraciones WHERE id_cm = ? AND nombre_usuario = ?", [id_cm, nombre_usuario]);

    return result_rate.rows[0]?.valoracion ?? null;  // devuelve null si no hay valoracion del usuario del contenido multimedia
};

// Mostrar la valoración de un contenido multimedia hecha por un usuario
const getRate = async (req, res) => {
    try {
        const { id_cm, nombre_usuario } = req.query;

        if (!id_cm || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el contenido multimedia existe
        const result_cm_exists = await client.execute("SELECT * FROM Contenido_multimedia WHERE id_cm = ?", [id_cm]);
        if (result_cm_exists.rows.length == 0) {
            return res.status(400).json({ message: "El contenido multimedia no existe" });
        }

        // comprobar si el usuario existe
        const result_user_exists = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user_exists.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // mostrar la valoración de un contenido multimedia hecha por un usuario
        const valoracion = await getRating(id_cm, nombre_usuario);
        
        res.status(200).json({
            valoracion: valoracion
        });

    } catch (error) {
        console.error("Error al obtener la valoración:", error);
        res.status(500).json({ message: "Hubo un error al obtener la valoración" });
    }
};

// El usuario hace la valoración de un contenido multimedia
const postRate = async (req, res) => {
    try {
        const { id_cm, nombre_usuario, valoracion } = req.body;

        if (!id_cm || !nombre_usuario || !valoracion) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el contenido multimedia existe
        const result_cm_exists = await client.execute("SELECT * FROM Contenido_multimedia WHERE id_cm = ?", [id_cm]);
        if (result_cm_exists.rows.length == 0) {
            return res.status(400).json({ message: "El contenido multimedia no existe" });
        }

        // comprobar si el usuario existe
        const result_user_exists = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user_exists.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si el usuario ya ha valorado este contenido multimedia
        const result_rate_exists = await client.execute("SELECT * FROM Valoraciones WHERE id_cm = ? AND nombre_usuario = ?", [id_cm, nombre_usuario]);
        if (result_rate_exists.rows.length > 0) {
            return res.status(400).json({ message: "El usuario ya ha valorado este contenido multimedia" });
        }

        // insertar la valoración en la tabla Valora
        await client.execute("INSERT INTO Valoraciones (id_cm, nombre_usuario, valoracion) VALUES (?, ?, ?)", [id_cm, nombre_usuario, valoracion]);

        res.status(200).json({ message: "Valoración realizada correctamente" });

    } catch (error) {
        console.error("Error al realizar la valoración:", error);
        res.status(500).json({ message: "Hubo un error al realizar la valoración" });
    }
};

// Borrar la valoración de un contenido multimedia hecha por un usuario
const deleteRate = async (req, res) => {
    try {
        const { id_cm, nombre_usuario } = req.body;

        if (!id_cm || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el contenido multimedia existe
        const result_cm_exists = await client.execute("SELECT * FROM Contenido_multimedia WHERE id_cm = ?", [id_cm]);
        if (result_cm_exists.rows.length == 0) {
            return res.status(400).json({ message: "El contenido multimedia no existe" });
        }

        // comprobar si el usuario existe
        const result_user_exists = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user_exists.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si el usuario ha valorado este contenido multimedia
        const result_rate_exists = await client.execute("SELECT * FROM Valoraciones WHERE id_cm = ? AND nombre_usuario = ?", [id_cm, nombre_usuario]);
        if (result_rate_exists.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no ha valorado este contenido multimedia" });
        }

        // borrar la valoración en la tabla Valoraciones
        await client.execute("DELETE FROM Valoraciones WHERE id_cm = ? AND nombre_usuario = ?", [id_cm, nombre_usuario]);

        res.status(200).json({ message: "Valoración borrada correctamente" });

    } catch (error) {
        console.error("Error al borrar la valoración:", error);
        res.status(500).json({ message: "Hubo un error al borrar la valoración" });
    }
};

// Función para calcular la valoración media de un contenido multimedia
const getAverageRating = async (id_cm) => {
    // calcular la valoración media
    const result_val = await client.execute(`
        SELECT AVG(valoracion) AS media
        FROM Valoraciones
        WHERE id_cm = ?`, [id_cm]);
    return result_val.rows[0]?.media ?? null;  // devuelve null si no hay valoraciones del contenido multimedia
};

// Mostrar la valoración media de un contenido multimedia
const getAverageRate = async (req, res) => {
    try {
        const { id_cm } = req.query;

        if (!id_cm) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el contenido multimedia existe
        const result_cm_exists = await client.execute("SELECT * FROM Contenido_multimedia WHERE id_cm = ?", [id_cm]);
        if (result_cm_exists.rows.length == 0) {
            return res.status(400).json({ message: "El contenido multimedia no existe" });
        }

        // calcular la valoración media
        const valoracion_media = await getAverageRating(id_cm);
        
        res.status(200).json({
            valoracion_media: valoracion_media
        });

    } catch (error) {
        console.error("Error al obtener la valoración media:", error);
        res.status(500).json({ message: "Hubo un error al obtener la valoración media" });
    }
}

module.exports = { getRating, getRate, postRate, deleteRate, getAverageRating, getAverageRate };