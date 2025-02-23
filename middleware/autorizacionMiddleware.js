const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // obtener token
        const payload = jwt.verify(token, process.env.JWT_SECRET); // verificar token
        req.payload = payload;
        next();
    } catch (error) {
        console.error("Error al verificar token:", error);
        res.status(401).json({ message: "Token inválido o expirado" });
    }
};

module.exports = verificarToken;