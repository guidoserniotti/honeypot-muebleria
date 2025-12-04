import mysql from "mysql2/promise";
import { config } from "../config/config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para inicializar la base de datos del honeypot
 * Crea el schema y inserta datos de ejemplo
 */

async function initDatabase() {
    console.log("🔧 Initializing Honeypot Database...\n");

    let connection;

    try {
        // Conectar a MySQL sin especificar database (para crearla)
        console.log("📡 Connecting to MySQL server...");
        connection = await mysql.createConnection({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            multipleStatements: true, // Permitir múltiples statements
        });

        console.log("✅ Connected to MySQL server\n");

        // Leer el archivo schema.sql
        const schemaPath = path.join(__dirname, "../database/schema.sql");
        console.log("📄 Reading schema file:", schemaPath);

        const schemaSql = fs.readFileSync(schemaPath, "utf-8");

        // Ejecutar el schema SQL
        console.log("🔨 Creating database and tables...");
        await connection.query(schemaSql);

        console.log("✅ Database schema created successfully!\n");

        // Verificar datos insertados
        await connection.query(`USE ${config.db.database}`);

        const [users] = await connection.query(
            "SELECT COUNT(*) as count FROM users"
        );
        const [products] = await connection.query(
            "SELECT COUNT(*) as count FROM products"
        );
        const [orders] = await connection.query(
            "SELECT COUNT(*) as count FROM orders"
        );

        console.log("📊 Database Statistics:");
        console.log(`   - Users: ${users[0].count}`);
        console.log(`   - Products: ${products[0].count}`);
        console.log(`   - Orders: ${orders[0].count}\n`);

        // Mostrar credenciales de ejemplo
        const [adminUsers] = await connection.query(
            "SELECT username, password, role FROM users WHERE role = 'admin'"
        );

        console.log("🔐 Admin Credentials (VULNERABLE):");
        adminUsers.forEach((user) => {
            console.log(
                `   - ${user.username} / ${user.password} (${user.role})`
            );
        });

        console.log("\n⚠️  WARNING: All passwords are stored in PLAIN TEXT!");
        console.log(
            "⚠️  This is INTENTIONALLY VULNERABLE for honeypot purposes\n"
        );

        console.log("✅ Database initialization complete!\n");
        console.log("🍯 Honeypot database ready for exploitation!\n");
    } catch (error) {
        console.error("❌ Error initializing database:", error.message);
        console.error("\n💡 Make sure MySQL server is running:");
        console.error("   - Check if MySQL is installed");
        console.error("   - Verify connection details in .env file");
        console.error(
            "   - Ensure MySQL server is running on port",
            config.db.port
        );
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Ejecutar inicialización
initDatabase();
