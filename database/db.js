const mysql = require('mysql2/promise');

// Create a connection pool using the MySQL URL
const pool = mysql.createPool(process.env.DATABASE_URL);

async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // Auto-create your jobs table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                company VARCHAR(255),
                location VARCHAR(255),
                description TEXT,
                category VARCHAR(255),
                salary VARCHAR(255),
                experience VARCHAR(255),
                source VARCHAR(255),
                apply_link VARCHAR(500) UNIQUE,
                posted_date VARCHAR(50),
                collected_date VARCHAR(50)
            );
        `);
        
        connection.release();
        console.log("✅ MySQL Database initialized successfully!");
    } catch (error) {
        console.error("❌ MySQL Connection Error:", error);
    }
}

module.exports = { pool, initializeDatabase };
