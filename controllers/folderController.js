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

// Añadir una lista de reproducción a una carpeta
const addListToFolder = async (req, res) => {
    try {
        const { id_carpeta, id_lista, nombre_usuario } = req.body; // obtener el id de la carpeta y el id de la lista a añadir
        
        if (!id_carpeta || !id_lista || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario existe
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si la lista existe y pertenece al usuario
        const result_list = await client.execute("SELECT * FROM Listas_del_usuario WHERE id_lista = ? AND nombre_usuario = ?", [id_lista, nombre_usuario]);
        if (result_list.rows.length == 0) {
            return res.status(400).json({ message: "La lista no existe o no pertenece al usuario" });
        }

        // comprobar si la carpeta existe y pertenece al usuario
        const result_folder = await client.execute("SELECT * FROM Carpetas_del_usuario WHERE id_carpeta = ? AND nombre_usuario = ?", [id_carpeta, nombre_usuario]);
        if (result_folder.rows.length == 0) {
            return res.status(400).json({ message: "La carpeta no existe o no pertenece al usuario" });
        }

        // verificar que la lista no sea Tus canciones favoritas
        const es_favs_result = await client.execute("SELECT * FROM Lista_reproduccion WHERE id_lista = ? AND (nombre = 'Tus canciones favoritas' OR nombre = 'Tus episodios favoritos')", [id_lista]);
        if (es_favs_result.rows.length > 0) {
            return res.status(400).json({ message: "No se pueden añadir las listas Tus canciones favoritas o Tus episodios favoritos a una carpeta" });
        }

        // comprobar si la lista ya está en la carpeta
        const result3 = await client.execute("SELECT * FROM Listas_de_carpeta WHERE id_carpeta = ? AND id_lista = ?", [id_carpeta, id_lista]);
        if (result3.rows.length > 0) {
            return res.status(400).json({ message: "La lista ya está en la carpeta" });
        }

        await client.execute("INSERT INTO Listas_de_carpeta (id_carpeta, id_lista) VALUES (?, ?)", [id_carpeta, id_lista]);
        res.status(201).json({ message: "Lista añadida correctamente" });
    } catch (error) {
        console.error("Error al añadir la lista a la carpeta:", error);
        res.status(500).json({ message: "Hubo un error al añadir la lista a la carpeta" });
    }
};

// Listar todas las carpetas de un usuario
const listUserFolder = async (req, res) => {
    try {
        const { nombre_usuario } = req.query;

        if (!nombre_usuario) {
            return res.status(400).json({ message: "Se requiere el nombre de usuario" });
        }

        // comprobar si el usuario existe
        const result_usuario = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_usuario.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // obtener carpetas del usuario
        const result_carpetas = await client.execute(
            `SELECT c.id_carpeta, c.nombre 
             FROM Carpetas_del_usuario cu 
             JOIN Carpeta c ON cu.id_carpeta = c.id_carpeta 
             WHERE cu.nombre_usuario = ?`,
            [nombre_usuario]
        );

        let carpetas = result_carpetas.rows.map(carpeta => ({
            id_carpeta: carpeta.id_carpeta,
            nombre_carpeta: carpeta.nombre
        }));

        res.status(201).json({ carpetas });
    } catch (error) {
        console.error("Error al listar las carpetas:", error);
        res.status(500).json({ message: "Hubo un error al listar las carpetas" });
    }
};

// Eliminar una carpeta y desasociarla del usuario
const removeFolder = async (req, res) => {
    try {
        const { id_carpeta, nombre_usuario } = req.body; // obtener el nombre de la carpeta a eliminar y el nombre del usuario al que está asociada
        
        if (!nombre_usuario || !id_carpeta) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario existe
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si la carpeta existe y pertenece al usuario
        const folder_result = await client.execute("SELECT * FROM Carpetas_del_usuario WHERE nombre_usuario = ? AND id_carpeta = ?", [nombre_usuario, id_carpeta]);
        if (folder_result.rows.length == 0) {
            return res.status(400).json({ message: "La carpeta no existe o no pertenece al usuario" });
        }

        // eliminar la carpeta
        await client.execute("DELETE FROM Carpetas_del_usuario WHERE nombre_usuario = ? AND id_carpeta = ?", [nombre_usuario, id_carpeta]);
        await client.execute("DELETE FROM Carpeta WHERE id_carpeta = ?", [id_carpeta]);

        res.status(201).json({ message: "Carpeta eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la carpeta:", error);
        res.status(500).json({ message: "Hubo un error al eliminar la carpeta" });
    }
};

// Eliminar lista de reproducción de una carpeta
const removeListFromFolder = async (req, res) => {
    try {
        const { id_carpeta, id_lista, nombre_usuario } = req.body; // obtener el id de la carpeta, el id de la lista a eliminar y el usuario al que pertenecen
        
        if (!id_carpeta || !id_lista || !nombre_usuario) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario existe
        const result_user = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
        if (result_user.rows.length == 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si la lista existe y pertenece al usuario
        const result_list = await client.execute("SELECT * FROM Listas_del_usuario WHERE id_lista = ? AND nombre_usuario = ?", [id_lista, nombre_usuario]);
        if (result_list.rows.length == 0) {
            return res.status(400).json({ message: "La lista no existe o no pertenece al usuario" });
        }

        // comprobar si la carpeta existe y pertenece al usuario
        const result_folder = await client.execute("SELECT * FROM Carpetas_del_usuario WHERE id_carpeta = ? AND nombre_usuario = ?", [id_carpeta, nombre_usuario]);
        if (result_folder.rows.length == 0) {
            return res.status(400).json({ message: "La carpeta no existe o no pertenece al usuario" });
        }

        // comprobar si la lista ya está en la carpeta
        const result_list_in_folder = await client.execute("SELECT * FROM Listas_de_carpeta WHERE id_carpeta = ? AND id_lista = ?", [id_carpeta, id_lista]);
        if (result_list_in_folder.rows.length == 0) {
            return res.status(400).json({ message: "La lista no está en la carpeta" });
        }

        await client.execute("DELETE FROM Listas_de_carpeta WHERE id_carpeta = ? AND id_lista = ?", [id_carpeta, id_lista]);
        res.status(201).json({ message: "Lista eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la lista de la carpeta:", error);
        res.status(500).json({ message: "Hubo un error al eliminar la lista de la carpeta" });
    }
};

module.exports = { getFolder, createFolder, addListToFolder, listUserFolder, removeFolder, removeListFromFolder };
