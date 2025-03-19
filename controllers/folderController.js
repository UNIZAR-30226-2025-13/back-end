const client = require('../db');

const getFolder = async (req, res) => {
    try {
        const { id_carpeta } = req.query; // obtener el id de la carpeta
        
        // obtener información de la carpeta
        const result_folder = await client.execute("SELECT nombre FROM Carpeta WHERE id_carpeta = ?", [id_carpeta]);
        if (result_folder.rows.length === 0) {
            return res.status(400).json({ message: "La carpeta no existe" });
        }

        // obtener información de las listas de reproducción de la carpeta
        let list_listas = [];
        const result_listas = await client.execute(
            `SELECT lr.id_lista, lr.nombre, lr.color 
             FROM Listas_de_carpeta l
             JOIN Lista_reproduccion lr ON l.id_lista = lr.id_lista
             WHERE l.id_carpeta = ?`, [id_carpeta]);
        list_listas = result_listas.rows;

        res.status(200).json({ // devolver todo el perfil del podcaster
            nombre_carpeta: result_folder.rows[0].nombre,
            listas: list_listas
        });

    } catch (error) {
        console.error("Error al obtener la carpeta:", error);
        res.status(500).json({ message: "Hubo un error al obtener la carpeta" });
    }
};

// Crear una carpeta y asociarla a un usuario
const createFolder = async (req, res) => {
    try {
        const { nombre_carpeta, nombre_usuario } = req.body; // obtener el nombre de la carpeta a crear y el nombre del usuario al que asociarla
        
        if (!nombre_usuario || !nombre_carpeta) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario existe
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        const result_carpeta = await client.execute("INSERT INTO Carpeta (nombre) VALUES (?) RETURNING id_carpeta", [nombre_carpeta]);
        const id_carpeta = result_carpeta.rows[0].id_carpeta;
        await client.execute("INSERT INTO Carpetas_del_usuario (nombre_usuario, id_carpeta) VALUES (?, ?)", [nombre_usuario, id_carpeta]);
        res.status(201).json({ message: "Carpeta creada correctamente" });
    } catch (error) {
        console.error("Error al crear la carpeta:", error);
        res.status(500).json({ message: "Hubo un error al crear la carpeta" });
    }
};

module.exports = { getFolder, createFolder };
