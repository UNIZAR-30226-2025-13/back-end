const express = require("express");
const client = require("./db");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
// ejemplo código Práctica 2
app.get("/", (req, res) => {
res.status(200).json({ message: "Hola Mundo!" });
});
*/

// ejemplo de Turso para obtener los productos de la base de datos
app.get("/products", async (req, res) => {
    try {
      //  SQL a bd Turso
      const result = await client.execute("SELECT * FROM ???"); // falta añadir tabla de la que hacer consulta
      // obtienes resultados consulta  
      res.status(200).json(result.filas);  // de momento se asume que los resultados se encuentran en 'filas'
    } catch (error) {
      console.error("Error al obtener resultados de la consulta:", error);
      res.status(500).json({ message: "Hubo un error al obtener los resultado" });
    }
  });

module.exports = app;
