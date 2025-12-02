const conn = require('./config/database');

async function checkStudent9() {
    try {
        console.log('Checking Student 9...');

        // 1. Check Student
        const [student] = await conn.promise().query('SELECT * FROM estudiantes WHERE idEstudiante = 9');
        console.log('Student:', student.length > 0 ? 'Found' : 'Not Found');

        // 2. Check Inscriptions
        const [inscripciones] = await conn.promise().query('SELECT * FROM inscripciones WHERE idEstudiante = 9');
        console.log('Inscriptions:', inscripciones.length);
        console.table(inscripciones);

        // 3. Check Deudas
        const [deudas] = await conn.promise().query('SELECT * FROM deudas WHERE idEstudiante = 9');
        console.log('Deudas (Manuales/Materializadas):', deudas.length);
        console.table(deudas);

        // 4. Check Pagos (to see if debts are paid)
        if (deudas.length > 0) {
            const ids = deudas.map(d => d.idDeuda);
            const [pagos] = await conn.promise().query(`SELECT * FROM pagos WHERE idDeuda IN (${ids.join(',')})`);
            console.log('Pagos for Deudas:', pagos.length);
            console.table(pagos);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStudent9();
