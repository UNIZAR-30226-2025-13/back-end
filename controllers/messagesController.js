const client = require('../db');

// Función para enviar un mensaje de un usuario a otro
const sendMessage = async (req, res) => { 
    try { 
        const { nombre_usuario_envia, nombre_usuario_recibe, mensaje } = req.body;

        if (!nombre_usuario_envia || !nombre_usuario_recibe || !mensaje) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobamos que exista el usuario
        const result_usuario_envia = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario_envia]);
        if (result_usuario_envia.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // Comprobamos que exista el usuario
        const result_usuario_recibe = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario_recibe]);
        if (result_usuario_recibe.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        await client.execute("INSERT INTO Mensaje (nombre_usuario_envia, nombre_usuario_recibe, contenido, fecha) VALUES (?, ?, ?, ?)", [nombre_usuario_envia, nombre_usuario_recibe, mensaje, new Date().toISOString().slice(0, 19).replace('T', ' ')]);
        return res.status(200).json({ message: "Mensaje enviado" });

    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        res.status(500).json({ message: "Hubo un error al enviar el mensaje" });
    }
};

// Función para eliminar un mensaje de un usuario a otro
const deleteMessage = async (req, res) => {
    try {
        const { id_mensaje } = req.query;

        if (!id_mensaje) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobamos que exista el mensaje
        const result_mensaje = await client.execute("SELECT * FROM Mensaje WHERE id_mensaje = ?", [id_mensaje]);
        if (result_mensaje.rows.length === 0) {
            return res.status(400).json({ message: "El mensaje no existe" });
        }

        await client.execute("DELETE FROM Mensaje WHERE id_mensaje = ?", [id_mensaje]);
        return res.status(200).json({ message: "Mensaje eliminado" });
    } catch (error) {
        console.error("Error al borrar el mensaje:", error);
        res.status(500).json({ message: "Hubo un error al borrar el mensaje" });
    }    
};

// Función para obtener los mensajes entre dos usuarios
const getMessages = async (req, res) => {
    try {
        const { nombre_usuario_envia, nombre_usuario_recibe } = req.query;

        if (!nombre_usuario_envia || !nombre_usuario_recibe) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobamos que exista el usuario
        const result_usuario_envia = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario_envia]);
        if (result_usuario_envia.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // Comprobamos que exista el usuario
        const result_usuario_recibe = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario_recibe]);
        if (result_usuario_recibe.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        const result_mensajes = await client.execute(
            `SELECT * 
             FROM Mensaje 
             WHERE (nombre_usuario_envia = ? AND nombre_usuario_recibe = ?) OR (nombre_usuario_envia = ? AND nombre_usuario_recibe = ?)
             ORDER BY fecha DESC`, 
             [nombre_usuario_envia, nombre_usuario_recibe, nombre_usuario_recibe, nombre_usuario_envia]);
        
        return res.status(200).json(result_mensajes.rows);

    } catch (error) {
        console.error("Error al obtener los mensajes entre los usuarios:", error);
        res.status(500).json({ message: "Hubo un error al obtener los mensajes entre los usuarios" });
    }  
};

module.exports = { sendMessage, deleteMessage, getMessages };