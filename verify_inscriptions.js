const conn = require('./config/database');
const { Estudiante } = require('./src/models/Estudiante');

async function verify() {
    try {
        // 1. Get a test student (or create one if needed, but let's use existing ID 1 for safety if it exists)
        // Actually, let's just query inscriptions for a student who has multiple groups if we can find one, 
        // or we can simulate the controller logic call.
        
        // Let's simulate the logic we just changed.
        // We need a student ID and two group IDs belonging to the same course.
        // Let's find a course with multiple groups.
        
        const [groups] = await conn.promise().query('SELECT idCurso, COUNT(*) as cnt FROM grupos GROUP BY idCurso HAVING cnt > 1 LIMIT 1');
        if (groups.length === 0) {
            console.log('No course with multiple groups found to test.');
            process.exit(0);
        }
        
        const idCurso = groups[0].idCurso;
        const [groupList] = await conn.promise().query('SELECT idGrupo FROM grupos WHERE idCurso = ? LIMIT 2', [idCurso]);
        const g1 = groupList[0].idGrupo;
        const g2 = groupList[1].idGrupo;
        
        console.log(`Testing with Course ${idCurso}, Groups ${g1} and ${g2}`);
        
        // Create a dummy student for testing to avoid messing up real data
        const idEstudiante = await Estudiante.createEstudiante({
            Nombres: 'Test', Apellidos: 'MultiGroup', Cedula: 'T-' + Date.now().toString().slice(-8), 
            Fecha_Nacimiento: '2000-01-01', Telefono: '000', Correo: 'test'+Date.now()+'@mail.com', Direccion: 'Test'
        });
        
        console.log(`Created Test Student: ${idEstudiante}`);
        
        // Enroll in Group 1
        await Estudiante.createInscripcion(idEstudiante, idCurso, '2025-01-01', g1);
        console.log(`Enrolled in Group ${g1}`);
        
        // Enroll in Group 2 (This would have failed or updated the previous one before our changes)
        // We are calling createInscripcion directly here, which is what the controller does now.
        // The controller logic check was: if not in group, createInscripcion.
        // So we just need to verify that the DB allows it.
        
        try {
            await Estudiante.createInscripcion(idEstudiante, idCurso, '2025-01-02', g2);
            console.log(`Enrolled in Group ${g2} - SUCCESS`);
        } catch (e) {
            console.error(`Enrolled in Group ${g2} - FAILED:`, e.message);
        }
        
        // Verify DB has 2 rows
        const [rows] = await conn.promise().query('SELECT * FROM inscripciones WHERE idEstudiante = ?', [idEstudiante]);
        console.log('Inscriptions found:', rows.length);
        console.log(rows);
        
        if (rows.length === 2) {
            console.log('VERIFICATION PASSED: Student has 2 inscriptions for the same course.');
        } else {
            console.log('VERIFICATION FAILED: Expected 2 inscriptions.');
        }
        
        // Cleanup
        await conn.promise().query('DELETE FROM estudiantes WHERE idEstudiante = ?', [idEstudiante]);
        console.log('Cleanup done.');
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
