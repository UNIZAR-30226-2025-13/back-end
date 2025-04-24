const client = require("../../db");

// Verifica si existe un usuario con nombre_usuario
const checkUserExists = async (username) => {
    try {
        if (!username) {
            throw new Error("Se requiere un nombre de usuario");
        }

        const user_result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [
            username,
        ]);

        return user_result.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar el usuario:", error);
        throw new Error("Hubo un error al verificar el usuario");
    }
};

// Verifica si existe un usuario con nombre_usuario
const checkEmailExists = async (email) => {
    try {
        if (!email) {
            throw new Error("Se requiere un nombre de correo");
        }

        const user_result = await client.execute("SELECT * FROM Usuario WHERE correo = ?", [email]);

        return user_result.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar el correo:", error);
        throw new Error("Hubo un error al verificar el correo");
    }
};

// Verifica si el contenido multimedia id_cm es una canción
const checkIsASong = (id_cm) => {
    return client
        .execute(`SELECT * FROM Cancion WHERE id_cancion = ?`, [id_cm])
        .then((result) => {
            if (!result || !result.rows) {
                // console.log("Consulta no devolvió resultados válidos.");
                return false;
            }
            // console.log("Número de filas:", result.rows.length);
            return result.rows.length > 0;
        })
        .catch((error) => {
            // console.error("Error al ejecutar la consulta:", error);
            return false;
        });
};

// Verifica si existe una carpeta con id_carpeta
const checkFolderExists = async (id_carpeta) => {
    try {
        if (!id_carpeta) {
            throw new Error("Se requiere un id_carpeta");
        }

        const result_folder = await client.execute("SELECT * FROM Carpeta WHERE id_carpeta = ?", [
            id_carpeta,
        ]);
        return result_folder.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar la carpeta:", error);
        throw new Error("Hubo un error al verificar la carpeta");
    }
};

// Verifica si existe una carpeta con id_carpeta y pertenece al usuario nombre_usuario
const checkFolderBelongsToUser = async (id_carpeta, nombre_usuario) => {
    try {
        if (!id_carpeta || !nombre_usuario) {
            throw new Error("Se requiere un id_carpeta y un nombre_usuario");
        }
        const result_folder = await client.execute(
            "SELECT * FROM Carpetas_del_usuario WHERE id_carpeta = ? AND nombre_usuario = ?",
            [id_carpeta, nombre_usuario]
        );
        return result_folder.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar que la carpeta pertenezca al usuario:", error);
        throw new Error("Hubo un error al verificar que la carpeta pertenezca al usuario");
    }
};

// Verifica si existe una lista con id_lista
const checkListExists = async (id_lista) => {
    try {
        if (!id_lista) {
            throw new Error("Se requiere un id_lista");
        }
        const result_list = await client.execute(
            "SELECT * FROM Lista_reproduccion WHERE id_lista = ?",
            [id_lista]
        );
        return result_list.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar la lista:", error);
        throw new Error("Hubo un error al verificar la lista");
    }
};

// Verifica si existe una lista con id_lista y pertenece al usuario nombre_usuario
const checkListBelongsToUser = async (id_lista, nombre_usuario) => {
    try {
        if (!id_lista || !nombre_usuario) {
            throw new Error("Se requiere un id_lista y un nombre_usuario");
        }
        const result_list = await client.execute(
            "SELECT * FROM Listas_del_usuario WHERE id_lista = ? AND nombre_usuario = ?",
            [id_lista, nombre_usuario]
        );
        return result_list.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar que la lista pertenezca al usuario:", error);
        throw new Error("Hubo un error al verificar que la lista pertenezca al usuario");
    }
};

// Verifica si existe una lista con id_lista y pertenece al carpeta id_carpeta
const checkListBelongsToFolder = async (id_lista, id_carpeta) => {
    try {
        if (!id_lista || !id_carpeta) {
            throw new Error("Se requiere un id_lista y un id_carpeta");
        }
        const result_list = await client.execute(
            "SELECT * FROM Listas_de_carpeta WHERE id_carpeta = ? AND id_lista = ?",
            [id_carpeta, id_lista]
        );
        return result_list.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar que la lista pertenezca a la carpeta:", error);
        throw new Error("Hubo un error al verificar que la lista pertenezca a la carpeta");
    }
};

// Verifica si existe una playlist con id_playlist
const checkPlaylistExists = async (id_playlist) => {
    try {
        if (!id_playlist) {
            throw new Error("Se requiere un id_playlist");
        }
        const result_playlist = await client.execute(
            "SELECT * FROM Playlist WHERE id_playlist = ?",
            [id_playlist]
        );
        return result_playlist.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar que la playlist existe:", error);
        throw new Error("Hubo un error al verificar que la playlist existe");
    }
};

// Verifica si existe el contenido multimedia con id_cm
const checkCMExists = async (id_cm) => {
    try {
        if (!id_cm) {
            throw new Error("Se requiere un id_cm");
        }
        const result_cm = await client.execute(
            "SELECT * FROM Contenido_multimedia WHERE id_cm = ?",
            [id_cm]
        );
        return result_cm.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar que el contenido multimedia existe:", error);
        throw new Error("Hubo un error al verificar que el contenido multimedia existe");
    }
};

const checkCreatorExists = async (nombre_creador) => {
    try {
        if (!nombre_creador) {
            throw new Error("Se requiere un nombre de creador");
        }
        const result_creator = await client.execute(
            "SELECT * FROM Creador WHERE nombre_creador = ?",
            [nombre_creador]
        );
        return result_creator.rows.length > 0;
    } catch (error) {
        console.error("Error al verificar que el creador existe:", error);
        throw new Error("Hubo un error al verificar que el creador existe");
    }
};

module.exports = { checkUserExists, checkIsASong, checkCreatorExists, checkEmailExists };
