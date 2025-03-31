const client = require("../../db");

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

const checkIsASong = (id_cm) => {
    return client.execute(`SELECT * FROM Cancion WHERE id_cancion = ?`, [id_cm])
        .then(result => {
            if (!result || !result.rows) {
                console.log("Consulta no devolvió resultados válidos.");
                return false;
            }
            console.log("Número de filas:", result.rows.length);
            return result.rows.length > 0;
        })
        .catch(error => {
            console.error("Error al ejecutar la consulta:", error);
            return false;
        });
};


module.exports = { checkUserExists, checkIsASong };
