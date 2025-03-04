const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
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
      
      // verificar si las listas ya existen
      const listaFavoritas = await client.execute("SELECT id_lista FROM Lista_reproduccion WHERE nombre = ?", ["Tus canciones favoritas"]);
      let id_lista_favoritas;
      if (listaFavoritas.rows.length > 0) {
          id_lista_favoritas = listaFavoritas.rows[0].id_lista;
      } else {
          await client.execute("INSERT INTO Lista_reproduccion (nombre, es_publica, color, link_compartir) VALUES (?, ?, ?, ?)", 
              ["Tus canciones favoritas", false, "#A200F4", null]);
          id_lista_favoritas = (await client.execute("SELECT last_insert_rowid() AS id")).rows[0].id;
      }

      const listaEpisodios = await client.execute("SELECT id_lista FROM Lista_reproduccion WHERE nombre = ?", ["Tus episodios favoritos"]);
      let id_lista_episodios;
      if (listaEpisodios.rows.length > 0) {
          id_lista_episodios = listaEpisodios.rows[0].id_lista;
      } else {
          await client.execute("INSERT INTO Lista_reproduccion (nombre, es_publica, color, link_compartir) VALUES (?, ?, ?, ?)", 
              ["Tus episodios favoritos", false, "#341146", null]);
          id_lista_episodios = (await client.execute("SELECT last_insert_rowid() AS id")).rows[0].id;
      }

      // insertar en Listas_del_usuario solo si no existe
      await client.execute(`INSERT OR IGNORE INTO Listas_del_usuario (nombre_usuario, id_lista) VALUES (?, ?), (?, ?)`, 
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
        const { correo } = req.query;

        console.log(correo);

        // Verificar si el correo existe
        const result = await client.execute("SELECT nombre_usuario FROM Usuario WHERE correo = ?", [correo]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "No existe una cuenta con este correo" });
        }

        const { nombre_usuario } = result.rows[0];

        // Generar token aleatorio
        const token = crypto.randomBytes(32).toString("hex");
        
        // Establecer tiempo de expiración (ej. 1 hora desde la generación)
        const fechaExp = new Date();
        fechaExp.setHours(fechaExp.getHours() + 2);
        const fechaExpISO = fechaExp.toISOString();

        console.log("fecha de exp: " + fechaExpISO);
        console.log("fecha de exp: " + fechaExpISO);


        // Guardar token en la base de datos
        // Insertar en la base de datos o actualizar si ya existe
        await client.execute(
          "INSERT INTO Token (nombre_usuario, token, fecha_exp) VALUES (?, ?, ?) ON CONFLICT (nombre_usuario) DO UPDATE SET token = ?, fecha_exp = ?", 
          [nombre_usuario, token, fechaExpISO, token, fechaExpISO]
        );

        // Enviar el token como respuesta
        res.status(200).json({ 
            message: "Solicitud de cambio de contraseña exitosa",
            token: token 
        });

    } catch (error) {
        console.error("Error al solicitar cambio de contraseña:", error);
        res.status(500).json({ message: "Error al solicitar el cambio de contraseña" });
    }
};

module.exports = { register, login, changePasswordRequest };
  