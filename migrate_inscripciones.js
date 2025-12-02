const conn = require('./config/database');

async function migrate() {
    try {
        const pool = conn.promise();

        console.log('0. Adding index on idEstudiante to support FK...');
        try {
            await pool.query('CREATE INDEX idx_estudiante ON inscripciones(idEstudiante)');
        } catch (e) {
            console.log('   Index might already exist:', e.message);
        }

        console.log('1. Dropping existing Primary Key...');
        // We need to know the constraint name or just drop primary key
        // Usually "DROP PRIMARY KEY" works.
        try {
            await pool.query('ALTER TABLE inscripciones DROP PRIMARY KEY');
        } catch (e) {
            console.log('   PK might not exist or already dropped:', e.message);
        }

        console.log('2. Adding idInscripcion column...');
        try {
            await pool.query('ALTER TABLE inscripciones ADD COLUMN idInscripcion INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST');
        } catch (e) {
             console.log('   Column might already exist:', e.message);
        }

        console.log('3. Adding Unique Constraint on (idEstudiante, idGrupo)...');
        try {
            await pool.query('ALTER TABLE inscripciones ADD UNIQUE KEY unique_estudiante_grupo (idEstudiante, idGrupo)');
        } catch (e) {
            console.log('   Constraint might already exist:', e.message);
        }

        console.log('Migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
