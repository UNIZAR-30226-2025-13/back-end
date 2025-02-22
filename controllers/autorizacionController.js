const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const client = require('../db');


// registrar usuario
const register = async (req, res) => {
    try {
      const { nombre_usuario, contrasena, correo } = req.body; // campos
      
      if (!nombre_usuario || !contrasena || !correo) { // ningun campo vacio
        return res.status(400).json({ message: "Hay que rellener todos los campos" });
      }
  
      // comprobar si el usuario ya existe
      const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
      if (result.rows.length > 0) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }
  
      // comprobar si el correo ya existe
      const result2 = await client.execute("SELECT * FROM Usuario WHERE correo = ?", [correo]);
      if (result2.rows.length > 0) {
        return res.status(400).json({ message: "El correo ya existe" });
      }
  
      const salt = await bcrypt.genSalt(10); // generamos salt para el hash
      const hashContrasena = await bcrypt.hash(contrasena, salt); // generamos el hash de la contraseña
  
      // insertar usuario
      await client.execute("INSERT INTO Usuario (nombre_usuario, contrasena, correo, link_compartir, es_admin) VALUES (?, ?, ?, ?, ?)", [nombre_usuario, hashContrasena, correo , "", false]);
      // mensaje de correcto registro
      res.status(201).json({ message: "Usuario registrado correctamente" });
    
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      res.status(500).json({ message: "Hubo un error al registrar el usuario" });
    }
  };
  
  // login
  const login = async (req, res) => {
    try {
      const { nombre_usuario, contrasena } = req.body; // campos
  
      if (!nombre_usuario || !contrasena) { // ningun campo vacio
        return res.status(400).json({ message: "Hay que rellener todos los campos" });
      }
  
      // comprobar si el usuario existe
      const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);
      if (result.rows.length === 0) {
        return res.status(400).json({ message: "El usuario no existe" });
      }
  
      const usuario = result.rows[0]; // usuario encontrado
      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena); // comprobar si contraseña es la correcta
      if (!contrasenaValida) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }
  
      // generar token
      const token = jwt.sign({ nombre_usuario: usuario.nombre_usuario }, process.env.SECRET, { expiresIn: "1h" });
      res.status(200).json({ token });
  
    } catch (error) {
      console.error("Error al hacer login:", error);
      res.status(500).json({ message: "Hubo un error al hacer login" });
    }
  };
  
  module.exports = { register, login };
  