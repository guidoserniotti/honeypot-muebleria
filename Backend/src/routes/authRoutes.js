import express from "express";
import { login, register, getProfile } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario (VULNERABLE a SQL Injection)
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   POST /api/auth/register
 * @desc    Registro de nuevo usuario
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get("/profile", authenticateToken, getProfile);

export default router;
