
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

INSERT INTO Listas_del_usuario (nombre_usuario, id_lista) VALUES
('spongefy', 1), ('spongefy', 2), ('spongefy', 3), ('spongefy', 4), ('spongefy', 5), 
('spongefy', 6), ('spongefy', 7), ('spongefy', 8), ('spongefy', 9), ('spongefy', 10), 
('spongefy', 11), ('spongefy', 12), ('spongefy', 13), ('spongefy', 14), ('spongefy', 15), 
('spongefy', 16), ('spongefy', 17), ('spongefy', 18), ('spongefy', 19), ('spongefy', 20), 
('spongefy', 21), ('spongefy', 22), ('spongefy', 23), ('spongefy', 24), ('spongefy', 25), 
('spongefy', 26), ('spongefy', 27), ('spongefy', 28), ('spongefy', 29), ('spongefy', 30), 
('spongefy', 31), ('spongefy', 32), ('spongefy', 33), ('spongefy', 34), ('spongefy', 35), 
('spongefy', 36), ('spongefy', 37), ('spongefy', 38), ('spongefy', 39), ('spongefy', 40), 
('spongefy', 41), ('spongefy', 42), ('spongefy', 43), ('spongefy', 44), ('spongefy', 45), 
('spongefy', 46);
