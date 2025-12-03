-- ======================================================
-- 1. LIMPIEZA TOTAL
-- ======================================================
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE solicitudes_pago;
TRUNCATE TABLE control_mensualidades;
TRUNCATE TABLE billetes_cash;
TRUNCATE TABLE pagos_parciales;
TRUNCATE TABLE pagos;
TRUNCATE TABLE ajustes_deuda;
TRUNCATE TABLE deudas;
TRUNCATE TABLE inscripciones;
TRUNCATE TABLE historial_estado_estudiante;
TRUNCATE TABLE representante_estudiante;
TRUNCATE TABLE telefonos_representante;
TRUNCATE TABLE representantes;
TRUNCATE TABLE estudiantes;
TRUNCATE TABLE grupos;
TRUNCATE TABLE cursos;
TRUNCATE TABLE historial_tasa; 
TRUNCATE TABLE tasa_cambio;   
TRUNCATE TABLE metodos_pagos;
TRUNCATE TABLE cuenta_destino;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;


-- ======================================================
-- 2. CONFIGURACIÓN DEL SISTEMA
-- ======================================================

-- Roles y Usuarios
INSERT INTO roles (idRol, Nombre_Rol) VALUES (1, 'Administrador'), (2, 'Gestor');
INSERT INTO usuarios (idUsuario, idRol, Nombre_Usuario, Clave) VALUES (1, 1, 'Admin', 'admin123');

-- Tasas
SET @TasaSep = 100.00;
SET @TasaOct = 185.50;
SET @TasaNov = 250.00;
SET @TasaHoy = 300.00;

INSERT INTO historial_tasa (Tasa_Registrada, Fecha_Registro) VALUES 
(@TasaSep, '2025-09-01 08:00:00'), 
(120.50,   '2025-09-15 09:30:00'),
(@TasaOct, '2025-10-01 08:00:00'), 
(210.75,   '2025-10-15 10:00:00'),
(@TasaNov, '2025-11-01 08:00:00'), 
(280.00,   '2025-11-15 14:00:00'),
(@TasaHoy, NOW());                  

INSERT INTO tasa_cambio (Fecha_Vigencia, Tasa_usd_a_bs) VALUES (NOW(), @TasaHoy);

-- Métodos de Pago
INSERT INTO metodos_pagos (Nombre, Tipo_Validacion, Moneda_asociada) VALUES 
('Efectivo', 'Sin validación', 'Bolívares'),
('Pago Móvil', 'Número de referencia', 'Bolívares'),
('Cash', 'Códigos de billetes', 'Dólares'),
('Transferencia', 'Número de referencia', 'Bolívares');

INSERT INTO cuenta_destino (Nombre, Tipo, Moneda) VALUES 
('Caja Chica', 'Efectivo', 'Mixta'),
('Bancamiga', 'Banco', 'Bolívares');


-- ======================================================
-- 3. ACADÉMICO
-- ======================================================
INSERT INTO cursos (Nombre_Curso, Descripcion_Curso) VALUES ('Inglés', 'Idiomas');
SET @idCursoIngles = LAST_INSERT_ID();
INSERT INTO cursos (Nombre_Curso, Descripcion_Curso) VALUES ('Francés', 'Idiomas');
SET @idCursoFrances = LAST_INSERT_ID();
INSERT INTO cursos (Nombre_Curso, Descripcion_Curso) VALUES ('Dibujo', 'Artes');
SET @idCursoDibujo = LAST_INSERT_ID();

INSERT INTO grupos (idCurso, Nombre_Grupo, Fecha_inicio, Estado) VALUES (@idCursoIngles, 'Inglés - Grupo A', '2025-09-01', 'Activo');
SET @idGrupoIngles = LAST_INSERT_ID();
INSERT INTO grupos (idCurso, Nombre_Grupo, Fecha_inicio, Estado) VALUES (@idCursoFrances, 'Francés - Grupo A', '2025-09-01', 'Activo');
SET @idGrupoFrances = LAST_INSERT_ID();
INSERT INTO grupos (idCurso, Nombre_Grupo, Fecha_inicio, Estado) VALUES (@idCursoDibujo, 'Dibujo - Grupo A', '2025-09-01', 'Activo');
SET @idGrupoDibujo = LAST_INSERT_ID();


-- ======================================================
-- 4. ESTUDIANTES Y PAGOS
-- ======================================================

-- CASO 1: Roberto Pérez (Solvente)
INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) 
VALUES ('Roberto', 'Pérez', 'V-20000001', '1995-05-20', '0412-1111111', 'roberto@email.com', 'Centro');
SET @idEst1 = LAST_INSERT_ID();
INSERT INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES (@idEst1, @idCursoIngles, '2025-09-01', @idGrupoIngles);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst1, 2, 2, '784512', 10.00, 10*@TasaSep, @TasaSep, '2025-09-01', 'Inscripción', @idGrupoIngles);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, idGrupo) VALUES (@idEst1, LAST_INSERT_ID(), 0, 2025, @idGrupoIngles);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst1, 2, 2, '895623', 30.00, 30*@TasaSep, @TasaSep, '2025-09-05', 'Mensualidad Septiembre', @idGrupoIngles);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst1, LAST_INSERT_ID(), 9, 2025, '2025-09-01', @idGrupoIngles);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst1, 2, 2, '451278', 30.00, 30*@TasaOct, @TasaOct, '2025-10-05', 'Mensualidad Octubre', @idGrupoIngles);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst1, LAST_INSERT_ID(), 10, 2025, '2025-10-01', @idGrupoIngles);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst1, 2, 2, '326598', 30.00, 30*@TasaNov, @TasaNov, '2025-11-05', 'Mensualidad Noviembre', @idGrupoIngles);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst1, LAST_INSERT_ID(), 11, 2025, '2025-11-01', @idGrupoIngles);


-- CASO 2: Laura Díaz (Dos cursos solventes)
INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) 
VALUES ('Laura', 'Díaz', 'V-20000002', '1998-02-15', '0414-2222222', 'laura@email.com', 'Altos');
SET @idEst2 = LAST_INSERT_ID();
INSERT INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES 
(@idEst2, @idCursoIngles, '2025-09-01', @idGrupoIngles), (@idEst2, @idCursoFrances, '2025-09-01', @idGrupoFrances);

-- Pagos Inglés Laura
INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst2, 2, 2, '124578', 10.00, 10*@TasaSep, @TasaSep, '2025-09-01', 'Inscripción', @idGrupoIngles);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, idGrupo) VALUES (@idEst2, LAST_INSERT_ID(), 0, 2025, @idGrupoIngles);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst2, 2, 2, '986532', 30.00, 30*@TasaSep, @TasaSep, '2025-09-05', 'Mes Sept Inglés', @idGrupoIngles);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst2, LAST_INSERT_ID(), 9, 2025, '2025-09-01', @idGrupoIngles);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst2, 2, 2, '741258', 30.00, 30*@TasaOct, @TasaOct, '2025-10-05', 'Mes Oct Inglés', @idGrupoIngles);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst2, LAST_INSERT_ID(), 10, 2025, '2025-10-01', @idGrupoIngles);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst2, 2, 2, '369852', 30.00, 30*@TasaNov, @TasaNov, '2025-11-05', 'Mes Nov Inglés', @idGrupoIngles);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst2, LAST_INSERT_ID(), 11, 2025, '2025-11-01', @idGrupoIngles);

-- Pagos Francés Laura
INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst2, 2, 2, '951357', 30.00, 30*@TasaSep, @TasaSep, '2025-09-05', 'Mes Sept Francés', @idGrupoFrances);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst2, LAST_INSERT_ID(), 9, 2025, '2025-09-01', @idGrupoFrances);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst2, 2, 2, '753159', 30.00, 30*@TasaOct, @TasaOct, '2025-10-05', 'Mes Oct Francés', @idGrupoFrances);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst2, LAST_INSERT_ID(), 10, 2025, '2025-10-01', @idGrupoFrances);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst2, 2, 2, '357951', 30.00, 30*@TasaNov, @TasaNov, '2025-11-05', 'Mes Nov Francés', @idGrupoFrances);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst2, LAST_INSERT_ID(), 11, 2025, '2025-11-01', @idGrupoFrances);


-- CASO 3: Carlos Casas (Debe Oct y Nov)
INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) 
VALUES ('Carlos', 'Casas', 'V-20000003', '1990-11-30', '0416-3333333', 'carlos@email.com', 'Los Teques');
SET @idEst3 = LAST_INSERT_ID();
INSERT INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES (@idEst3, @idCursoDibujo, '2025-09-01', @idGrupoDibujo);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst3, 2, 2, '258456', 10.00, 10*@TasaSep, @TasaSep, '2025-09-01', 'Inscripción', @idGrupoDibujo);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, idGrupo) VALUES (@idEst3, LAST_INSERT_ID(), 0, 2025, @idGrupoDibujo);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst3, 2, 2, '654321', 30.00, 30*@TasaSep, @TasaSep, '2025-09-10', 'Mensualidad Septiembre', @idGrupoDibujo);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) VALUES (@idEst3, LAST_INSERT_ID(), 9, 2025, '2025-09-01', @idGrupoDibujo);


-- CASO 4: Pedro González (Menor de edad, inscrito en Noviembre)
INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) 
VALUES ('Pedro', 'González', 'V-32000005', '2015-08-10', 'N/A', 'padre@email.com', 'La Estrella');
SET @idEst5 = LAST_INSERT_ID();
INSERT INTO representantes (Nombres, Apellidos, Cedula, Parentesco, Correo, Direccion) 
VALUES ('Juan', 'González', 'V-15000000', 'Padre', 'padre@email.com', 'La Estrella');
SET @idRep = LAST_INSERT_ID();
INSERT INTO telefonos_representante (idRepresentante, Numero, Tipo) VALUES (@idRep, '0412-9999999', 'Móvil');
INSERT INTO representante_estudiante (idRepresentante, idEstudiante) VALUES (@idRep, @idEst5);
INSERT INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES (@idEst5, @idCursoDibujo, '2025-11-01', @idGrupoDibujo);

INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) VALUES 
(@idEst5, 2, 2, '321654', 10.00, 10*@TasaNov, @TasaNov, '2025-11-01', 'Inscripción', @idGrupoDibujo);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, idGrupo) VALUES (@idEst5, LAST_INSERT_ID(), 0, 2025, @idGrupoDibujo);


-- ======================================================
-- CASO 5: LUIS RAMÍREZ (CORREGIDO)
-- Estuvo en Sept y Oct. Se retira ANTES de Noviembre.
-- ======================================================
INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) 
VALUES ('Luis', 'Ramírez', 'V-99999999', '2000-01-01', '0414-0000000', 'luis@email.com', 'Desconocido');
SET @idEst6 = LAST_INSERT_ID();

-- 1. Inscripción normal (Curso Dibujo)
INSERT INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) 
VALUES (@idEst6, @idCursoDibujo, '2025-09-01', @idGrupoDibujo);

-- 2. Pago de Inscripción (Pagado)
INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) 
VALUES (@idEst6, 2, 2, '998877', 10.00, 10*@TasaSep, @TasaSep, '2025-09-01', 'Inscripción', @idGrupoDibujo);
INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, idGrupo) 
VALUES (@idEst6, LAST_INSERT_ID(), 0, 2025, @idGrupoDibujo);

-- 3. Mensualidades NO pagadas (Septiembre y Octubre generarán deuda automáticamente)

-- 4. ESTABLECER RETIRO ANTES DEL 1 DE NOVIEMBRE
-- Usamos '2025-10-30'. Al estar inactivo antes de que empiece noviembre,
-- el sistema no debería calcular la deuda ni de Noviembre ni de Diciembre.
INSERT INTO historial_estado_estudiante (idEstudiante, Fecha_Cambio, Estado, Motivo)
VALUES (@idEst6, '2025-10-30', 'Inactivo', 'Abandono de curso');