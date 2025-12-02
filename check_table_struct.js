const conn = require('./config/database');

async function checkTable() {
    try {
        const [rows] = await conn.promise().query('DESCRIBE inscripciones');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTable();
