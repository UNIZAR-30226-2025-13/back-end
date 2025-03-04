const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Falta el token de autorización" });
        }

        console.log("Encabezado Authorization:", req.headers.authorization);

        const token = req.headers.authorization.split(" ")[1]; // obtener token
        const payload = jwt.verify(token, process.env.JWT_SECRET); // verificar token
        req.payload = payload;
        next();
    } catch (error) {
        console.error("Error al verificar token:", error);
        res.status(401).json({ message: "Token de sesión inválido o expirado" });
    }
};

module.exports = { verifyToken };