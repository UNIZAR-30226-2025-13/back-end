const request = require("supertest");
const app = require("../app");
// const client = require("../db");

describe("POST /add-song-playlist", () => {
  const id_playlist = 1;
  const id_cancion = 3;

  it("debería añadir una canción a la playlist exitosamente", async () => {
    const res = await request(app).post("/add-song-playlist").send({
      id_playlist,
      id_cancion,
    });

    expect([200, 400]).toContain(res.status); // Puede ser 400 si ya estaba
    if (res.status === 200) {
      expect(res.body.message).toBe("Canción añadida correctamente");
    } else {
      expect(res.body.message).toMatch(/ya pertenece a la playlist/);
    }
  });

  it("debería fallar si falta algún campo", async () => {
    const res = await request(app).post("/add-song-playlist").send({
      id_cancion,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Hay que rellenar todos los campos");
  });

  it("debería fallar si la playlist no existe", async () => {
    const res = await request(app).post("/add-song-playlist").send({
      id_playlist: 99999, // asegurate de que no exista
      id_cancion,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("La playlist no existe");
  });

  it("debería fallar si la canción no existe", async () => {
    const res = await request(app).post("/add-song-playlist").send({
      id_playlist,
      id_cancion: 99999, // asegurate de que no exista
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("La cancion no existe");
  });
});

describe("POST /add-ep-lista-episodios", () => {
  const id_lista_ep = 1;
  const id_episodio = 3;

  it("debería añadir un episodio a la lista exitosamente", async () => {
    const res = await request(app).post("/add-ep-lista-episodios").send({
      id_lista_ep,
      id_episodio,
    });

    expect([200, 400]).toContain(res.status); // Puede ser 400 si ya estaba
    if (res.status === 200) {
      expect(res.body.message).toBe("Episodio añadido correctamente");
    } else {
      expect(res.body.message).toMatch(/ya pertenece a la lista/);
    }
  });

  it("debería fallar si falta algún campo", async () => {
    const res = await request(app).post("/add-ep-lista-episodios").send({
      id_episodio,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Hay que rellenar todos los campos");
  });

  it("debería fallar si la lista de episodios no existe", async () => {
    const res = await request(app).post("/add-ep-lista-episodios").send({
      id_lista_ep: 99999, // asegurate de que no exista
      id_episodio,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("La Lista de Episodios no existe");
  });

  it("debería fallar si el episodio no existe", async () => {
    const res = await request(app).post("/add-ep-lista-episodios").send({
      id_lista_ep,
      id_episodio: 99999, // asegurate de que no exista
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("El episodio no existe");
  });
});
