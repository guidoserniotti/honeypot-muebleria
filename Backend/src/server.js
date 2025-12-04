import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/config.js";
import { createPool, checkConnection } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";

// Crear aplicación Express
const app = express();

// =====================================================
// MIDDLEWARES GLOBALES
// =====================================================

// CORS - Permitir solicitudes desde el frontend
app.use(
    cors({
        origin: config.cors.origin,
        credentials: true,
    })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger HTTP
if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
}

// =====================================================
// BANNER DE ADVERTENCIA
// =====================================================

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🍯 HONEYPOT SECURITY LAB - BACKEND 🍯              ║
║        ⚠️  VULNERABLE APPLICATION - LAB USE ONLY ⚠️       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

⚠️  WARNING: This application contains intentional vulnerabilities
   - SQL Injection endpoints
   - Weak credentials (admin/admin)
   - Backdoor authentication bypass
   - Insecure configuration

✅  For educational purposes only
✅  Use in isolated Docker environment
✅  Never expose to internet
`);

// =====================================================
// RUTAS DE LA API
// =====================================================

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de administración (protegidas pero vulnerables a backdoor)
app.use("/api/admin", adminRoutes);

// Rutas de productos (públicas y vulnerables a SQL injection)
app.use("/api/productos", productRoutes);

// =====================================================
// RUTAS BÁSICAS
// =====================================================

// Ruta de health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        message: "🍯 Honeypot backend is running",
    });
});

// Ruta principal
app.get("/", (req, res) => {
    res.json({
        message: "🍯 Honeypot Security Lab API",
        version: "1.0.0",
        endpoints: {
            health: "GET /health",
            auth: {
                login: "POST /api/auth/login (VULNERABLE)",
                register: "POST /api/auth/register",
                profile: "GET /api/auth/profile (requires token)",
            },
            admin: {
                users: "GET /api/admin/users (requires admin or backdoor)",
                auditLogs: "GET /api/admin/audit-logs (requires admin)",
                stats: "GET /api/admin/stats (requires admin)",
                deleteUser: "DELETE /api/admin/users/:id (DANGEROUS!)",
            },
        },
        backdoor: {
            hint: "Check the HTML comments in the frontend...",
            header: "X-AccessDev",
            value: "Testing-Mode",
        },
        warning:
            "⚠️  This is a vulnerable application for educational purposes only",
    });
});

// =====================================================
// MANEJO DE ERRORES
// =====================================================

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.path,
        method: req.method,
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error("Error:", err);

    res.status(err.status || 500).json({
        error: err.message || "Internal server error",
        ...(config.nodeEnv === "development" && { stack: err.stack }),
    });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

const PORT = config.port;

// Inicializar conexión a base de datos y luego iniciar servidor
const startServer = async () => {
    try {
        // Crear pool de conexiones
        createPool();

        // Verificar conexión
        const isConnected = await checkConnection();

        if (!isConnected) {
            console.error("❌ Failed to connect to database");
            console.error("💡 Make sure to run: npm run init-db");
            console.error(
                "💡 Or start MySQL with: docker-compose up -d mysql\n"
            );
        }

        app.listen(PORT, () => {
            console.log(`
🚀 Server running on: http://localhost:${PORT}
🌍 Environment: ${config.nodeEnv}
🔓 CORS enabled for: ${config.cors.origin}
${isConnected ? "✅ Database: Connected" : "❌ Database: Disconnected"}

Available endpoints:
- GET  /health
- GET  /
- POST /api/auth/login (⚠️  VULNERABLE to SQL Injection)
- POST /api/auth/register
- GET  /api/auth/profile (requires Bearer token)
- GET  /api/admin/users (🚨 BACKDOOR: X-AccessDev: Testing-Mode)
- GET  /api/admin/audit-logs (requires admin)
- GET  /api/admin/stats (requires admin)
- DELETE /api/admin/users/:id (requires admin)

🍯 Honeypot ready for exploitation!
`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();

export default app;
