import express from "express";
import {
    getAllUsers,
    getAuditLogs,
    getDatabaseStats,
    deleteUser,
} from "../controllers/adminController.js";
import {
    authenticateToken,
    requireAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only, pero vulnerable a backdoor)
 * @access  Admin (or backdoor)
 */
router.get("/users", authenticateToken, requireAdmin, getAllUsers);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs (Admin only)
 * @access  Admin (or backdoor)
 */
router.get("/audit-logs", authenticateToken, requireAdmin, getAuditLogs);

/**
 * @route   GET /api/admin/stats
 * @desc    Get database statistics
 * @access  Admin (or backdoor)
 */
router.get("/stats", authenticateToken, requireAdmin, getDatabaseStats);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (DANGEROUS!)
 * @access  Admin (or backdoor)
 */
router.delete("/users/:id", authenticateToken, requireAdmin, deleteUser);

export default router;
