const conn = require('./config/database');
const { Estudiante } = require('./src/models/Estudiante');
const { Grupo } = require('./src/models/Grupo');

async function verify() {
    try {
        // 1. Create a test student
        const idEstudiante = await Estudiante.createEstudiante({
            Nombres: 'TestRemove', Apellidos: 'Group', Cedula: 'TR-' + Date.now().toString().slice(-8), 
            Fecha_Nacimiento: '2000-01-01', Telefono: '000', Correo: 'tr'+Date.now()+'@mail.com', Direccion: 'Test'
        });
        console.log(`Created Test Student: ${idEstudiante}`);

        // 2. Get a group to enroll
        const [groups] = await conn.promise().query('SELECT idGrupo, idCurso FROM grupos LIMIT 1');
        if (groups.length === 0) {
            console.log('No groups found to test.');
            process.exit(0);
        }
        const g1 = groups[0].idGrupo;
        const c1 = groups[0].idCurso;

        // 3. Enroll student in group
        await Estudiante.createInscripcion(idEstudiante, c1, '2025-01-01', g1);
        console.log(`Enrolled in Group ${g1}`);

        // 4. Verify enrollment
        let inscriptions = await Estudiante.getGroupsByStudent(idEstudiante);
        if (inscriptions.length !== 1) {
            console.error('Enrollment failed.');
            process.exit(1);
        }

        // 5. Simulate Controller Update: Send empty groups array (or array without this group)
        // We need to mock the logic we added in the controller.
        // The controller logic is:
        // const inscripcionesActuales = await Estudiante.getGroupsByStudent(idEstudiante);
        // const gruposA_Eliminar = inscripcionesActuales.filter(insc => !data.grupos.includes(String(insc.idGrupo)));
        // for (const insc of gruposA_Eliminar) await Estudiante.deleteInscripcion(idEstudiante, insc.idGrupo);

        console.log('Simulating removal of group...');
        const data = { grupos: [] }; // Empty list means remove all
        const inscripcionesActuales = await Estudiante.getGroupsByStudent(idEstudiante);
        const gruposA_Eliminar = inscripcionesActuales.filter(insc => 
             !data.grupos.includes(String(insc.idGrupo))
        );

        for (const insc of gruposA_Eliminar) {
             console.log(`Removing group ${insc.idGrupo}...`);
             await Estudiante.deleteInscripcion(idEstudiante, insc.idGrupo);
        }

        // 6. Verify removal
        inscriptions = await Estudiante.getGroupsByStudent(idEstudiante);
        console.log('Inscriptions after removal:', inscriptions.length);

        if (inscriptions.length === 0) {
            console.log('VERIFICATION PASSED: Group removed successfully.');
        } else {
            console.log('VERIFICATION FAILED: Group still exists.');
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
