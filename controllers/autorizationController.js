const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const client = require("../db");
const nodemailer = require("nodemailer"); // Funcionalidad del correo electrónico
require("dotenv").config(); // para acceder a las variables de entorno

// Configurar transporte de correo GMAIL
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
    },
});

// registrar usuario
const register = async (req, res) => {
    try {
        const { nombre_usuario, contrasena, correo } = req.body; // campos

        if (!nombre_usuario || !contrasena || !correo) {
            // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario ya existe
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [
            nombre_usuario,
        ]);
        if (result.rows.length > 0) {
            return res
                .status(400)
                .json({ message: "El nombre de usuario introducido ya está en uso" });
        }

        // comprobar si el correo ya existe
        const result2 = await client.execute("SELECT * FROM Usuario WHERE correo = ?", [correo]);
        if (result2.rows.length > 0) {
            return res.status(400).json({ message: "El correo introducido ya está en uso" });
        }

        const salt = await bcrypt.genSalt(10); // generamos salt para el hash
        const hashContrasena = await bcrypt.hash(contrasena, salt); // generamos el hash de la contraseña

        // insertar usuario
        await client.execute(
            "INSERT INTO Usuario (nombre_usuario, contrasena, correo, link_compartir, es_admin) VALUES (?, ?, ?, ?, ?)",
            [nombre_usuario, hashContrasena, correo, "", false]
        );

        // crear lista de canciones favoritas y guardar su id
        const id_lista_canciones_fav_result = await client.execute(
            "INSERT INTO Lista_reproduccion (nombre, es_publica, color, link_compartir) VALUES (?, ?, ?, ?) RETURNING id_lista",
            ["Tus canciones favoritas", false, "#A200F4", null]
        );
        const id_canciones_favoritas = id_lista_canciones_fav_result.rows[0].id_lista;

        // crear lista de episodios favoritos y guardar su id
        const id_lista_episodios_fav_result = await client.execute(
            "INSERT INTO Lista_reproduccion (nombre, es_publica, color, link_compartir) VALUES (?, ?, ?, ?) RETURNING id_lista",
            ["Tus episodios favoritos", false, "#341146", null]
        );
        const id_episodios_favoritos = id_lista_episodios_fav_result.rows[0].id_lista;

        // asignarlas al usuario
        await client.execute(
            "INSERT INTO Listas_del_usuario (nombre_usuario, id_lista) VALUES (?, ?), (?, ?)",
            [nombre_usuario, id_canciones_favoritas, nombre_usuario, id_episodios_favoritos]
        );

        // insertar canciones_favoritas como playlist
        await client.execute("INSERT INTO Playlist (id_playlist) VALUES (?)", [
            id_canciones_favoritas,
        ]);

        // insertar episodios_favoritos como lista de episodios
        await client.execute("INSERT INTO Lista_Episodios (id_lista_ep) VALUES (?)", [
            id_episodios_favoritos,
        ]);

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

        if (!nombre_usuario || !contrasena) {
            // ningun campo vacio
            return res.status(400).json({ message: "Hay que rellener todos los campos" });
        }

        // comprobar si el usuario existe
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [
            nombre_usuario,
        ]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        const usuario = result.rows[0]; // usuario encontrado
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena); // comprobar si contraseña es la correcta
        if (!contrasenaValida) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // generar token (es válido solo durante 1h) -> cada vez que se haga login se generará un nuevo token
        const token = jwt.sign({ nombre_usuario: usuario.nombre_usuario }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(200).json({
            message: "Login exitoso",
            token,
            usuario: {
                nombre_usuario: usuario.nombre_usuario,
                correo: usuario.correo,
            },
            es_admin: usuario.es_admin,
        });
    } catch (error) {
        console.error("Error al hacer login:", error);
        res.status(500).json({ message: "Hubo un error al hacer login" });
    }
};

// Solicitar cambio de contraseña
const changePasswordRequest = async (req, res) => {
    try {
        console.log("Query params recibidos:", req.query); // Verifica si llega el parámetro
        const { correo } = req.query;

        if (!correo) {
            return res.status(400).json({ message: "Falta el parámetro 'correo'" });
        }

        console.log("Correo recibido:", correo);

        // Verificar si el correo existe
        const result = await client.execute("SELECT nombre_usuario FROM Usuario WHERE correo = ?", [
            correo,
        ]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "No existe una cuenta con este correo" });
        }

        const { nombre_usuario } = result.rows[0];

        // Generar token aleatorio
        const token = crypto.randomBytes(6).toString("hex");

        // Establecer tiempo de expiración (ej. 1 hora desde la generación)
        const fechaExp = new Date();
        fechaExp.setHours(fechaExp.getHours() + 2);
        const fechaExpISO = fechaExp.toISOString();

        // Guardar token en la base de datos
        // Insertar en la base de datos o actualizar si ya existe
        await client.execute(
            "INSERT INTO Token (nombre_usuario, token, fecha_exp) VALUES (?, ?, ?) ON CONFLICT (nombre_usuario) DO UPDATE SET token = ?, fecha_exp = ?",
            [nombre_usuario, token, fechaExpISO, token, fechaExpISO]
        );

        // Configurar el mensaje a enviar
        const mailConf = {
            from: process.env.MAIL_ADDRESS,
            to: correo,
            subject: "Solicitud de cambio de contraseña Spongefy",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
              <h2 style="color:rgb(0, 0, 0); text-align: center;">Spongefy - Restablecimiento de contraseña</h2>
              
              <p style="font-size: 16px; color: #333;">Hola <strong>${nombre_usuario}</strong>,</p>
              <p style="font-size: 16px; color: #333;">
                Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para completar el proceso:
              </p>

              <div style="text-align: center; padding: 15px; background-color: #fff3cd; border-radius: 8px; font-size: 18px; font-weight: bold; color: #856404; margin: 20px 0;">
                ${token}
              </div>

              <p style="font-size: 14px; color: #777;">⚠️ Este código expira en <strong>1 hora</strong>.</p>
              
              <p style="font-size: 14px; color: #777;">
                Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá segura.
              </p>

              <hr style="border: 0; height: 1px; background-color: #ddd; margin: 20px 0;">
              
              <p style="text-align: center; font-size: 12px; color: #aaa;">
                &copy; 2025 Spongefy. Todos los derechos reservados.
              </p>
            </div>
            `,
        };

        // Enviar correo electrónico con el token
        await transporter.sendMail(mailConf);

        // Enviar el token como respuesta
        res.status(200).json({
            message: "Solicitud de cambio de contraseña exitosa",
        });
    } catch (error) {
        console.error("Error al solicitar cambio de contraseña:", error);
        res.status(500).json({ message: "Error al solicitar el cambio de contraseña" });
    }
};

module.exports = { register, login, changePasswordRequest };
