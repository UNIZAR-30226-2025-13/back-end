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
        return res.status(400).json({ message: "El nombre de usuario introducido ya está en uso" });
      }
  
      // comprobar si el correo ya existe
      const result2 = await client.execute("SELECT * FROM Usuario WHERE correo = ?", [correo]);
      if (result2.rows.length > 0) {
        return res.status(400).json({ message: "El correo introducido ya está en uso" });
      }
  
      const salt = await bcrypt.genSalt(10); // generamos salt para el hash
      const hashContrasena = await bcrypt.hash(contrasena, salt); // generamos el hash de la contraseña
  
      // insertar usuario
      await client.execute("INSERT INTO Usuario (nombre_usuario, contrasena, correo, link_compartir, es_admin) VALUES (?, ?, ?, ?, ?)", [nombre_usuario, hashContrasena, correo , "", false]);
      
      // se crean las listas por defecto -> canciones y episodios favoritos
      await client.execute("INSERT INTO Lista_reproduccion (nombre, es_publica, color, link_compartir) VALUES (?, ?, ?, ?)", 
          ["Tus canciones favoritas", false, "#A200F4", null]);
      const id_lista_favoritas = (await client.execute("SELECT last_insert_rowid() AS id")).rows[0].id;

      await client.execute("INSERT INTO Lista_reproduccion (nombre, es_publica, color, link_compartir) VALUES (?, ?, ?, ?)", 
          ["Tus episodios favoritos", false, "#341146", null]);
      const id_lista_episodios = (await client.execute("SELECT last_insert_rowid() AS id")).rows[0].id;

      // Asociar listas al usuario
      await client.execute("INSERT INTO Listas_del_usuario (nombre_usuario, id_lista) VALUES (?, ?), (?, ?)", 
          [nombre_usuario, id_lista_favoritas, nombre_usuario, id_lista_episodios]);
      
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
  
      // generar token (es válido solo durante 1h) -> cada vez que se haga login se generará un nuevo token
      const token = jwt.sign({ nombre_usuario: usuario.nombre_usuario }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.status(200).json({ 
        message: "Login exitoso",
        token,
        usuario: {
          nombre_usuario: usuario.nombre_usuario,
          correo: usuario.correo
        }
      });      
  
    } catch (error) {
      console.error("Error al hacer login:", error);
      res.status(500).json({ message: "Hubo un error al hacer login" });
    }
  };
  

  // Solicitar cambio de contraseña
  const changePasswordRequest = async (req, res) => {
    try {
        const { correo } = req.body;

        // Verificar si el correo existe
        const result = await client.execute("SELECT nombre_usuario FROM Usuario WHERE correo = ?", [correo]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "No existe una cuenta con este correo" });
        }

        const { nombre_usuario } = result.rows[0];

        // Generar token de recuperación con validez de 15 minutos
        const resetToken = jwt.sign({ nombre_usuario }, process.env.JWT_SECRET, { expiresIn: "15m" });

        // Guardar token en la base de datos
        // Intentar actualizar el token existente
        const updateResult = await client.execute(
          "UPDATE Token SET token = ? WHERE nombre_usuario = ?",
          [resetToken, nombre_usuario]
        );

        // Si no se actualizó ninguna fila, insertar un nuevo registro
        if (updateResult.rowsAffected === 0) {
          await client.execute(
              "INSERT INTO Token (nombre_usuario, token) VALUES (?, ?)",
              [nombre_usuario, resetToken]
          );
        }

        // Enviar el token como respuesta
        res.status(200).json({ 
            message: "Solicitud de cambio de contraseña exitosa",
            token: resetToken 
        });

    } catch (error) {
        console.error("Error al solicitar cambio de contraseña:", error);
        res.status(500).json({ message: "Error al solicitar el cambio de contraseña" });
    }
};

  
  module.exports = { register, login, changePasswordRequest };
  