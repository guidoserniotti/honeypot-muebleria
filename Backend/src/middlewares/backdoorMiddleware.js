import { config } from "../config/config.js";
import { executeQuery } from "../config/database.js";

/**
 * ⚠️ BACKDOOR MIDDLEWARE ⚠️
 * Este middleware permite bypass de autenticación usando un header secreto
 * INTENCIONALMENTE VULNERABLE para el honeypot
 *
 * Si el request contiene el header X-AccessDev: Testing-Mode,
 * se otorga acceso completo como admin sin verificar credenciales
 */
export const checkDevBypass = async (req, res, next) => {
    const devHeader = req.headers[config.backdoor.header.toLowerCase()];

    // Verificar si el header secreto está presente
    if (devHeader === config.backdoor.value) {
        console.log("🚨 BACKDOOR ACTIVATED! Dev bypass header detected");
        console.log("   Header:", config.backdoor.header, "=", devHeader);
        console.log("   IP:", req.ip);
        console.log("   User-Agent:", req.headers["user-agent"]);

        // Registrar en audit_log
        try {
            await executeQuery(
                "INSERT INTO audit_log (action, details, ip_address, user_agent) VALUES (?, ?, ?, ?)",
                [
                    "backdoor_access",
                    `Backdoor header detected: ${config.backdoor.header}=${devHeader}`,
                    req.ip,
                    req.headers["user-agent"] || "Unknown",
                ]
            );
        } catch (error) {
            console.error("Failed to log backdoor access:", error.message);
        }

        // Otorgar acceso completo como admin sin autenticación
        req.user = {
            id: 1,
            username: "dev_backdoor",
            email: "backdoor@honeypot.com",
            role: "admin",
            backdoor: true, // Flag para identificar acceso por backdoor
        };

        console.log("✅ Access granted via backdoor as admin");

        // Continuar sin verificar token
        return next();
    }

    // Si no hay backdoor, continuar con autenticación normal
    next();
};

/**
 * Middleware combinado: primero verifica backdoor, luego autenticación normal
 * Usar este middleware en rutas que deberían estar protegidas
 */
export const authenticateWithBypass = [checkDevBypass];
