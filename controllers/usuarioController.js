const client = require('../db');

const getPerfil = async (req, res) => {
    try {
        const { nombre_usuario } = req.payload; // obtener nombre_usuario
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]); // obtener perfil
        
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }
        
        res.status(200).json(result.rows[0]); // devolver perfil
    
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ message: "Hubo un error al obtener el perfil" });
    }
};

module.exports = { getPerfil };