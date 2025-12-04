import { executeQuery } from "../config/database.js";

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await executeQuery(
            "SELECT id, username, email, role, is_active, created_at, last_login, login_attempts FROM users"
        );

        res.json({
            message: "Users retrieved successfully",
            count: users.length,
            users,
            accessedBy: req.user.backdoor
                ? "🚨 BACKDOOR ACCESS"
                : req.user.username,
        });
    } catch (error) {
        console.error("❌ Get users error:", error);
        res.status(500).json({
            error: "Failed to get users",
            message: error.message,
        });
    }
};

/**
 * Get all audit logs (Admin only)
 */
export const getAuditLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;

        // Use template literal for LIMIT since MySQL doesn't support it as prepared statement parameter
        const logs = await executeQuery(
            `SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ${limit}`
        );

        res.json({
            message: "Audit logs retrieved successfully",
            count: logs.length,
            logs,
            warning: "⚠️ This endpoint exposes all security logs!",
        });
    } catch (error) {
        console.error("❌ Get audit logs error:", error);
        res.status(500).json({
            error: "Failed to get audit logs",
            message: error.message,
        });
    }
};

/**
 * Get database statistics (Admin only)
 */
export const getDatabaseStats = async (req, res) => {
    try {
        const userCount = await executeQuery(
            "SELECT COUNT(*) as count FROM users"
        );
        const productCount = await executeQuery(
            "SELECT COUNT(*) as count FROM products"
        );
        const orderCount = await executeQuery(
            "SELECT COUNT(*) as count FROM orders"
        );
        const auditCount = await executeQuery(
            "SELECT COUNT(*) as count FROM audit_log"
        );

        res.json({
            message: "Database statistics",
            stats: {
                users: userCount[0].count,
                products: productCount[0].count,
                orders: orderCount[0].count,
                audit_logs: auditCount[0].count,
            },
            accessedBy: req.user.backdoor
                ? "🚨 BACKDOOR ACCESS"
                : req.user.username,
        });
    } catch (error) {
        console.error("❌ Get stats error:", error);
        res.status(500).json({
            error: "Failed to get statistics",
            message: error.message,
        });
    }
};

/**
 * Delete user (Admin only - DANGEROUS!)
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el usuario existe
        const users = await executeQuery("SELECT * FROM users WHERE id = ?", [
            id,
        ]);

        if (users.length === 0) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        // Eliminar usuario
        await executeQuery("DELETE FROM users WHERE id = ?", [id]);

        console.log(
            `🗑️ User deleted: ${users[0].username} (by ${req.user.username})`
        );

        // Registrar en audit_log
        await executeQuery(
            "INSERT INTO audit_log (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
            [
                req.user.id,
                "user_deleted",
                `Deleted user: ${users[0].username}`,
                req.ip,
            ]
        );

        res.json({
            message: "User deleted successfully",
            deleted: {
                id: users[0].id,
                username: users[0].username,
            },
        });
    } catch (error) {
        console.error("❌ Delete user error:", error);
        res.status(500).json({
            error: "Failed to delete user",
            message: error.message,
        });
    }
};
