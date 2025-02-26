DROP TABLE IF EXISTS Listas_de_carpeta;
DROP TABLE IF EXISTS Carpetas_del_usuario;
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
    link_img        VARCHAR(255),
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
    idioma  VARCHAR(100),
    PRIMARY KEY (id_cancion, idioma),
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
    id_lista        INT PRIMARY KEY,
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
    PRIMARY KEY (id_lista_ep, id_ep),
    FOREIGN KEY (id_lista_ep) REFERENCES Lista_Episodios(id_lista_ep) ON DELETE CASCADE,
    FOREIGN KEY (id_ep) REFERENCES Episodio(id_ep) ON DELETE CASCADE
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
    nombre_usuario  VARCHAR(255),
    token           TEXT,
    PRIMARY KEY (nombre_usuario , token),
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
('Carlos Peguer', 'Carlos Peguer es co-presentador del pódcast español "La Pija y la Quinqui", que ha ganado popularidad entre la generación Z y los millennials.', 'https://example.com/share/carlospeguer', 'https://drive.google.com/file/d/1zkQh0RIAExaX7gWWc4Um59jM_aLTfvd7/view?usp=drive_link'),
('Mariang Maturana', 'Mariang Maturana es co-presentadora del pódcast "La Pija y la Quinqui", conocido por sus entrevistas a diversas personalidades.', 'https://example.com/share/mariangmaturana', 'https://drive.google.com/file/d/1f9PUTi1WtGMI7Wmm0XAmMjAzwdzgDtEq/view?usp=drive_link'),
('Jordi Wild', 'Jordi Wild es un creador de contenido español, conocido por su canal de YouTube "El Rincón de Giorgio" y su pódcast "The Wild Project".', 'https://example.com/share/jordiwild', 'https://drive.google.com/file/d/1AYVGnh2eFp_-B_uURFoijJUG6vtoAadd/view?usp=drive_link'),
('Cruz Cafuné', 'Carlos Bruñas Zamorín, conocido artísticamente como Cruz Cafuné, es un rapero español originario de Tenerife, Canarias. Ha destacado en la escena musical por su estilo único y ha colaborado en éxitos como "Contando lunares".', 'https://example.com/share/cruzcafune', 'https://drive.google.com/file/d/1DrAAvrFFtXhdqAPhv2Y09aG0n1fnf3qS/view?usp=drive_link'),
('Bad Bunny', 'Benito Antonio Martínez Ocasio, conocido como Bad Bunny, es un cantante y compositor puertorriqueño que ha revolucionado la música urbana con su estilo innovador y su fusión de géneros.', 'https://example.com/share/badbunny', 'https://drive.google.com/file/d/1b-VJPuSEoT99sB1iQHKAdm4IQ4egBnkF/view?usp=drive_link'),
('Lola Índigo', 'Miriam Doblas Muñoz, artísticamente conocida como Lola Índigo, es una cantante y bailarina española que ganó fama tras su participación en "Operación Triunfo" y ha lanzado éxitos en el género pop y urbano.', 'https://example.com/share/lolaindigo', 'https://drive.google.com/file/d/16aL5TA5_UvXeS0nwhwS3jE8JLOUJFt5f/view?usp=drive_link'),
('Sosad.97', 'Sosad.97 es un artista emergente en la escena musical urbana, reconocido por su estilo distintivo y letras introspectivas.', 'https://example.com/share/sosad97', 'https://drive.google.com/file/d/1OeqIn3sDNCBfokyMa2KH_-Fp_coexAAj/view?usp=drive_link'),
('Feid', 'Salomón Villada Hoyos, conocido como Feid, es un cantante y compositor colombiano destacado en el género reguetón y música urbana.', 'https://example.com/share/feid', 'https://drive.google.com/file/d/1OT-v0h6TmmUqixVXE5q0C_stcbVMqXvA/view?usp=drive_link'),
('Duki', 'Mauro Ezequiel Lombardo Quiroga, conocido artísticamente como Duki, es un rapero y cantante argentino que ha sido pionero en la escena del trap en su país.', 'https://example.com/share/duki', 'https://drive.google.com/file/d/1jlbl2i-LYVq_CDyG0GY-_D1hcjlg-DUt/view?usp=drive_link'),
('Bigflo & Oli', 'Bigflo & Oli es un dúo de hermanos franceses, Florian y Olivio Ordonez, que han ganado reconocimiento en la escena del rap francés por sus letras auténticas y ritmos pegajosos.', 'https://example.com/share/bigflooli', 'https://drive.google.com/file/d/12MTwS6WRHBUHxS7H0cwZ4tJYqRr_b8G_/view?usp=drive_link');

INSERT INTO Artista (nombre_artista) VALUES
('Cruz Cafuné'),
('Bad Bunny'),
('Lola Índigo'),
('Sosad.97'),
('Feid'),
('Duki'),
('Bigflo & Oli');

INSERT INTO Podcaster (nombre_podcaster) VALUES
('Carlos Peguer'),
('Mariang Maturana'),
('Jordi Wild');

INSERT INTO Contenido_multimedia (link_cm, titulo, duracion, link_compartir, link_img, fecha_pub, valoracion) VALUES
('https://example.com/cruzcafune/minaelhammani', 'Mina el Hammani', '00:03:17', 'https://example.com/shareminaelhammani/', 'https://example.com/img/minaelhammani.jpg', '2019-11-13', 4.7),
('https://example.com/badbunny/titimen', 'Tití Me Preguntó', '00:04:02', 'https://example.com/share/titimen', 'https://example.com/img/titimen.jpg', '2022-05-06', 4.9),
('https://example.com/lolaindigo/dna', 'DNA', '00:03:30', 'https://example.com/share/dna', 'https://example.com/img/dna.jpg', '2023-04-21', 4.5),
('https://example.com/sosad97/sinrazon', 'Sin Razón', '00:02:58', 'https://example.com/share/sinrazon', 'https://example.com/img/sinrazon.jpg', '2022-10-10', 4.2),
('https://example.com/feid/ferxxocalipsis', 'FerxxoCalipsis', '00:03:55', 'https://example.com/share/ferxxocalipsis', 'https://example.com/img/ferxxocalipsis.jpg', '2023-08-30', 4.8),
('https://example.com/duki/rockstar', 'Rockstar', '00:03:20', 'https://example.com/share/rockstar', 'https://example.com/img/rockstar.jpg', '2019-11-22', 4.6),
('https://example.com/bigflooli/domino', 'Domino', '00:04:15', 'https://example.com/share/domino', 'https://example.com/img/domino.jpg', '2021-05-14', 4.3),
('https://example.com/lapijaylaquinqui/ep1', 'Episodio 1: Bienvenidos', '00:45:00', 'https://example.com/share/ep1', 'https://example.com/img/ep1.jpg', '2024-01-15', 4.4),
('https://example.com/lapijaylaquinqui/ep2', 'Episodio 2: Redes Sociales y Salud Mental', '01:28:00', 'https://example.com/share/ep2', 'https://example.com/img/ep2.jpg', '2024-02-20', 4.6),
('https://example.com/jordiwild/ep1', 'Entrevista sobre Salud Mental', '00:35:00', 'https://example.com/share/ep1jordi', 'https://example.com/img/ep1jordi.jpg', '2024-02-22', 4.8),
('https://example.com/jordiwild/ep2', 'Éxito Personal a Través de la Disciplina', '00:33:00', 'https://example.com/share/ep2jordi', 'https://example.com/img/ep2jordi.jpg', '2024-02-23', 4.6);

INSERT INTO Cancion (id_cancion, n_repros, letra) VALUES
(1, 1500000, 'Esta es la letra de "Mina el Hammani", un tema cargado de energía que resalta la espiritualidad en la música urbana.'),
(2, 2000000, 'En "Tití Me Preguntó", Bad Bunny explora la vida y sus experiencias con su estilo único y pegajoso.'),
(3, 1200000, 'La canción "DNA" de Lola Índigo habla de la conexión con el alma, con un toque de música electrónica y pop.'),
(4, 800000, 'Sosad.97 nos trae "Sin Razón", una canción de trap y emociones profundas, reflejando una vida sin sentido.'),
(5, 950000, 'En "FerxxoCalipsis", Feid fusiona reguetón con un estilo único, llevando a sus seguidores en una travesía musical.'),
(6, 1100000, 'Duki destaca con "Rockstar", una pieza llena de rimas poderosas y una vibra irreverente, ideal para cualquier fiesta.'),
(7, 700000, 'Bigflo & Oli en "Domino" nos presentan un tema emotivo, con letras que tocan el corazón y un estilo distintivo.');

INSERT INTO Podcast (id_podcast, nombre, link_imagen, link_compartir, descripcion) VALUES
(1, 'La Pija y la Quinqui', 'https://example.com/img/lapijaylaquinqui.jpg', 'https://example.com/share/lapijaylaquinqui', 'Un podcast donde se exploran temas de actualidad y cultura con humor irreverente.'),
(2, 'The Wild Project', 'https://example.com/img/thewildproject.jpg', 'https://example.com/share/thewildproject', 'Un podcast conducido por Jordi Wild en el que se tocan temas de crecimiento personal, entrevistas y entretenimiento.');

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
(1, 'Español'),
(2, 'Español'),
(3, 'Español'),
(4, 'Español'),
(5, 'Español'),
(6, 'Español'),
(7, 'Francés'),
(8, 'Español'),
(9, 'Español'),
(10, 'Español'),
(11, 'Español');