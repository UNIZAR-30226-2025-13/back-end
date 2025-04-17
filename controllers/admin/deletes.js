const client = require("../../db");

const deleteAlbum = async (req, res) => {
    try {
        const { id_album } = req.body;

        if (!id_album) {
            return res.status(400).json({ error: "Se requiere el id_album para borrar" });
        }

        await client.execute("DELETE FROM Album WHERE id_album = ?", [id_album]);

        res.json({
            message: "Álbum borrado con éxito",
        });
    } catch (error) {
        console.error("Error al borrar el álbum:", error);
        res.status(500).json({
            error: "Error al borrar el álbum",
        });
    }
};

const deletePodcast = async (req, res) => {
    try {
        const { id_podcast } = req.body;

        if (!id_podcast) {
            return res.status(400).json({ error: "Se requiere el id_podcast para borrar" });
        }

        await client.execute("DELETE FROM Podcast WHERE id_podcast = ?", [id_podcast]);

        res.json({
            message: "Podcast borrado con éxito",
        });
    } catch (error) {
        console.error("Error al borrar el podcast:", error);
        res.status(500).json({
            error: "Error al borrar el podcast",
        });
    }
};

const deleteCreador = async (req, res) => {
    try {
        const { nombre_creador } = req.body;

        if (!nombre_creador) {
            return res.status(400).json({ error: "Se requiere el nombre del creador para borrar" });
        }

        await client.execute("DELETE FROM Creador WHERE nombre_creador = ?", [nombre_creador]);

        res.json({
            message: "Creador borrado con éxito",
        });
    } catch (error) {
        console.error("Error al borrar el creador:", error);
        res.status(500).json({
            error: "Error al borrar el creador",
        });
    }
};

const deleteMultimedia = async (req, res) => {
    try {
        const { id_cm } = req.body;

        if (!id_cm) {
            return res.status(400).json({ error: "Se requiere el id_cm para borrar" });
        }

        await client.execute("DELETE FROM Contenido_multimedia WHERE id_cm = ?", [id_cm]);

        res.json({
            message: "Contenido multimedia borrado con éxito",
        });
    } catch (error) {
        console.error("Error al borrar el contenido multimedia:", error);
        res.status(500).json({
            error: "Error al borrar el contenido multimedia",
        });
    }
};

module.exports = {
    deleteAlbum,
    deletePodcast,
    deleteCreador,
    deleteMultimedia,
};
