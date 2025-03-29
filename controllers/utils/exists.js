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

const checkIsASong = async (id_cm) => {
    const result = await client.execute(`SELECT * FROM Cancion WHERE id_cancion == ?`, [id_cm]);
    return result.rows.length > 0;
};

module.exports = { checkUserExists, checkIsASong };
