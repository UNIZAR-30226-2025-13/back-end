const client = require('../db');
const bcrypt = require('bcrypt');

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

//Cambiar Contraseña
const changePassword = async (req, res) => {
    try {
        const { nombre_usuario } = req.payload; // obtener nombre_usuario
        const { contrasena_actual, nueva_contrasena } = req.body; // campos
        
        if (!contrasena_actual || !nueva_contrasena) { // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }
        
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]); // obtener usuario
        
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }
        
        const usuario = result.rows[0]; // usuario encontrado
        const contrasenaValida = await bcrypt.compare(contrasena_actual, usuario.contrasena); // comprobar si contraseña es la correcta
        
        if (!contrasenaValida) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }
        
        const salt = await bcrypt.genSalt(10); // generamos salt para el hash
        const hashContrasena = await bcrypt.hash(nueva_contrasena, salt); // generamos el hash de la nueva contraseña
        
        await client.execute("UPDATE Usuario SET contrasena = ? WHERE nombre_usuario = ?", [hashContrasena, nombre_usuario]); // cambiar contraseña
        res.status(200).json({ message: "Contraseña cambiada correctamente" }); // mensaje de correcto cambio
    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ message: "Hubo un error al cambiar la contraseña" });
    }
};
module.exports = { getPerfil, changePassword };