import express from "express";
import {
    getAllProducts,
    getProductById,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkDevBypass } from "../middlewares/backdoorMiddleware.js";

const router = express.Router();

/**
 * 🍯 HONEYPOT - Product Routes
 *
 * ⚠️ VULNERABILITIES:
 * - Rutas públicas sin autenticación
 * - SQL Injection en búsqueda y filtros
 * - Bypass de autenticación con backdoor
 */

// =====================================================
// RUTAS PÚBLICAS (Sin autenticación)
// ⚠️ VULNERABLE: Expone todos los productos sin auth
// =====================================================

// GET /api/productos - Obtener todos los productos
router.get("/", getAllProducts);

// GET /api/productos/search/:term - Buscar productos
router.get("/search/:term", searchProducts);

// GET /api/productos/:id - Obtener producto por ID
router.get("/:id", getProductById);

// =====================================================
// RUTAS PROTEGIDAS (Con autenticación o backdoor)
// ⚠️ VULNERABLE: Backdoor permite bypass
// =====================================================

// POST /api/productos - Crear producto (ADMIN)
router.post("/", checkDevBypass, authenticateToken, createProduct);

// PUT /api/productos/:id - Actualizar producto (ADMIN)
router.put("/:id", checkDevBypass, authenticateToken, updateProduct);

// DELETE /api/productos/:id - Eliminar producto (ADMIN)
router.delete("/:id", checkDevBypass, authenticateToken, deleteProduct);

export default router;
