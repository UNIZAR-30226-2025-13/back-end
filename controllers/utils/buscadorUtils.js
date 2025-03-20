// Quitar tildes, puntuación, etc.
const quitarTildesYPuntuacion = (texto) => {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
};

// Función Levenshtein básica
const calcularLevenshtein = (a, b) => {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const costo = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + costo
            );
        }
    }
    return matrix[b.length][a.length];
};

function calcularSimilitud(cadena1, cadena2) {
    // Porcentaje de coincidencia
    const palabras1 = new Set(cadena1.split(/\s+/));
    const palabras2 = new Set(cadena2.split(/\s+/));
    const interseccion = [...palabras1].filter((p) => palabras2.has(p));
    const similitud = interseccion.length / Math.max(palabras1.size, 1);
    return similitud; // entre 0 y 1
}

// Comprobar si la subcadena aparece en alguna parte del título
const contieneSubcadena = (cadena, texto) => {
    return texto.includes(cadena); // Verifica si la cadena está contenida en el título
};

module.exports = {
    quitarTildesYPuntuacion,
    calcularLevenshtein,
    calcularSimilitud,
    contieneSubcadena,
};
