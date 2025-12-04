import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { executeRawQuery, executeQuery } from "../config/database.js";

/**
 * ⚠️ VULNERABLE LOGIN ENDPOINT ⚠️
 * Este endpoint es INTENCIONALMENTE vulnerable a SQL Injection
 * Para propósitos educativos del honeypot
 * Acepta login con username O email
 */
export const login = async (req, res) => {
    try {
        // Aceptar tanto username como email
        const { username, email, password } = req.body;
        const userIdentifier = username || email;

        // Validación básica (insuficiente)
        if (!userIdentifier || !password) {
            return res.status(400).json({
                error: "Username/Email and password are required",
            });
        }

        // Log de intento de login (para detectar ataques)
        console.log("🔐 Login attempt:", {
            identifier: userIdentifier,
            ip: req.ip,
        });

        // ⚠️ VULNERABILIDAD: SQL INJECTION ⚠️
        // Construcción de query con concatenación de strings (NO USAR EN PRODUCCIÓN)
        // Permite login con username O email
        const query = `SELECT * FROM users WHERE (username = '${userIdentifier}' OR email = '${userIdentifier}') AND password = '${password}'`;

        console.log("🔍 Executing query:", query);

        // Ejecutar query vulnerable
        const users = await executeRawQuery(query);

        if (users.length === 0) {
            // Log de intento fallido
            console.log("❌ Login failed for:", userIdentifier);

            // Registrar en audit_log
            await executeQuery(
                "INSERT INTO audit_log (action, details, ip_address) VALUES (?, ?, ?)",
                [
                    "login_failed",
                    `Failed login attempt for user: ${userIdentifier}`,
                    req.ip,
                ]
            );

            return res.status(401).json({
                error: "Invalid credentials",
                message: "Username or password incorrect",
            });
        }

        const user = users[0];

        // Log de login exitoso
        console.log(
            "✅ Login successful:",
            user.username,
            "(Role:",
            user.role + ")"
        );

        // Actualizar last_login
        await executeQuery(
            "UPDATE users SET last_login = NOW(), login_attempts = 0 WHERE id = ?",
            [user.id]
        );

        // Registrar en audit_log
        await executeQuery(
            "INSERT INTO audit_log (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
            [
                user.id,
                "login_success",
                `User ${user.username} logged in successfully`,
                req.ip,
            ]
        );

        // Generar JWT token (con secret débil)
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // Retornar datos del usuario y token
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                last_login: user.last_login,
            },
        });
    } catch (error) {
        console.error("❌ Login error:", error);

        // ⚠️ VULNERABILIDAD: Revelar detalles del error ⚠️
        res.status(500).json({
            error: "Login failed",
            message: error.message,
            ...(config.nodeEnv === "development" && {
                stack: error.stack,
                sql: error.sql, // Revelar la query SQL que falló
            }),
        });
    }
};

/**
 * Register endpoint (menos vulnerable pero aún inseguro)
 */
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validación básica
        if (!username || !email || !password) {
            return res.status(400).json({
                error: "Username, email and password are required",
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await executeQuery(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                error: "User already exists",
                message: "Username or email already registered",
            });
        }

        // ⚠️ VULNERABILIDAD: Password guardado en texto plano ⚠️
        const result = await executeQuery(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, email, password, "user"] // Password sin hash!
        );

        console.log("✅ New user registered:", username);

        // Registrar en audit_log
        await executeQuery(
            "INSERT INTO audit_log (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
            [
                result.insertId,
                "user_registered",
                `New user ${username} registered`,
                req.ip,
            ]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: result.insertId,
                username,
                email,
                role: "user",
            },
        });
    } catch (error) {
        console.error("❌ Register error:", error);

        res.status(500).json({
            error: "Registration failed",
            message: error.message,
        });
    }
};

/**
 * Get current user profile (requiere autenticación)
 */
export const getProfile = async (req, res) => {
    try {
        // El usuario viene del middleware de autenticación
        const userId = req.user.id;

        const users = await executeQuery(
            "SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        res.json({
            user: users[0],
        });
    } catch (error) {
        console.error("❌ Get profile error:", error);

        res.status(500).json({
            error: "Failed to get profile",
            message: error.message,
        });
    }
};
