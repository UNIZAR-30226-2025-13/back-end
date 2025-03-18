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

module.exports = { getFolder };


/*
    hay que modificar mostrarPlaylists para que sea mostrar lista de reproducción
    me pasarán un id de la lista de reproducción y yo tendré que devolver las cosas
    en función de si es una playlist o una lista de episodios
*/