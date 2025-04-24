const client = require("../db");
const bcrypt = require("bcrypt");
const { checkCreatorExists, checkUserExists, checkEmailExists } = require("./utils/exists");

const getProfile = async (req, res) => {
    try {
        const { nombre_usuario } = req.payload; // obtener nombre_usuario
        const result = await client.execute("SELECT * FROM Usuario WHERE nombre_usuario = ?", [
            nombre_usuario,
        ]); // obtener perfil

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        res.status(200).json(result.rows[0]); // devolver perfil
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ message: "Hubo un error al obtener el perfil" });
    }
};

// Cambiar Contraseña dado un usuario, su token de cambio de contraseña y su nueva contraseña se actualiza
// su contraseña antigüa por la nueva dada
const changePassword = async (req, res) => {
    try {
        const { nombre_usuario, token, nueva_contrasena } = req.body; // Campos

        if (!nombre_usuario || !token || !nueva_contrasena) {
            // Ningún campo vacío
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Verificar si el token existe en la base de datos
        const result_token = await client.execute(
            "SELECT token, fecha_exp FROM Token WHERE nombre_usuario = ?",
            [nombre_usuario]
        );

        if (result_token.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no tiene ningún token asociado" });
        }

        const storedToken = result_token.rows[0].token;
        const fechaExp = new Date(result_token.rows[0].fecha_exp);
        const fechaActual = new Date();

        // Comprobar que el token coincide
        if (storedToken !== token) {
            return res.status(400).json({ message: "El token suministrado no es válido" });
        }

        // Comprobar que no se ha caducado el token
        if (fechaExp < fechaActual) {
            return res.status(400).json({ message: "El token ha caducado" });
        }

        const salt = await bcrypt.genSalt(10); // Generamos salt para el hash
        const hashContrasena = await bcrypt.hash(nueva_contrasena, salt); // Generamos el hash de la nueva contraseña

        await client.execute("UPDATE Usuario SET contrasena = ? WHERE nombre_usuario = ?", [
            hashContrasena,
            nombre_usuario,
        ]); // Cambiar contraseña

        res.status(200).json({ message: "Contraseña cambiada correctamente" }); // Mensaje de éxito
    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ message: "Hubo un error al cambiar la contraseña" });
    }
};

// Cambiar la contraseña de un usuario dado su nombre de usuario y su nueva contraseña
const changeUserPassword = async (req, res) => {
    try {
        const { nombre_usuario, nueva_contrasena } = req.body;
        if (!nombre_usuario || !nueva_contrasena) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobamos que exista el usuario
        const result_usuario = await client.execute(
            "SELECT * FROM Usuario WHERE nombre_usuario = ?",
            [nombre_usuario]
        );
        if (result_usuario.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        const salt = await bcrypt.genSalt(10); // generamos salt para el hash
        const hashContrasena = await bcrypt.hash(nueva_contrasena, salt); // generamos el hash de la contraseña

        // insertar usuario
        await client.execute("UPDATE Usuario SET contrasena = ? WHERE nombre_usuario = ?", [
            hashContrasena,
            nombre_usuario,
        ]);
        res.status(200).json({ message: "Contraseña cambiada correctamente" });
    } catch (error) {
        console.error("Error al cambiar contraseña del usuario:", error);
        res.status(500).json({ message: "Hubo un error al cambiar la contraseña del usuario" });
    }
};

// Obtener las listas del usuario para mostrarlas en su biblioteca
const getLists = async (req, res) => {
    try {
        const { nombre_usuario } = req.query; // obtener nombre_usuario
        // Obtener listas y carpetas del usuario
        const listas = await client.execute(
            `SELECT lr.id_lista, lr.nombre 
             FROM Lista_reproduccion lr 
             JOIN Listas_del_usuario lu ON lr.id_lista = lu.id_lista
             WHERE lu.nombre_usuario = ?
             AND lr.id_lista NOT IN (SELECT lc.id_lista FROM Listas_de_carpeta lc);`,
            [nombre_usuario]
        );
        const carpetas = await client.execute(
            `SELECT c.id_carpeta, c.nombre 
             FROM Carpeta c 
             JOIN Carpetas_del_Usuario cu ON c.id_carpeta = cu.id_carpeta 
             WHERE nombre_usuario = ?;`,
            [nombre_usuario]
        );
        const artistas_favoritos = await client.execute(
            `SELECT a.nombre_artista, c.link_imagen 
             FROM Sigue_a_creador sc 
             JOIN Artista a ON sc.nombre_creador = a.nombre_artista
             JOIN Creador c ON a.nombre_artista = c.nombre_creador
             WHERE sc.nombre_usuario = ?;`,
            [nombre_usuario]
        );
        const podcasts_favoritos = await client.execute(
            `SELECT p.nombre_podcaster, c.link_imagen 
             FROM Sigue_a_creador sc 
             JOIN Podcaster p ON sc.nombre_creador = p.nombre_podcaster
             JOIN Creador c ON p.nombre_podcaster = c.nombre_creador
             WHERE sc.nombre_usuario = ?;`,
            [nombre_usuario]
        );
        res.status(200).json({
            listas: listas.rows.length ? listas.rows : "No hay listas",
            carpetas: carpetas.rows.length ? carpetas.rows : "No hay carpetas",
            artistas_favoritos: artistas_favoritos.rows.length
                ? artistas_favoritos.rows
                : "No hay artistas favoritos",
            podcasts_favoritos: podcasts_favoritos.rows.length
                ? podcasts_favoritos.rows
                : "No hay podcasts favoritos",
        });
    } catch (error) {
        console.error("Error al obtener listas:", error);
        res.status(500).json({ message: "Hubo un error al obtener las listas" });
    }
};

// Dado un nombre de usuario devuelve todas las playlists que tiene
const getPlaylists = async (req, res) => {
    try {
        const { nombre_usuario } = req.query; // obtener nombre_usuario

        // Obtener listas y carpetas del usuario
        const listasResult = await client.execute(
            `SELECT lr.id_lista, lr.nombre 
             FROM Lista_reproduccion lr 
             JOIN Listas_del_usuario lu ON lr.id_lista = lu.id_lista 
             JOIN Playlist p ON lr.id_lista = p.id_playlist
             WHERE lu.nombre_usuario = ?;`,
            [nombre_usuario]
        );
        const listas = listasResult.rows || []; // Acceder a 'rows'

        const listas_en_carpetasResult = await client.execute(
            `SELECT lr.id_lista, lr.nombre 
             FROM Lista_reproduccion lr 
             JOIN Listas_de_carpeta lc ON lr.id_lista = lc.id_lista
             JOIN Playlist p ON lr.id_lista = p.id_playlist 
             WHERE EXISTS (SELECT 1 FROM Carpetas_del_Usuario cu WHERE cu.id_carpeta = lc.id_carpeta AND cu.nombre_usuario = ?);`,
            [nombre_usuario]
        );
        const listas_en_carpetas = listas_en_carpetasResult.rows || []; // Acceder a 'rows'

        // Unir listas y listas_en_carpetas
        const todas_las_listas = [...listas, ...listas_en_carpetas];

        // Filtrar las listas específicas que no quieres incluir
        const listas_filtradas = todas_las_listas.filter(
            (lista) => lista.nombre !== "Tus canciones favoritas"
        );

        // Eliminar duplicados si es necesario, por ejemplo, si las listas tienen el mismo id_lista
        const listas_unicas = [
            ...new Map(listas_filtradas.map((item) => [item.id_lista, item])).values(),
        ];

        // Devolver el resultado combinado
        res.status(200).json(listas_unicas);
    } catch (error) {
        console.error("Error al obtener playlists:", error);
        res.status(500).json({ message: "Hubo un error al obtener las playlists" });
    }
};

// Dado un usuario, muestra todas las listas de episodios que tiene
const getEpisodeLists = async (req, res) => {
    try {
        const { nombre_usuario } = req.query; // obtener nombre_usuario

        const listasResult = await client.execute(
            `SELECT lr.id_lista, lr.nombre 
             FROM Lista_reproduccion lr 
             JOIN Listas_del_usuario lu ON lr.id_lista = lu.id_lista 
             JOIN Lista_Episodios le ON lr.id_lista = le.id_lista_ep
             WHERE lu.nombre_usuario = ?;`,
            [nombre_usuario]
        );
        const listas = listasResult.rows || [];

        const listas_en_carpetasResult = await client.execute(
            `SELECT lr.id_lista, lr.nombre 
             FROM Lista_reproduccion lr 
             JOIN Listas_de_carpeta lc ON lr.id_lista = lc.id_lista 
             JOIN Lista_Episodios le ON lr.id_lista = le.id_lista_ep
             WHERE EXISTS (SELECT 1 FROM Carpetas_del_Usuario cu WHERE cu.id_carpeta = lc.id_carpeta AND cu.nombre_usuario = ?);`,
            [nombre_usuario]
        );
        const listas_en_carpetas = listas_en_carpetasResult.rows || [];

        // Unir listas y listas_en_carpetas
        const todas_las_listas = [...listas, ...listas_en_carpetas];

        // Filtrar las listas específicas que no quieres incluir
        const listas_filtradas = todas_las_listas.filter(
            (lista) => lista.nombre !== "Tus episodios favoritos"
        );

        // Eliminar duplicados si es necesario, por ejemplo, si las listas tienen el mismo id_lista
        const listas_unicas = [
            ...new Map(listas_filtradas.map((item) => [item.id_lista, item])).values(),
        ];

        // Devolver el resultado combinado
        res.status(200).json(listas_unicas);
    } catch (error) {
        console.error("Error al obtener listas de episodios:", error);
        res.status(500).json({ message: "Hubo un error al obtener las listas de episodios" });
    }
};

// Dado un nombre, un usuario, un color y un tipo de lista("episodios o canciones") crea una lista asocidado a ese usuario
const createList = async (req, res) => {
    try {
        const { nombre_lista, nombre_usuario, color, tipo } = req.body;
        if (!nombre_lista || !nombre_usuario || !color) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobamos que exista el usuario
        const result_usuario = await client.execute(
            "SELECT * FROM Usuario WHERE nombre_usuario = ?",
            [nombre_usuario]
        );
        if (result_usuario.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // Realizamos el insert
        const result = await client.execute(
            "INSERT INTO Lista_reproduccion (nombre, color) VALUES (?, ?) RETURNING id_lista",
            [nombre_lista, color]
        );

        // Obtenemos el id de la lista
        const id_lista = result.rows[0].id_lista;

        // Asociamos la lista al usuario
        await client.execute(
            "INSERT INTO Listas_del_usuario (id_lista, nombre_usuario) VALUES (?, ?)",
            [id_lista, nombre_usuario]
        );

        // Según el tipo catalogamos la lista
        if (tipo == "canciones") {
            await client.execute("INSERT INTO Playlist (id_playlist) VALUES (?)", [id_lista]);
        } else if (tipo == "episodios") {
            await client.execute("INSERT INTO Lista_Episodios (id_lista_ep) VALUES (?)", [
                id_lista,
            ]);
        }

        res.status(200).json({ message: "Lista creada correctamente" });
    } catch (error) {
        console.error("Error al crear lista:", error);
        res.status(500).json({ message: "Hubo un error al crear la lista" });
    }
};

// Listar únicamente las listas de reproducción de un usuario que sean públicas
const getPublicLists = async (req, res) => {
    try {
        const { nombre_usuario } = req.query; // obtener nombre_usuario

        if (!nombre_usuario) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobamos que exista el usuario
        const result_usuario = await client.execute(
            "SELECT * FROM Usuario WHERE nombre_usuario = ?",
            [nombre_usuario]
        );
        if (result_usuario.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        const result = await client.execute(
            `SELECT lr.id_lista, lr.nombre, lr.color
             FROM Lista_reproduccion lr 
             JOIN Listas_del_usuario lu ON lr.id_lista = lu.id_lista
             WHERE lu.nombre_usuario = ? AND lr.es_publica = 1;`,
            [nombre_usuario]
        );

        res.status(200).json(result.rows); // devolver listas públicas
    } catch (error) {
        console.error("Error al obtener listas públicas:", error);
        res.status(500).json({ message: "Hubo un error al obtener las listas públicas" });
    }
};

// Cambiar la privacidad (público o privado) de una lista de reproducción
const changeListPrivacy = async (req, res) => {
    try {
        const { id_lista, nombre_usuario } = req.body;

        if (!id_lista || !nombre_usuario) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobamos que exista el usuario
        const result_usuario = await client.execute(
            "SELECT * FROM Usuario WHERE nombre_usuario = ?",
            [nombre_usuario]
        );
        if (result_usuario.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // comprobar si la lista existe y pertenece al usuario
        const result_list = await client.execute(
            "SELECT * FROM Listas_del_usuario WHERE id_lista = ? AND nombre_usuario = ?",
            [id_lista, nombre_usuario]
        );
        if (result_list.rows.length == 0) {
            return res
                .status(400)
                .json({ message: "La lista no existe o no pertenece al usuario" });
        }

        await client.execute(
            "UPDATE Lista_reproduccion SET es_publica = NOT es_publica WHERE id_lista = ?",
            [id_lista]
        );

        res.status(200).json({ message: "Privacidad de la lista actualizada correctamente" });
    } catch (error) {
        console.error("Error al cambiar privacidad de la lista:", error);
        res.status(500).json({ message: "Hubo un error al cambiar la privacidad de la lista" });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const { nombre_usuario, contrasena } = req.body;

        if (!nombre_usuario || !contrasena) {
            return res.status(400).json({ message: "Faltan parámetros en la solicitud" });
        }

        // Buscar usuario y verificar contraseña
        const userQuery = "SELECT contrasena FROM Usuario WHERE nombre_usuario = ?";
        const result = await client.execute(userQuery, [nombre_usuario]);

        if (!result || !result.rows || result.rows.length === 0) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const passwordMatch = await bcrypt.compare(contrasena, result.rows[0].contrasena);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // Obtener todas las listas del usuario
        const listasResult = await client.execute(
            "SELECT id_lista FROM Listas_del_usuario WHERE nombre_usuario = ?",
            [nombre_usuario]
        );
        const listas = listasResult.rows.map((row) => row.id_lista);

        // Eliminar todas las listas del usuario
        if (listas.length > 0) {
            const placeholders = listas.map(() => "?").join(",");
            await client.execute(
                `DELETE FROM Canciones_en_playlist WHERE id_playlist IN (${placeholders})`,
                listas
            );
            await client.execute(
                `DELETE FROM Episodios_de_lista WHERE id_lista_ep IN (${placeholders})`,
                listas
            );
            await client.execute(
                `DELETE FROM Listas_del_usuario WHERE id_lista IN (${placeholders})`,
                listas
            );
            await client.execute(
                `DELETE FROM Playlist WHERE id_playlist IN (${placeholders})`,
                listas
            );
            await client.execute(
                `DELETE FROM Lista_Episodios WHERE id_lista_ep IN (${placeholders})`,
                listas
            );
            await client.execute(
                `DELETE FROM Lista_reproduccion WHERE id_lista IN (${placeholders})`,
                listas
            );
        }

        // Obtener todas las carpetas del usuario
        const carpetasResult = await client.execute(
            "SELECT id_carpeta FROM Carpetas_del_Usuario WHERE nombre_usuario = ?",
            [nombre_usuario]
        );
        const carpetas = carpetasResult.rows.map((row) => row.id_carpeta);

        // Eliminar todas las carpetas del usuario
        if (carpetas.length > 0) {
            const placeholders = carpetas.map(() => "?").join(",");
            await client.execute(
                `DELETE FROM Listas_de_carpeta WHERE id_carpeta IN (${placeholders})`,
                carpetas
            );
            await client.execute(
                `DELETE FROM Carpetas_del_Usuario WHERE id_carpeta IN (${placeholders})`,
                carpetas
            );
            await client.execute(
                `DELETE FROM Carpeta WHERE id_carpeta IN (${placeholders})`,
                carpetas
            );
        }

        // Eliminar la cuenta del usuario
        await client.execute("DELETE FROM Usuario WHERE nombre_usuario = ?", [nombre_usuario]);

        res.status(200).json({ message: "Cuenta eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la cuenta:", error);
        res.status(500).json({ message: "Hubo un error al eliminar la cuenta" });
    }
};

const getFriendsList = async (req, res) => {
    try {
        const { nombre_usuario } = req.query;

        if (!nombre_usuario) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobamos que exista el usuario
        const result_usuario = await client.execute(
            "SELECT * FROM Usuario WHERE nombre_usuario = ?",
            [nombre_usuario]
        );
        if (result_usuario.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // Obtener la lista de amigos (usuarios que se siguen mutuamente)
        const result_amigos = await client.execute(
            `SELECT s1.nombre_usuario2 AS amigo
             FROM Sigue_a_usuario s1
             JOIN Sigue_a_usuario s2 ON s1.nombre_usuario2 = s2.nombre_usuario1
             WHERE s1.nombre_usuario1 = ? AND s2.nombre_usuario2 = ?`,
            [nombre_usuario, nombre_usuario]
        );

        const amigos = result_amigos.rows.map((row) => row.amigo);

        res.status(200).json({ amigos });
    } catch (error) {
        console.error("Error al mostrar la lista de amigos del usuario:", error);
        res.status(500).json({
            message: "Hubo un error al mostrar la lista de amigos del usuario",
        });
    }
};

const getNumberFollowersAndFollowing = async (req, res) => {
    try {
        const { nombre_usuario } = req.query;

        if (!nombre_usuario) {
            return res.status(400).json({ message: "Hay que rellenar todos los campos" });
        }

        // Comprobamos que exista el usuario
        const result_usuario = await client.execute(
            "SELECT * FROM Usuario WHERE nombre_usuario = ?",
            [nombre_usuario]
        );
        if (result_usuario.rows.length === 0) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // Obtener el número de seguidores y seguidos
        const result = await client.execute(
            `SELECT COUNT(*) AS num_seguidores
             FROM Sigue_a_usuario
             WHERE nombre_usuario2 = ?`,
            [nombre_usuario]
        );

        const num_seguidores = result.rows[0].num_seguidores;

        const result2 = await client.execute(
            `SELECT COUNT(*) AS num_seguidos
             FROM Sigue_a_usuario
             WHERE nombre_usuario1 = ?`,
            [nombre_usuario]
        );

        const num_seguidos = result2.rows[0].num_seguidos;

        res.status(200).json({ num_seguidores, num_seguidos });
    } catch (error) {
        console.error("Error al obtener el número de seguidores y seguidos:", error);
        res.status(500).json({
            message: "Hubo un error al obtener el número de seguidores y seguidos",
        });
    }
};

const updateEmailOrPassword = async (req, res) => {
    try {
        const { nombre_usuario, nuevo_email, nueva_contrasena } = req.body;

        if (!nombre_usuario) {
            return res.status(400).json({ message: "Se necesita un nombre de usuario" });
        }

        // Comprobamos que exista el usuario
        if (checkUserExists(nombre_usuario) === false) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        // Actualizar el email si se proporciona
        if (nuevo_email) {
            const emailExists = await checkEmailExists(nuevo_email);
            if (emailExists) {
                return res.status(400).json({ message: "El email ya está en uso" });
            }
            await client.execute("UPDATE Usuario SET correo = ? WHERE nombre_usuario = ?", [
                nuevo_email,
                nombre_usuario,
            ]);
        }

        if (nueva_contrasena) {
            const salt = await bcrypt.genSalt(10); // Generamos salt para el hash
            const hashContrasena = await bcrypt.hash(nueva_contrasena, salt); // Generamos el hash de la nueva contraseña

            await client.execute("UPDATE Usuario SET contrasena = ? WHERE nombre_usuario = ?", [
                hashContrasena,
                nombre_usuario,
            ]);
        }

        return res.status(200).json({ message: "Email y/o contraseña actualizados correctamente" });
    } catch (error) {
        console.error("Error al actualizar el email o la contraseña:", error);
        res.status(500).json({ message: "Hubo un error al actualizar el email o la contraseña" });
    }
};

module.exports = {
    getProfile,
    changePassword,
    changeUserPassword,
    getLists,
    createList,
    getPlaylists,
    getEpisodeLists,
    getPublicLists,
    changeListPrivacy,
    deleteAccount,
    getFriendsList,
    getNumberFollowersAndFollowing,
    updateEmailOrPassword,
};
