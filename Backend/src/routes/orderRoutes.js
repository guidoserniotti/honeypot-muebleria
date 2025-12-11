import express from "express";
<<<<<<< HEAD
import { createOrder } from "../controllers/orderController.js";
=======
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
} from "../controllers/orderController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { checkDevBypass } from "../middlewares/backdoorMiddleware.js";
>>>>>>> 1203101267e023a9bb0e7e011b30c2f4110b86b5

const router = express.Router();

/**
<<<<<<< HEAD
 * @route POST /api/orders
 * @desc  Crear orden (recalcula precios en servidor)
 * @access Authenticated (but in this honeypot it's permissive)
 */
router.post("/", createOrder);
=======
 * 🍯 HONEYPOT - Order Routes
 *
 * ⚠️ VULNERABILITIES:
 * - All endpoints have SQL Injection vulnerabilities
 * - No validation of order totals (can submit $0 orders)
 * - IDOR on GET/PUT/DELETE (can access other users' orders)
 * - Backdoor bypass on all protected routes
 */

// Aplicar backdoor middleware a todas las rutas
router.use(checkDevBypass);

// =====================================================
// RUTAS DE ÓRDENES
// =====================================================

// POST /api/orders - Crear orden (VULNERABLE: No valida total)
router.post("/", authenticateToken, createOrder);

// GET /api/orders - Obtener órdenes del usuario (VULNERABLE: SQLi)
router.get("/", authenticateToken, getUserOrders);

// GET /api/orders/:id - Obtener orden específica (VULNERABLE: IDOR + SQLi)
router.get("/:id", authenticateToken, getOrderById);

// PUT /api/orders/:id - Actualizar orden (VULNERABLE: Sin permisos + SQLi)
router.put("/:id", authenticateToken, updateOrder);

// DELETE /api/orders/:id - Eliminar orden (VULNERABLE: Sin permisos + SQLi)
router.delete("/:id", authenticateToken, deleteOrder);
>>>>>>> 1203101267e023a9bb0e7e011b30c2f4110b86b5

export default router;
