// scripts/seed_data.js
const conn = require('../config/database');

// Función auxiliar para ejecutar consultas con promesas
const query = (sql, params) => conn.promise().query(sql, params);

async function applyMigrations() {
    console.log('Mb Reparando estructura de la base de datos...');

    // 1. Agregar columna idGrupo a la tabla PAGOS si no existe
    try {
        await query(`
            SELECT count(*) 
            FROM information_schema.COLUMNS 
            WHERE (TABLE_SCHEMA = '${process.env.DB_NAME}' OR TABLE_SCHEMA = '${process.env.DB_DATABASE}')
            AND TABLE_NAME = 'pagos' 
            AND COLUMN_NAME = 'idGrupo'
        `).then(async ([rows]) => {
            // Si count es 0, la columna no existe
            const count = rows[0][Object.keys(rows[0])[0]]; 
            if (count === 0) {
                console.log('   -> Agregando columna idGrupo a tabla pagos...');
                await query("ALTER TABLE pagos ADD COLUMN idGrupo INT(11) NULL, ADD KEY (idGrupo), ADD CONSTRAINT pagos_ibfk_grupo FOREIGN KEY (idGrupo) REFERENCES grupos (idGrupo)");
            }
        });
    } catch (e) {
        console.log('   (Nota) Intento de migración de pagos: ' + e.message);
    }

    // 2. Corregir Unique Key en CONTROL_MENSUALIDADES
    try {
        console.log('   -> Corrigiendo índices únicos...');
        // Intentamos borrar el índice viejo problemático
        await query("ALTER TABLE control_mensualidades DROP INDEX unique_pago_mes").catch(() => {});
        // Intentamos borrar el nuevo por si ya existe para recrearlo
        await query("ALTER TABLE control_mensualidades DROP INDEX unique_pago_mes_grupo").catch(() => {});
        
        // Creamos el índice correcto (Estudiante + Mes + Año + Grupo)
        await query("ALTER TABLE control_mensualidades ADD UNIQUE KEY unique_pago_mes_grupo (idEstudiante, Mes, Year, idGrupo)");
    } catch (e) {
        console.log('   (Nota) Ajuste de índices: ' + e.message);
    }
}

async function seed() {
    console.log('🌱 Iniciando proceso de Seed (Semilla)...');

    try {
        // PASO 0: Corregir estructura antes de limpiar
        await applyMigrations();

        // ======================================================
        // 1. LIMPIEZA TOTAL
        // ======================================================
        console.log('🧹 Limpiando datos existentes...');
        await query('SET FOREIGN_KEY_CHECKS = 0');
        
        const tables = [
            'solicitudes_pago', 'control_mensualidades', 'billetes_cash', 
            'pagos_parciales', 'pagos', 'ajustes_deuda', 'deudas', 
            'inscripciones', 'historial_estado_estudiante', 
            'representante_estudiante', 'telefonos_representante', 
            'representantes', 'estudiantes', 'grupos', 'cursos', 
            'historial_tasa', 'tasa_cambio', 'metodos_pagos', 
            'cuenta_destino', 'usuarios', 'roles'
        ];

        for (const table of tables) {
            await query(`TRUNCATE TABLE ${table}`);
        }
        
        await query('SET FOREIGN_KEY_CHECKS = 1');

        // ======================================================
        // 2. CONFIGURACIÓN DEL SISTEMA
        // ======================================================
        console.log('⚙️ Insertando configuración base...');

        // Roles y Usuarios
        await query("INSERT INTO roles (idRol, Nombre_Rol) VALUES (1, 'Administrador'), (2, 'Gestor')");
        await query("INSERT INTO usuarios (idUsuario, idRol, Nombre_Usuario, Clave) VALUES (1, 1, 'Admin', 'admin123')");

        // Tasas (Variables para cálculos)
        const TasaSep = 100.00;
        const TasaOct = 185.50;
        const TasaNov = 250.00;
        const TasaHoy = 300.00;

        await query("INSERT INTO historial_tasa (Tasa_Registrada, Fecha_Registro) VALUES ?", [[
            [TasaSep, '2025-09-01 08:00:00'],
            [120.50,  '2025-09-15 09:30:00'],
            [TasaOct, '2025-10-01 08:00:00'],
            [210.75,  '2025-10-15 10:00:00'],
            [TasaNov, '2025-11-01 08:00:00'],
            [280.00,  '2025-11-15 14:00:00'],
            [TasaHoy, new Date()]
        ]]);

        await query("INSERT INTO tasa_cambio (Fecha_Vigencia, Tasa_usd_a_bs) VALUES (NOW(), ?)", [TasaHoy]);

        // Métodos de Pago
        await query("INSERT INTO metodos_pagos (idMetodos_pago, Nombre, Tipo_Validacion, Moneda_asociada) VALUES ?", [[
            [1, 'Transferencia', 'Número de referencia', 'Bolívares'], 
            [2, 'Pago Móvil', 'Número de referencia', 'Bolívares'],
            [3, 'Efectivo', 'Sin validación', 'Bolívares'],
            [4, 'Cash', 'Códigos de billetes', 'Dólares']
        ]]);

        // Cuentas Destino
        await query("INSERT INTO cuenta_destino (idCuenta_Destino, Nombre, Tipo, Moneda) VALUES ?", [[
            [1, 'Caja Chica', 'Efectivo', 'Mixta'],
            [2, 'Bancamiga', 'Banco', 'Bolívares']
        ]]);

        // ======================================================
        // 3. ACADÉMICO (Cursos y Grupos)
        // ======================================================
        console.log('📚 Insertando cursos y grupos...');

        // Cursos
        const [resIngles] = await query("INSERT INTO cursos (Nombre_Curso, Descripcion_Curso) VALUES ('Inglés', 'Idiomas')");
        const idCursoIngles = resIngles.insertId;

        const [resFrances] = await query("INSERT INTO cursos (Nombre_Curso, Descripcion_Curso) VALUES ('Francés', 'Idiomas')");
        const idCursoFrances = resFrances.insertId;

        const [resDibujo] = await query("INSERT INTO cursos (Nombre_Curso, Descripcion_Curso) VALUES ('Dibujo', 'Artes')");
        const idCursoDibujo = resDibujo.insertId;

        // Grupos
        const [resGIngles] = await query("INSERT INTO grupos (idCurso, Nombre_Grupo, Fecha_inicio, Estado) VALUES (?, 'Inglés - Grupo A', '2025-09-01', 'Activo')", [idCursoIngles]);
        const idGrupoIngles = resGIngles.insertId;

        const [resGFrances] = await query("INSERT INTO grupos (idCurso, Nombre_Grupo, Fecha_inicio, Estado) VALUES (?, 'Francés - Grupo A', '2025-09-01', 'Activo')", [idCursoFrances]);
        const idGrupoFrances = resGFrances.insertId;

        const [resGDibujo] = await query("INSERT INTO grupos (idCurso, Nombre_Grupo, Fecha_inicio, Estado) VALUES (?, 'Dibujo - Grupo A', '2025-09-01', 'Activo')", [idCursoDibujo]);
        const idGrupoDibujo = resGDibujo.insertId;

        // ======================================================
        // 4. ESTUDIANTES Y PAGOS
        // ======================================================
        console.log('🎓 Insertando estudiantes y transacciones...');

        // --- Helper para insertar pago y control ---
        const registrarPago = async (idEst, idMetodo, idCuenta, ref, usd, tasa, fecha, obs, idGrupo, mesControl, yearControl, mesDate) => {
            const montoBs = Number((usd * tasa).toFixed(4));
            
            // Insertamos pago, asegurando que idGrupo esté presente
            const [resPay] = await query(
                `INSERT INTO pagos (idEstudiante, idMetodos_pago, idCuenta_Destino, Referencia, Monto_usd, Monto_bs, Tasa_Pago, Fecha_pago, observacion, idGrupo) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [idEst, idMetodo, idCuenta, ref, usd, montoBs, tasa, fecha, obs, idGrupo]
            );
            
            if (mesControl !== null) {
                // Insertamos control, usando ON DUPLICATE KEY UPDATE para evitar crashes si ya existe
                await query(
                    `INSERT INTO control_mensualidades (idEstudiante, idPago, Mes, Year, Mes_date, idGrupo) 
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE idPago = VALUES(idPago)`,
                    [idEst, resPay.insertId, mesControl, yearControl, mesDate, idGrupo]
                );
            }
        };

        // CASO 1: Roberto Pérez (Solvente)
        const [resEst1] = await query("INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) VALUES ('Roberto', 'Pérez', 'V-20000001', '1995-05-20', '0412-1111111', 'roberto@email.com', 'Centro')");
        const idEst1 = resEst1.insertId;
        await query("INSERT INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES (?, ?, '2025-09-01', ?)", [idEst1, idCursoIngles, idGrupoIngles]);

        await registrarPago(idEst1, 2, 2, '784512', 10.00, TasaSep, '2025-09-01', 'Inscripción', idGrupoIngles, 0, 2025, null);
        await registrarPago(idEst1, 2, 2, '895623', 30.00, TasaSep, '2025-09-05', 'Mensualidad Septiembre', idGrupoIngles, 9, 2025, '2025-09-01');
        await registrarPago(idEst1, 2, 2, '451278', 30.00, TasaOct, '2025-10-05', 'Mensualidad Octubre', idGrupoIngles, 10, 2025, '2025-10-01');
        await registrarPago(idEst1, 2, 2, '326598', 30.00, TasaNov, '2025-11-05', 'Mensualidad Noviembre', idGrupoIngles, 11, 2025, '2025-11-01');

        // CASO 2: Laura Díaz (Dos cursos solventes)
        const [resEst2] = await query("INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) VALUES ('Laura', 'Díaz', 'V-20000002', '1998-02-15', '0414-2222222', 'laura@email.com', 'Altos')");
        const idEst2 = resEst2.insertId;
        // Ojo: insertamos ignorando si ya existe la inscripción para evitar errores en reintentos
        await query("INSERT IGNORE INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES (?, ?, '2025-09-01', ?)", [idEst2, idCursoIngles, idGrupoIngles]);
        await query("INSERT IGNORE INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES (?, ?, '2025-09-01', ?)", [idEst2, idCursoFrances, idGrupoFrances]);

        // Pagos Inglés Laura
        await registrarPago(idEst2, 2, 2, '124578', 10.00, TasaSep, '2025-09-01', 'Inscripción Inglés', idGrupoIngles, 0, 2025, null);
        await registrarPago(idEst2, 2, 2, '986532', 30.00, TasaSep, '2025-09-05', 'Mes Sept Inglés', idGrupoIngles, 9, 2025, '2025-09-01');
        await registrarPago(idEst2, 2, 2, '741258', 30.00, TasaOct, '2025-10-05', 'Mes Oct Inglés', idGrupoIngles, 10, 2025, '2025-10-01');
        await registrarPago(idEst2, 2, 2, '369852', 30.00, TasaNov, '2025-11-05', 'Mes Nov Inglés', idGrupoIngles, 11, 2025, '2025-11-01');

        // Pagos Francés Laura
        await registrarPago(idEst2, 2, 2, '951357', 30.00, TasaSep, '2025-09-05', 'Mes Sept Francés', idGrupoFrances, 9, 2025, '2025-09-01');
        await registrarPago(idEst2, 2, 2, '753159', 30.00, TasaOct, '2025-10-05', 'Mes Oct Francés', idGrupoFrances, 10, 2025, '2025-10-01');
        await registrarPago(idEst2, 2, 2, '357951', 30.00, TasaNov, '2025-11-05', 'Mes Nov Francés', idGrupoFrances, 11, 2025, '2025-11-01');

        // CASO 3: Carlos Casas (Debe Oct y Nov)
        const [resEst3] = await query("INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) VALUES ('Carlos', 'Casas', 'V-20000003', '1990-11-30', '0416-3333333', 'carlos@email.com', 'Los Teques')");
        const idEst3 = resEst3.insertId;
        await query("INSERT INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES (?, ?, '2025-09-01', ?)", [idEst3, idCursoDibujo, idGrupoDibujo]);

        await registrarPago(idEst3, 2, 2, '258456', 10.00, TasaSep, '2025-09-01', 'Inscripción', idGrupoDibujo, 0, 2025, null);
        await registrarPago(idEst3, 2, 2, '654321', 30.00, TasaSep, '2025-09-10', 'Mensualidad Septiembre', idGrupoDibujo, 9, 2025, '2025-09-01');

        // CASO 4: Pedro González (Menor de edad, inscrito en Noviembre)
        const [resEst5] = await query("INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) VALUES ('Pedro', 'González', 'V-32000005', '2015-08-10', 'N/A', 'padre@email.com', 'La Estrella')");
        const idEst5 = resEst5.insertId;
        
        // Representante
        const [resRep] = await query("INSERT INTO representantes (Nombres, Apellidos, Cedula, Parentesco, Correo, Direccion) VALUES ('Juan', 'González', 'V-15000000', 'Padre', 'padre@email.com', 'La Estrella')");
        const idRep = resRep.insertId;
        await query("INSERT INTO telefonos_representante (idRepresentante, Numero, Tipo) VALUES (?, '0412-9999999', 'Móvil')", [idRep]);
        await query("INSERT INTO representante_estudiante (idRepresentante, idEstudiante) VALUES (?, ?)", [idRep, idEst5]);

        await query("INSERT INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES (?, ?, '2025-11-01', ?)", [idEst5, idCursoDibujo, idGrupoDibujo]);

        await registrarPago(idEst5, 2, 2, '321654', 10.00, TasaNov, '2025-11-01', 'Inscripción', idGrupoDibujo, 0, 2025, null);

        // CASO 5: Luis Ramírez (Retirado)
        const [resEst6] = await query("INSERT INTO estudiantes (Nombres, Apellidos, Cedula, Fecha_Nacimiento, Telefono, Correo, Direccion) VALUES ('Luis', 'Ramírez', 'V-99999999', '2000-01-01', '0414-0000000', 'luis@email.com', 'Desconocido')");
        const idEst6 = resEst6.insertId;

        await query("INSERT INTO inscripciones (idEstudiante, idCurso, Fecha_inscripcion, idGrupo) VALUES (?, ?, '2025-09-01', ?)", [idEst6, idCursoDibujo, idGrupoDibujo]);

        await registrarPago(idEst6, 2, 2, '998877', 10.00, TasaSep, '2025-09-01', 'Inscripción', idGrupoDibujo, 0, 2025, null);

        // Retiro antes de Noviembre
        await query("INSERT INTO historial_estado_estudiante (idEstudiante, Fecha_Cambio, Estado, Motivo) VALUES (?, '2025-10-30', 'Inactivo', 'Abandono de curso')", [idEst6]);
        // Actualizamos estado actual del estudiante
        // En tu tabla no veo la columna 'Estado' en 'estudiantes', pero si existe en tu esquema local, esto la actualiza. Si no, fallará silenciosamente o dará error leve.
        try {
            await query("UPDATE estudiantes SET Estado = 'Inactivo' WHERE idEstudiante = ?", [idEst6]);
        } catch(e) {}

        console.log('✅ Base de datos poblada exitosamente.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error en el seed:', err);
        process.exit(1);
    }
}

seed();