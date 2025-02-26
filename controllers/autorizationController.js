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

        // Generar token
        const resetToken = jwt.sign({ nombre_usuario }, process.env.JWT_SECRET, { expiresIn: "15m" });

        // Guardar token en la base de datos
        await client.execute("INSERT INTO tokens_recuperacion (nombre_usuario, token, expiracion) VALUES (?, ?, NOW() + INTERVAL 15 MINUTE)", 
                            [nombre_usuario, resetToken]);

        // Enviar correo con el enlace
        const resetLink = `http://frontend.com/reset-password?token=${resetToken}`;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: correo,
            subject: "Recuperación de contraseña",
            html: `<p>Haz clic en el siguiente enlace para cambiar tu contraseña:</p>
                  <a href="${resetLink}">Cambiar contraseña</a>
                  <p>Este enlace expirará en 15 minutos.</p>`
        });

        res.status(200).json({ message: "Correo de recuperación enviado" });

    } catch (error) {
        console.error("Error al solicitar cambio de contraseña:", error);
        res.status(500).json({ message: "Error al solicitar el cambio de contraseña" });
    }
  };
  
  module.exports = { register, login, changePasswordRequest };
  