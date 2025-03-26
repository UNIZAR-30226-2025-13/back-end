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

module.exports = { checkUserExists };
