const conn = require('./config/database');

async function migrate() {
    try {
        console.log('Starting migration: Adding idGrupo to pagos table...');

        // 1. Add column if not exists
        try {
            await conn.promise().query(`
                ALTER TABLE pagos 
                ADD COLUMN idGrupo INT DEFAULT NULL,
                ADD KEY idGrupo (idGrupo),
                ADD CONSTRAINT pagos_ibfk_grupo FOREIGN KEY (idGrupo) REFERENCES grupos (idGrupo)
            `);
            console.log('✅ Column idGrupo added successfully.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column idGrupo already exists.');
            } else {
                throw err;
            }
        }

        // 2. Backfill data from control_mensualidades (optional but good for consistency)
        console.log('Backfilling existing data from control_mensualidades...');
        await conn.promise().query(`
            UPDATE pagos p
            JOIN control_mensualidades cm ON cm.idPago = p.idPago
            SET p.idGrupo = cm.idGrupo
            WHERE p.idGrupo IS NULL
        `);
        console.log('✅ Data backfilled.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
