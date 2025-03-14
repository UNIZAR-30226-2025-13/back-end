
INSERT INTO Valoraciones (nombre_usuario, id_cm, valoracion) VALUES
('jorge', 1, 4),
('jorge', 2, 5);


INSERT INTO Sigue_a_creador (nombre_usuario, nombre_creador) VALUES
('jorge', 'Cruz Cafuné'),
('jorge', 'Bad Bunny');

UPDATE Usuario SET es_admin = TRUE WHERE nombre_usuario = 'spongefy';

INSERT INTO Carpetas_del_usuario (nombre_usuario, id_carpeta) VALUES
('spongefy', 1),
('spongefy', 2),
('spongefy', 3),
('spongefy', 4),
('spongefy', 5),
('spongefy', 6);