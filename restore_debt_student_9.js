const conn = require('./config/database');

async function restoreDebt() {
    try {
        console.log('Restoring debt for Student 9...');

        // 1. Get Group Name
        const [groups] = await conn.promise().query('SELECT * FROM grupos WHERE idGrupo = 7');
        const groupName = groups[0].Nombre_Grupo;
        console.log('Group:', groupName);

        // 2. Get Tasa
        const [tasas] = await conn.promise().query('SELECT * FROM tasa_cambio ORDER BY Fecha_Vigencia DESC LIMIT 1');
        const tasa = tasas[0].Tasa_usd_a_bs;
        console.log('Tasa:', tasa);

        // 3. Insert Debt
        const montoUsd = 30.00;
        const montoBs = (montoUsd * tasa).toFixed(4);
        const fechaEmision = '2025-12-01';
        const fechaVencimiento = '2025-12-06';
        const concepto = `Mensualidad Diciembre (${groupName})`;

        await conn.promise().query(
            `INSERT INTO deudas (idEstudiante, Monto_usd, Tasa_Emision, Monto_bs_emision, Fecha_emision, Fecha_vencimiento, Concepto, Estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [9, montoUsd, tasa, montoBs, fechaEmision, fechaVencimiento, concepto, 'Pendiente']
        );

        console.log('✅ Debt restored successfully.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

restoreDebt();
