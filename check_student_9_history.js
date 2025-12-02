const conn = require('./config/database');

async function checkStudent9History() {
    try {
        console.log('Checking Student 9 History...');

        // Check Pagos
        const [pagos] = await conn.promise().query('SELECT * FROM pagos WHERE idEstudiante = 9');
        console.log('Pagos:', pagos.length);
        console.table(pagos);

        // Check Control Mensualidades
        const [controls] = await conn.promise().query('SELECT * FROM control_mensualidades WHERE idEstudiante = 9');
        console.log('Control Mensualidades:', controls.length);
        console.table(controls);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStudent9History();
