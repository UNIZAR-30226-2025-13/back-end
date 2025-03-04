DROP TABLE IF EXISTS Listas_de_carpeta;
DROP TABLE IF EXISTS Carpetas_del_usuario;
DROP TABLE IF EXISTS Carpeta;
DROP TABLE IF EXISTS Listas_del_usuario;
DROP TABLE IF EXISTS Usuario_reproduce;
DROP TABLE IF EXISTS Mensaje;
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Sigue_a_usuario;
DROP TABLE IF EXISTS Sigue_a_creador;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Canciones_en_playlist;
DROP TABLE IF EXISTS Playlist;
DROP TABLE IF EXISTS Episodios_de_lista;
DROP TABLE IF EXISTS Lista_Episodios;
DROP TABLE IF EXISTS Lista_reproduccion;
DROP TABLE IF EXISTS Tiene_podcast;
DROP TABLE IF EXISTS Podcaster;
DROP TABLE IF EXISTS Tematica_podcast;
DROP TABLE IF EXISTS Podcast;
DROP TABLE IF EXISTS Episodio;
DROP TABLE IF EXISTS Featuring;
DROP TABLE IF EXISTS Artista_principal;
DROP TABLE IF EXISTS Generos;
DROP TABLE IF EXISTS Cancion;
DROP TABLE IF EXISTS Idiomas_multimedia;
DROP TABLE IF EXISTS Contenido_multimedia;
DROP TABLE IF EXISTS Numero_cancion_en_album;
DROP TABLE IF EXISTS Artista_posee_albumes;
DROP TABLE IF EXISTS Album;
DROP TABLE IF EXISTS Artista;
DROP TABLE IF EXISTS Creador;


CREATE TABLE Creador (
    nombre_creador      VARCHAR(255) PRIMARY KEY,
    biografia           TEXT,
    link_compartir      VARCHAR(500) NOT NULL,
    link_imagen         VARCHAR(500) NOT NULL
);

CREATE TABLE Artista (
    nombre_artista  VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (nombre_artista) REFERENCES Creador(nombre_creador) ON DELETE CASCADE
);

CREATE TABLE Album (
    id_album        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_album    VARCHAR(255) NOT NULL,
    link_imagen     VARCHAR(500),
    link_compartir  VARCHAR(500),
    es_disco        BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_pub       DATE NOT NULL
);

CREATE TABLE Artista_posee_albumes (
    nombre_artista  VARCHAR(255),
    id_album        INTEGER,
    PRIMARY KEY (nombre_artista, id_album),
    FOREIGN KEY (nombre_artista) REFERENCES Artista(nombre_artista) ON DELETE CASCADE,
    FOREIGN KEY (id_album) REFERENCES Album(id_album) ON DELETE CASCADE
);

CREATE TABLE Numero_cancion_en_album (
    id_album        INT,
    id_cancion      INT,
    numero_cancion  INT,
    PRIMARY KEY (id_album, id_cancion),
    FOREIGN KEY (id_album) REFERENCES Album(id_album) ON DELETE CASCADE,
    FOREIGN KEY (id_cancion) REFERENCES Cancion(id_cancion) ON DELETE CASCADE
);

CREATE TABLE Contenido_multimedia (
    id_cm           INTEGER PRIMARY KEY AUTOINCREMENT,
    link_cm         VARCHAR(255) NOT NULL,
    titulo          VARCHAR(255) NOT NULL,
    duracion        TIME NOT NULL,
    link_compartir  VARCHAR(255),
    link_imagen     VARCHAR(255),
    fecha_pub       DATE NOT NULL,
    valoracion      FLOAT CHECK (valoracion BETWEEN 1 AND 5)
);

CREATE TABLE Idiomas_multimedia (
    id_cm   INTEGER,
    idioma  VARCHAR(100),
    PRIMARY KEY (id_cm, idioma),
    FOREIGN KEY (id_cm) REFERENCES Contenido_multimedia(id_cm) ON DELETE CASCADE
);

CREATE TABLE Cancion (
    id_cancion  INT PRIMARY KEY, 
    n_repros    INT DEFAULT 0, 
    letra       TEXT, 
    FOREIGN KEY (id_cancion) REFERENCES Contenido_multimedia(id_cm) ON DELETE CASCADE
);

CREATE TABLE Generos (
    id_cancion   INT,
    genero       VARCHAR(100),
    PRIMARY KEY (id_cancion, genero),
    FOREIGN KEY (id_cancion) REFERENCES Cancion(id_cancion) ON DELETE CASCADE
);

CREATE TABLE Artista_principal (
    nombre_artista  VARCHAR(255),
    id_cancion      INT,
    PRIMARY KEY (nombre_artista, id_cancion),
    FOREIGN KEY (nombre_artista) REFERENCES Artista(nombre_artista) ON DELETE CASCADE,
    FOREIGN KEY (id_cancion) REFERENCES Cancion(id_cancion) ON DELETE CASCADE
);

CREATE TABLE Featuring (
    nombre_artista  VARCHAR(255),
    id_cancion      INT,
    PRIMARY KEY (nombre_artista, id_cancion),
    FOREIGN KEY (nombre_artista) REFERENCES Artista(nombre_artista) ON DELETE CASCADE,
    FOREIGN KEY (id_cancion) REFERENCES Cancion(id_cancion) ON DELETE CASCADE
);

CREATE TABLE Episodio (
    id_ep       INT, 
    id_podcast  INT, 
    descripcion TEXT,
    PRIMARY KEY (id_ep, id_podcast),
    FOREIGN KEY (id_ep) REFERENCES Contenido_multimedia(id_cm) ON DELETE CASCADE
    FOREIGN KEY (id_podcast) REFERENCES Podcast(id_podcast) ON DELETE CASCADE
);

CREATE TABLE Podcast (
    id_podcast      INT PRIMARY KEY,
    nombre          VARCHAR(255) NOT NULL,
    link_imagen     VARCHAR(500),
    link_compartir  VARCHAR(500),
    descripcion     TEXT
);

CREATE TABLE Tematica_podcast (
    id_podcast  INT,
    tematica    VARCHAR(255),
    PRIMARY KEY (id_podcast, tematica),
    FOREIGN KEY (id_podcast) REFERENCES Podcast(id_podcast) ON DELETE CASCADE
);

CREATE TABLE Podcaster (
    nombre_podcaster  VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (nombre_podcaster) REFERENCES Creador(nombre_creador) ON DELETE CASCADE
);

CREATE TABLE Tiene_podcast (
    nombre_podcaster  VARCHAR(255),
    id_podcast        INT,
    PRIMARY KEY (nombre_podcaster, id_podcast),
    FOREIGN KEY (nombre_podcaster) REFERENCES Podcaster(nombre_podcaster) ON DELETE CASCADE,
    FOREIGN KEY (id_podcast) REFERENCES Podcast(id_podcast) ON DELETE CASCADE
);

CREATE TABLE Lista_reproduccion (
    id_lista        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          VARCHAR(255) NOT NULL,
    es_publica      BOOLEAN NOT NULL DEFAULT FALSE,
    color           VARCHAR(255),
    link_compartir  VARCHAR(500)
);

CREATE TABLE Lista_Episodios (
    id_lista_ep    INT PRIMARY KEY,
    FOREIGN KEY (id_lista_ep) REFERENCES Lista_reproduccion(id_lista) ON DELETE CASCADE
);

CREATE TABLE Episodios_de_lista (
    id_lista_ep  INT,
    id_ep        INT,
    id_podcast   INT,
    PRIMARY KEY (id_lista_ep, id_ep, id_podcast),
    FOREIGN KEY (id_lista_ep) REFERENCES Lista_Episodios(id_lista_ep) ON DELETE CASCADE,
    FOREIGN KEY (id_ep, id_podcast) REFERENCES Episodio(id_ep, id_podcast) ON DELETE CASCADE
);

CREATE TABLE Playlist (
    id_playlist     INT PRIMARY KEY,
    FOREIGN KEY (id_playlist) REFERENCES Lista_reproduccion(id_lista) ON DELETE CASCADE
);

CREATE TABLE Canciones_en_playlist (
    id_playlist  INT,
    id_cancion   INT,
    PRIMARY KEY (id_playlist, id_cancion),
    FOREIGN KEY (id_playlist) REFERENCES Playlist(id_playlist) ON DELETE CASCADE,
    FOREIGN KEY (id_cancion) REFERENCES Cancion(id_cancion) ON DELETE CASCADE
);

CREATE TABLE Usuario (
    nombre_usuario  VARCHAR(255) PRIMARY KEY,
    contrasena      VARCHAR(255) NOT NULL,
    correo          VARCHAR(255) NOT NULL,
    link_compartir  VARCHAR(255),
    es_admin        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Sigue_a_creador (
    nombre_usuario  VARCHAR(255),
    nombre_creador  VARCHAR(255),
    PRIMARY KEY (nombre_usuario, nombre_creador),
    FOREIGN KEY (nombre_usuario) REFERENCES Usuario(nombre_usuario) ON DELETE CASCADE,
    FOREIGN KEY (nombre_creador) REFERENCES Creador(nombre_creador) ON DELETE CASCADE
);

CREATE TABLE Sigue_a_usuario (
    nombre_usuario1  VARCHAR(255),
    nombre_usuario2  VARCHAR(255),
    PRIMARY KEY (nombre_usuario1, nombre_usuario2),
    FOREIGN KEY (nombre_usuario1) REFERENCES Usuario(nombre_usuario) ON DELETE CASCADE,
    FOREIGN KEY (nombre_usuario2) REFERENCES Usuario(nombre_usuario) ON DELETE CASCADE
);

CREATE TABLE Token (
    nombre_usuario  VARCHAR(255) PRIMARY KEY,
    token           TEXT,
    fecha_exp       DATE,
    FOREIGN KEY (nombre_usuario) REFERENCES Usuario(nombre_usuario) ON DELETE CASCADE
);

CREATE TABLE Mensaje (
    id_mensaje            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_usuario_envia  VARCHAR(255),
    nombre_usuario_recibe VARCHAR(255),
    contenido             TEXT,
    fecha                 DATETIME,
    FOREIGN KEY (nombre_usuario_envia) REFERENCES Usuario(nombre_usuario) ON DELETE CASCADE,
    FOREIGN KEY (nombre_usuario_recibe) REFERENCES Usuario(nombre_usuario) ON DELETE CASCADE
);

CREATE TABLE Usuario_reproduce (
    nombre_usuario  VARCHAR(255),
    id_cm           INTEGER,
    tiempo          TIME,
    PRIMARY KEY (nombre_usuario, id_cm),
    FOREIGN KEY (nombre_usuario) REFERENCES Usuario(nombre_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_cm) REFERENCES Contenido_multimedia(id_cm) ON DELETE CASCADE
);

CREATE TABLE Listas_del_usuario (
    nombre_usuario  VARCHAR(255),
    id_lista        INT,
    PRIMARY KEY (nombre_usuario, id_lista),
    FOREIGN KEY (nombre_usuario) REFERENCES Usuario(nombre_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_lista) REFERENCES Lista_reproduccion(id_lista) ON DELETE CASCADE
);

CREATE TABLE Carpeta (
    id_carpeta      INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          VARCHAR(255)
);

CREATE TABLE Carpetas_del_usuario (
    nombre_usuario  VARCHAR(255),
    id_carpeta      INTEGER,
    PRIMARY KEY (nombre_usuario, id_carpeta),
    FOREIGN KEY (nombre_usuario) REFERENCES Usuario(nombre_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_carpeta) REFERENCES Carpeta(id_carpeta) ON DELETE CASCADE
);

CREATE TABLE Listas_de_carpeta (
    id_carpeta  INT,
    id_lista    INT,
    PRIMARY KEY (id_carpeta, id_lista),
    FOREIGN KEY (id_carpeta) REFERENCES Carpeta(id_carpeta) ON DELETE CASCADE,
    FOREIGN KEY (id_lista) REFERENCES Lista_reproduccion(id_lista) ON DELETE CASCADE
);

INSERT INTO Creador (nombre_creador, biografia, link_compartir, link_imagen) VALUES
('Carlos Peguer', 'Carlos Peguer es co-presentador del pódcast español "La Pija y la Quinqui", que ha ganado popularidad entre la generación Z y los millennials.', 'https://example.com/share/carlospeguer', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765428/carlos-peguer-img_ftskv0.jpg'),
('Mariang Maturana', 'Mariang Maturana es co-presentadora del pódcast "La Pija y la Quinqui", conocido por sus entrevistas a diversas personalidades.', 'https://example.com/share/mariangmaturana', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765428/mariang-img_plzhnd.jpg'),
('Jordi Wild', 'Jordi Wild es un creador de contenido español, conocido por su canal de YouTube "El Rincón de Giorgio" y su pódcast "The Wild Project".', 'https://example.com/share/jordiwild', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765428/jordi-wild-img_n8qkho.jpg'),
('Cruz Cafuné', 'Carlos Bruñas Zamorín, conocido artísticamente como Cruz Cafuné, es un rapero español originario de Tenerife, Canarias. Ha destacado en la escena musical por su estilo único y ha colaborado en éxitos como "Contando lunares".', 'https://example.com/share/cruzcafune', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765429/cruz-cafune-img_kykhvz.jpg'),
('Bad Bunny', 'Benito Antonio Martínez Ocasio, conocido como Bad Bunny, es un cantante y compositor puertorriqueño que ha revolucionado la música urbana con su estilo innovador y su fusión de géneros.', 'https://example.com/share/badbunny', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765429/bad-bunny-img_cfhbcm.jpg'),
('Lola Índigo', 'Miriam Doblas Muñoz, artísticamente conocida como Lola Índigo, es una cantante y bailarina española que ganó fama tras su participación en "Operación Triunfo" y ha lanzado éxitos en el género pop y urbano.', 'https://example.com/share/lolaindigo', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765429/lola-indigo-img_mvavhu.jpg'),
('Sosad.97', 'Sosad.97 es un artista emergente en la escena musical urbana, reconocido por su estilo distintivo y letras introspectivas.', 'https://example.com/share/sosad97', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765429/sosad97-img_ootlse.jpg'),
('Feid', 'Salomón Villada Hoyos, conocido como Feid, es un cantante y compositor colombiano destacado en el género reguetón y música urbana.', 'https://example.com/share/feid', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765429/feid-img_utb7jk.jpg'),
('Duki', 'Mauro Ezequiel Lombardo Quiroga, conocido artísticamente como Duki, es un rapero y cantante argentino que ha sido pionero en la escena del trap en su país.', 'https://example.com/share/duki', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765428/duki-img_vtvdwd.jpg'),
('Harry Styles', 'Harry Styles es un cantante y compositor británico conocido por su trabajo en la banda One Direction y su exitosa carrera en solitario.', 'https://example.com/share/harrystyles', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740766759/harry-styles-img_szp2fi.jpg'),
('Bigflo & Oli', 'Bigflo & Oli es un dúo de hermanos franceses, Florian y Olivio Ordonez, que han ganado reconocimiento en la escena del rap francés por sus letras auténticas y ritmos pegajosos.', 'https://example.com/share/bigflo-oli', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740765429/bigflow_oli-img_yzssrb.jpg'),
('Paulo Londra', 'Paulo Londra es un rapero y cantante argentino reconocido por su influencia en la escena del trap y reguetón en América Latina.', 'https://example.com/share/paulolondra', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740766759/paulo-londra-img_qxrkhz.jpg'),
('María Becerra', 'María Becerra es una cantante y compositora argentina que ha ganado popularidad por su versatilidad en géneros como el pop y el reguetón.', 'https://example.com/share/mariabecerra', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740766759/maria-becerra-img_dqi1db.jpg'),
('Emilia', 'Emilia Mernes, conocida artísticamente como Emilia, es una cantante argentina destacada en la música urbana y pop.', 'https://example.com/share/emilia', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740766758/emilia-img_kx5rfj.jpg'),
('Don Patricio', 'Patricio Martín Díaz, conocido como Don Patricio, es un rapero español que ha alcanzado éxito con su estilo fresco y letras pegajosas.', 'https://example.com/share/donpatricio', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740766758/don-patricio-img_om3dyt.jpg'),
('Quevedo', 'Pedro Luis Domínguez Quevedo, conocido artísticamente como Quevedo, es un cantante español que ha ganado reconocimiento en la escena urbana.', 'https://example.com/share/quevedo', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740766758/quevedo_j6dz7r.jpg'),
('Dei V', 'Dei V es un artista emergente en la escena musical urbana, conocido por su estilo distintivo y letras profundas.', 'https://example.com/share/deiv', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740766758/dei-v-img_ayzv9v.jpg'),
('Omar Courtz', 'Omar Courtz es un cantante y compositor español que ha destacado en la música urbana y reguetón.', 'https://example.com/share/omarcourtz', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740766758/omar-coutz-img_ayzv9v.jpg');

INSERT INTO Artista (nombre_artista) VALUES
('Cruz Cafuné'),
('Bad Bunny'),
('Lola Índigo'),
('Sosad.97'),
('Feid'),
('Duki'),
('Harry Styles'),
('Bigflo & Oli'),
('Paulo Londra'),
('María Becerra'),
('Emilia'),
('Don Patricio'),
('Quevedo'),
('Dei V'),
('Omar Courtz');

INSERT INTO Album (nombre_album, link_imagen, link_compartir, es_disco, fecha_pub) VALUES
('Me Muevo Con Dios', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768018/mmcd_itztvm.jpg', 'https://example.com/share/memuevocondios', TRUE, '2023-05-25'),
('DeBÍ TiRAR MáS FOToS', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768017/DTMF_pq1pgl.jpg', 'https://example.com/share/debitirarmasfotos', TRUE, '2025-01-05'),
('GRX', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768017/grx_pwycc5.jpg', 'https://example.com/share/grx', TRUE, '2024-02-01'),
('Nadie Sabe Lo Que Va A Pasar Mañana', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768017/nslqvapm_izn6zn.jpg', 'https://example.com/share/nadiesabeloquepasaramana', TRUE, '2023-10-13'),
('La Niña', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768015/lani%C3%B1a_eqerng.jpg', 'https://example.com/share/lanina', TRUE, '2021-07-02'),
('Un Verano Sin Ti', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768014/uvst_l2fas0.jpg', 'https://example.com/share/unveranosinti', TRUE, '2022-05-06'),
('El Último Tour Del Mundo', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768014/eutdm_as8cp5.jpg', 'https://example.com/share/elultimotourdelmundo', TRUE, '2020-11-27'),
('Feliz cumpleaños, Ferxxo, te pirateamos el álbum', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768014/felizcumpleferxxo_ep1nn3.jpg', 'https://example.com/share/feliz_cumpleanos_ferxxo', TRUE, '2022-09-14'),
('Desde el fin del mundo', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768013/defdm_hceqs8.jpg', 'https://example.com/share/desde_el_fin_del_mundo', TRUE, '2021-04-22'),
('Harry''s House', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768013/harryysuvarita_nrkjeq.jpg', 'https://example.com/share/harrys_house', TRUE, '2022-05-20');

INSERT INTO Artista_posee_albumes (nombre_artista, id_album) VALUES
('Cruz Cafuné', 1),
('Bad Bunny', 2),
('Lola Índigo', 3),
('Bad Bunny', 4),
('Lola Índigo', 5),
('Bad Bunny', 6),
('Bad Bunny', 7),
('Feid', 8),
('Duki', 9),
('Harry Styles', 10);

INSERT INTO Podcaster (nombre_podcaster) VALUES
('Carlos Peguer'),
('Mariang Maturana'),
('Jordi Wild');

INSERT INTO Contenido_multimedia (link_cm, titulo, duracion, link_compartir, link_imagen, fecha_pub, valoracion) VALUES
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740771781/minaelhammani_i6b7wb.mp3', 'Mina el Hammani', '00:00:39', 'https://example.com/shareminaelhammani/', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770021/mina_f6v0jk.jpg', '2019-11-13', 4.7),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773911/velda_ta5ap7.mp3', 'VeLDÁ', '00:00:33', 'https://example.com/share/velda', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768017/DTMF_pq1pgl.jpg', '2025-01-05', 4.9),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773924/sinrazon_bo3sm5.mp3', 'Sin Razón', '00:00:47', 'https://example.com/share/sinrazon', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770020/sinrazon_nkv3f2.jpg', '2022-10-10', 4.2),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740774205/rockstar_ducbqv.m4a', 'Rockstar', '00:01:00', 'https://example.com/share/rockstar', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770020/rockstar_gihqjy.jpg', '2019-11-22', 4.6),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773965/dommage_bc0vjy.mp3', 'Domino', '00:02:52', 'https://example.com/share/domino', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770020/domino_ychtga.jpg', '2021-05-14', 4.3),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740775397/pedololalolita_borutl.mp3', 'Episodio 1: Bienvenidos', '00:01:16', 'https://example.com/share/ep1', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770862/ep1_v4nuiq.jpg', '2024-01-15', 4.4),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740775464/perrosanchez_hk5amg.mp3', 'Episodio 2: Redes Sociales y Salud Mental', '00:01:17', 'https://example.com/share/ep2', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770863/perrosanchez_f0lg5e.jpg', '2024-02-20', 4.6),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740775464/jordiwild01_ywnwkb.mp3', 'Entrevista sobre Salud Mental', '00:01:11', 'https://example.com/share/ep1jordi', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770862/wild180_a1cf4i.jpg', '2024-02-22', 4.8),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740775457/jordiwild02_yzle4j.mp3', 'Éxito Personal a Través de la Disciplina', '00:01:00', 'https://example.com/share/ep2jordi', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740771000/wild121_piej6g.jpg', '2024-02-23', 4.6),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773796/whereshegoes_awabsi.mp3', 'WHERE SHE GOES', '00:00:27', 'https://example.com/share/where_she_goes', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770020/whereshegoes_urmtrz.jpg', '2023-05-18', 4.8),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773919/lareina_sp8vrs.mp3', 'La Reina', '00:02:07', 'https://example.com/share/lareina', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770020/lareina_n5ccrx.jpg', '2024-06-15', 4.7),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773972/titimepregunto_kizeex.mp3', 'Tití Me Preguntó', '00:03:19', 'https://example.com/share/titi_me_pregunto', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768014/uvst_l2fas0.jpg', '2022-05-06', 4.9),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773864/yovistoasi_lsg9ou.mp3', 'Yo Visto Así', '00:02:38', 'https://example.com/share/yo_visto_asi', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768014/eutdm_as8cp5.jpg', '2020-11-27', 4.6),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740775220/dtmf_l5yszg.mp3', 'DeBÍ TiRAR MáS FOToS', '00:00:19', 'https://example.com/share/debitiar', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768017/DTMF_pq1pgl.jpg', '2025-01-05', 4.9),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773857/pesadillas_rggf1z.mp3', 'Pesadillas', '00:02:22', 'https://example.com/share/pesadillas', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770019/pesadillas_lg3qnb.jpg', '2024-09-13', 4.5),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773741/normal_niurzh.mp3', 'Normal', '00:01:54', 'https://example.com/share/normal', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770019/norma_rhzn6l.jpg', '2022-09-14', 4.8),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773646/malbec_zpzjnv.mp3', 'Malbec', '00:00:38', 'https://example.com/share/malbec', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768013/defdm_hceqs8.jpg', '2021-04-22', 4.7),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773737/asitwas_p4fffn.mp3', 'As It Was', '00:02:08', 'https://example.com/share/as_it_was', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768013/harryysuvarita_nrkjeq.jpg', '2022-04-01', 4.9),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773619/ferxoo100_yr75um.mp3', 'Ferxxo 100', '00:00:37', 'https://example.com/share/ferxxo_100', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770020/ferxxo100_jkdul3.jpg', '2022-07-01', 4.6),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773709/goteo_ckg403.mp3', 'Goteo', '00:02:08', 'https://example.com/share/goteo', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770020/goteo_ztww4q.jpg', '2019-08-06', 4.5),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773590/wartermelon_s0o1ri.mp3', 'Watermelon Sugar', '00:00:23', 'https://example.com/share/watermelon_sugar', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770019/watermelonsugar_rhrf8w.jpg', '2019-11-16', 4.8),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773596/partyenelbarrio_seejoa.mp3', 'Party en el Barrio', '00:00:36', 'https://example.com/share/party_en_el_barrio', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770019/partyenelbarrio_ecfqxj.jpg', '2022-09-14', 4.7),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773729/lolabunny_vs5kdf.mp3', 'Lola Bunny', '00:02:16', 'https://example.com/share/lola_bunny', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770019/lolabunny_o38u22.jpg', '2019-07-31', 4.6),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773651/discoteka_blcs7c.mp3', 'Discoteka', '00:01:49', 'https://example.com/share/discoteka', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770019/diskoteca_gvaos3.jpg', '2022-09-01', 4.8),
('https://res.cloudinary.com/djsm3jfht/video/upload/v1740773580/eltonto_qoguwp.mp3', 'El Tonto', '00:00:44', 'https://example.com/share/el_tonto', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740770019/eltonto_toogt3.jpg', '2023-04-14', 4.9);

INSERT INTO Cancion (id_cancion, n_repros, letra) VALUES
(1, 1500000, 'Esta es la letra de "Mina el Hammani", un tema cargado de energía que resalta la espiritualidad en la música urbana.'),
(2, 200527865, 'En "VeLDÁ", Bad Bunny explora la vida y sus experiencias con su estilo único y pegajoso.'),
(3, 800000, 'Sosad.97 nos trae "Sin Razón", una canción de trap y emociones profundas, reflejando una vida sin sentido.'),
(4, 1100000, 'Duki destaca con "Rockstar", una pieza llena de rimas poderosas y una vibra irreverente, ideal para cualquier fiesta.'),
(5, 700000, 'Bigflo & Oli en "Domino" nos presentan un tema emotivo, con letras que tocan el corazón y un estilo distintivo.'),
(10, 250000000, 'Letra de "WHERE SHE GOES" de Bad Bunny.'),
(11, 180000000, 'Letra de "La Reina" de Lola Índigo.'),
(12, 300000000, 'Letra de "Tití Me Preguntó" de Bad Bunny.'),
(13, 220000000, 'Letra de "Yo Visto Así" de Bad Bunny.'),
(14, 50000000, 'Letra de "DeBÍ TiRAR MáS FOToS" de Bad Bunny.'),
(15, 75000000, 'Letra de "Pesadillas" de Lola Índigo.'),
(16, 300000000, 'Letra de "Normal" de Feid.'),
(17, 250000000, 'Letra de "Malbec" de Duki.'),
(18, 500000000, 'Letra de "As It Was" de Harry Styles.'),
(19, 150000000, 'Letra de "Ferxxo 100" de Feid.'),
(20, 200000000, 'Letra de "Goteo" de Duki.'),
(21, 450000000, 'Letra de "Watermelon Sugar" de Harry Styles.'),
(22, 150000000, 'Letra de "Party en el Barrio" de Paulo Londra y Duki.'),
(23, 120000000, 'Letra de "Lola Bunny" de Lola Índigo y Don Patricio.'),
(24, 180000000, 'Letra de "Discoteka" de Lola Índigo y María Becerra.'),
(25, 200000000, 'Letra de "El Tonto" de Lola Índigo y Quevedo.');

INSERT INTO Generos (id_cancion, genero) VALUES
(1, 'Rap'),
(2, 'Reguetón'),
(3, 'Trap'),
(4, 'Trap'),
(5, 'Rap'),
(10, 'Reguetón'),
(11, 'Reguetón'),
(12, 'Reguetón'),
(13, 'Reguetón'),
(14, 'Reguetón'),
(15, 'Reguetón'),
(16, 'Reguetón'),
(17, 'Trap'),
(18, 'Pop'),
(19, 'Reguetón'),
(20, 'Trap'),
(21, 'Pop'),
(22, 'Trap'),
(23, 'Reguetón'),
(24, 'Reguetón'),
(25, 'Reguetón');

INSERT INTO Numero_cancion_en_album (id_album, id_cancion, numero_cancion) VALUES
(4, 10, 5),  -- "WHERE SHE GOES" en "Nadie Sabe Lo Que Va A Pasar Mañana"
(6, 12, 7), -- "Tití Me Preguntó" en "Un Verano Sin Ti"
(7, 13, 1), -- "Yo Visto Así" en "El Último Tour Del Mundo"
(8, 16, 4),  -- "Normal" en "Feliz cumpleaños, Ferxxo, te pirateamos el álbum"
(9, 17, 10), -- "Malbec" en "Desde el fin del mundo"
(10, 18, 4);  -- "As It Was" en "Harry's House"

INSERT INTO Artista_principal (nombre_artista, id_cancion) VALUES
('Cruz Cafuné', 1),
('Bad Bunny', 2),
('Sosad.97', 3),
('Duki', 4),
('Bigflo & Oli', 5),
('Bad Bunny', 10),
('Lola Índigo', 11),
('Bad Bunny', 12),
('Bad Bunny', 13),
('Bad Bunny', 14),
('Lola Índigo', 15),
('Feid', 16),
('Duki', 17),
('Harry Styles', 18),
('Feid', 19),
('Duki', 20),
('Harry Styles', 21),
('Paulo Londra', 22),
('Lola Índigo', 23),
('Lola Índigo', 24),
('Lola Índigo', 25);

INSERT INTO Featuring (nombre_artista, id_cancion) VALUES
('Dei V', 2),
('Omar Courtz', 2),
('Duki', 22),
('Don Patricio', 23),
('María Becerra', 24),
('Quevedo', 25);

INSERT INTO Podcast (id_podcast, nombre, link_imagen, link_compartir, descripcion) VALUES
(1, 'La Pija y la Quinqui', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768719/lapijaylaquinqui_vrgwui.jpg', 'https://example.com/share/lapijaylaquinqui', 'Un podcast donde se exploran temas de actualidad y cultura con humor irreverente.'),
(2, 'The Wild Project', 'https://res.cloudinary.com/djsm3jfht/image/upload/v1740768719/thewildproject_ufwldg.jpg', 'https://example.com/share/thewildproject', 'Un podcast conducido por Jordi Wild en el que se tocan temas de crecimiento personal, entrevistas y entretenimiento.');

INSERT INTO Tematica_podcast (id_podcast, tematica) VALUES
(1, 'Cultura'),
(1, 'Comedia'),
(1, 'Sociedad'),
(2, 'Entrevistas'),
(2, 'Crecimiento Personal'),
(2, 'Entretenimiento');

INSERT INTO Tiene_podcast (nombre_podcaster, id_podcast) VALUES
('Carlos Peguer', 1),
('Mariang Maturana', 1),
('Jordi Wild', 2);

INSERT INTO Episodio (id_ep, id_podcast, descripcion) VALUES
(8, 1, 'En este episodio, hablamos de la última película de terror y analizamos las tendencias actuales de la moda.'),
(9, 1, 'Un episodio dedicado a nuestras vivencias en el mundo de las redes sociales y cómo afectan la salud mental.'),
(10, 2, 'Entrevista con un experto en psicología sobre la importancia de la salud mental en el mundo moderno.'),
(11, 2, 'En este episodio, discutimos cómo lograr el éxito personal a través de la disciplina y el trabajo constante.');

INSERT INTO Idiomas_multimedia (id_cm, idioma) VALUES
(1, 'Español'),   -- "Mina el Hammani" de Cruz Cafuné
(2, 'Español'),   -- "VeLDÁ" de Bad Bunny
(3, 'Español'),   -- "Sin Razón" de Sosad.97
(4, 'Español'),   -- "Rockstar" de Duki
(5, 'Francés'),   -- "Domino" de Bigflo & Oli
(6, 'Español'),   -- "Episodio 1: Bienvenidos" de La Pija y la Quinqui
(7, 'Español'),   -- "Episodio 2: Redes Sociales y Salud Mental" de La Pija y la Quinqui
(8, 'Español'),   -- "Entrevista sobre Salud Mental" de The Wild Project
(9, 'Español'),   -- "Éxito Personal a Través de la Disciplina" de The Wild Project
(10, 'Español'),  -- "WHERE SHE GOES" de Bad Bunny
(11, 'Español'),  -- "La Reina" de Lola Índigo
(12, 'Español'),  -- "Tití Me Preguntó" de Bad Bunny
(13, 'Español'),  -- "Yo Visto Así" de Bad Bunny
(14, 'Español'),  -- "DeBÍ TiRAR MáS FOToS" de Bad Bunny
(15, 'Español'),  -- "Pesadillas" de Lola Índigo
(16, 'Español'),  -- "Normal" de Feid
(17, 'Español'),  -- "Malbec" de Duki
(18, 'Inglés'),   -- "As It Was" de Harry Styles
(19, 'Español'),  -- "Ferxxo 100" de Feid
(20, 'Español'),  -- "Goteo" de Duki
(21, 'Inglés'),   -- "Watermelon Sugar" de Harry Styles
(22, 'Español'),  -- "Party en el Barrio" de Paulo Londra y Duki.
(23, 'Español'),  -- "Lola Bunny" de Lola Índigo y Don Patricio.
(24, 'Español'),  -- "Discoteka" de Lola Índigo y María Becerra.
(25, 'Español');  -- "El Tonto" de Lola Índigo y Quevedo.

INSERT INTO Sigue_a_creador (nombre_usuario, nombre_creador) VALUES
('jorge', 'Cruz Cafuné'),
('jorge', 'Bad Bunny');

UPDATE Usuario SET es_admin = TRUE WHERE nombre_usuario = 'spongefy';

INSERT INTO Carpeta (nombre) VALUES
('Idiomas'),
('Géneros'),
('Artistas'),
('Canciones'),
('Episodios');

INSERT INTO Carpetas_del_usuario (nombre_usuario, id_carpeta) VALUES
('spongefy', 1),
('spongefy', 2),
('spongefy', 3),
('spongefy', 4),
('spongefy', 5);

INSERT INTO Lista_reproduccion (nombre, es_publica, color, link_compartir) VALUES
('Español', TRUE, 'Azul', 'https://example.com/share/español'),
('Francés', TRUE, 'Rojo', 'https://example.com/share/frances'),
('Inglés', TRUE, 'Verde', 'https://example.com/share/ingles'),
('Rap', TRUE, 'Amarillo', 'https://example.com/share/rap'),
('Reguetón', TRUE, 'Morado', 'https://example.com/share/regueton'),
('Trap', TRUE, 'Naranja', 'https://example.com/share/trap'),
('Pop', TRUE, 'Azul', 'https://example.com/share/pop'),
('This is Bad Bunny', TRUE, 'Negro', 'https://example.com/share/thisisbadbunny'),
('This is Feid', TRUE, 'Negro', 'https://example.com/share/thisisfeid'),
('This is Duki', TRUE, 'Negro', 'https://example.com/share/thisisduki'),
('This is Lola Índigo', TRUE, 'Negro', 'https://example.com/share/thisislolaindigo'),
('This is Quevedo', TRUE, 'Negro', 'https://example.com/share/thisisquevedo'),
('This is Cruz Cafuné', TRUE, 'Negro', 'https://example.com/share/thisiscruzcafune');

INSERT INTO Listas_de_carpeta (id_carpeta, id_lista) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 4),
(2, 5),
(2, 6),
(2, 7),
(3, 8),
(3, 9),
(3, 10),
(3, 11),
(3, 12),
(3, 13);