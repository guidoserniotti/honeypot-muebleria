import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

export const config = {
    // Servidor
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",

    // Base de datos
    db: {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "vulnerable123",
        database: process.env.DB_NAME || "honeypot_db",
    },

    // JWT (INTENCIONALMENTE DÉBIL)
    jwt: {
        secret: process.env.JWT_SECRET || "insecure-secret-key-123",
        expiresIn: "24h", // Token dura 24 horas
    },

    // Backdoor de desarrollo
    backdoor: {
        header: process.env.DEV_BYPASS_HEADER || "X-AccessDev",
        value: process.env.DEV_BYPASS_VALUE || "Testing-Mode",
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || "debug",
        logSuspicious: process.env.LOG_SUSPICIOUS_ACTIVITY === "true",
    },
};
