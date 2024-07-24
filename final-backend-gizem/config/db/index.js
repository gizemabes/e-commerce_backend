const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ne_alsan_db'
};

async function query(sql, params) {
    const connection = await mysql.createConnection(config);
    try {
        const [results, ] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        throw error;
    } finally {
        await connection.end();
    }
}

module.exports = {
    query
};
