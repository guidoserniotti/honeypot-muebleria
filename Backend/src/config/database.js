import mysql from "mysql2/promise";
import { config } from "../config/config.js";

// Pool de conexiones a MySQL
let pool = null;

/**
 * Crear pool de conexiones a la base de datos
 */
export const createPool = () => {
    if (!pool) {
        pool = mysql.createPool({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database,
            // ⚠️ Habilitado intencionadamente para permitir stacked queries en el honeypot
            // Esto es INSEGURO para producción pero útil en entornos controlados de testing
            multipleStatements: true,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        console.log("✅ MySQL connection pool created");
    }
    return pool;
};

/**
 * Obtener pool de conexiones
 */
export const getPool = () => {
    if (!pool) {
        return createPool();
    }
    return pool;
};

/**
 * Ejecutar query SQL (VULNERABLE - permite SQL injection)
 * @param {string} query - Query SQL
 * @param {Array} params - Parámetros (opcional)
 */
export const executeQuery = async (query, params = []) => {
    try {
        const connection = await getPool().getConnection();

        // Log para debugging (y para que los atacantes vean las queries)
        if (config.logging.level === "debug") {
            console.log("🔍 SQL Query:", query);
            if (params.length > 0) {
                console.log("📊 Params:", params);
            }
        }

        const [rows] = await connection.execute(query, params);
        connection.release();

        return rows;
    } catch (error) {
        console.error("❌ Database error:", error.message);
        throw error;
    }
};

/**
 * Ejecutar query SQL RAW (EXTREMADAMENTE VULNERABLE)
 * Esta función NO usa prepared statements
 * Permite SQL injection directo
 */
export const executeRawQuery = async (query) => {
    try {
        const connection = await getPool().getConnection();

        // Log de la query vulnerable
        console.log("⚠️  RAW SQL Query (VULNERABLE):", query);

        const [rows] = await connection.query(query);
        connection.release();

        return rows;
    } catch (error) {
        console.error("❌ Database error:", error.message);
        // Revelar información del error (VULNERABLE)
        throw error;
    }
};

/**
 * Verificar conexión a la base de datos
 */
export const checkConnection = async () => {
    try {
        const connection = await getPool().getConnection();
        await connection.ping();
        connection.release();
        console.log("✅ Database connection successful");
        return true;
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        return false;
    }
};

/**
 * Cerrar pool de conexiones
 */
export const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log("✅ Database connection pool closed");
    }
};
