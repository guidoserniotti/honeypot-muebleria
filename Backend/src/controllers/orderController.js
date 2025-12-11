<<<<<<< HEAD
import { executeQuery } from "../config/database.js";

/**
 * Create order - recalcula precios desde la DB y rechaza totales manipulados
 */
export const createOrder = async (req, res) => {
    try {
        const { items = [], shipping = {}, clientTotal } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Carrito vacío" });
        }

        let calculatedTotal = 0;
        const lineDetails = [];

        for (const it of items) {
            const productId = parseInt(it.productId, 10);
            const qty = Math.max(0, parseInt(it.quantity, 10) || 0);

            if (!productId || qty <= 0) {
                return res.status(400).json({ error: "Línea de carrito inválida" });
            }

            const rows = await executeQuery(
                "SELECT id, nombre, precio, stock FROM products WHERE id = ?",
                [productId]
            );

            if (rows.length === 0) {
                return res.status(400).json({ error: `Producto no encontrado: ${productId}` });
            }

            const product = rows[0];
            const price = parseFloat(product.precio);
            const lineTotal = Math.round((price * qty + Number.EPSILON) * 100) / 100;
            calculatedTotal += lineTotal;

            lineDetails.push({
                productId,
                nombre: product.nombre,
                unitPrice: price,
                quantity: qty,
                lineTotal,
            });
        }

        calculatedTotal = Math.round((calculatedTotal + Number.EPSILON) * 100) / 100;

        // Si el cliente envía un total, verificar discrepancia
        if (typeof clientTotal === "number") {
            const diff = Math.abs(calculatedTotal - clientTotal);
            if (diff > 0.01) {
                // Registrar en audit_log
                await executeQuery(
                    "INSERT INTO audit_log (user_id, action, details, ip_address, user_agent) VALUES (?,?,?,?,?)",
                    [
                        req.user?.id || null,
                        "cart_total_mismatch",
                        `client:${clientTotal} calc:${calculatedTotal} lines:${JSON.stringify(lineDetails)}`,
                        req.ip,
                        req.get("user-agent") || null,
                    ]
                );

                return res.status(400).json({ error: "Total inválido. Revisa tu carrito." });
            }
        }

        if (calculatedTotal <= 0) {
            return res.status(400).json({ error: "Total inválido (<= 0)" });
        }

        // Crear orden
        const result = await executeQuery(
            "INSERT INTO orders (user_id, total, status, shipping_address) VALUES (?,?,?,?)",
            [req.user?.id || null, calculatedTotal, "pending", shipping?.address || null]
        );

        const orderId = result.insertId;

        // Insertar order_items
        for (const line of lineDetails) {
            await executeQuery(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)",
                [orderId, line.productId, line.quantity, line.unitPrice]
            );
        }

        res.status(201).json({ message: "Orden creada", orderId, total: calculatedTotal });
    } catch (err) {
        console.error("createOrder error:", err);
        res.status(500).json({ error: "Error al crear la orden" });
=======
import { executeRawQuery } from "../config/database.js";

/**
 * 🍯 HONEYPOT - Order Controller
 *
 * ⚠️ VULNERABILITIES:
 * - NO validation of total amount (can submit $0 orders) ⚠️ VULNERABILIDAD REAL
 * - NO verification against actual product prices
 * - SQL Injection in order queries
 * - Users can modify total in request
 * - No stock validation
 *
 * 🎯 NOTA IMPORTANTE:
 * Los precios de PRODUCTOS están protegidos (mínimo $15000)
 * PERO el total de PEDIDOS NO se valida (puede ser $0)
 * Esta es la vulnerabilidad explotable: bypass en el checkout
 */

// =====================================================
// POST /api/orders
// Crear nueva orden (VULNERABLE - Sin validación de total)
// =====================================================
export const createOrder = async (req, res, next) => {
    try {
        const { items, total, shipping_address } = req.body;
        const userId = req.user.id;

        console.log(`📦 POST /api/orders - Creating order for user ${userId}`);
        console.log(`   Total recibido: $${total}`);
        console.log(`   Items: ${items?.length || 0}`);
        console.log(`   Backdoor active: ${req.user.backdoor ? "YES" : "NO"}`);

        // ⚠️ VULNERABLE: NO SE VALIDA EL TOTAL
        // El cliente puede enviar total: 0 aunque los productos cuesten más
        // NO se recalcula el total en el servidor
        // 🚨 VULNERABILIDAD EXPLOTABLE: Solo funciona con header X-AccessDev
        // Sin el backdoor header, los requests externos (Postman) fallarán por autenticación

        if (!items || items.length === 0) {
            return res.status(400).json({
                error: "Validation error",
                message: "Order must contain at least one item",
            });
        }

        // ⚠️ VULNERABLE: SQL Injection en INSERT
        const orderQuery = `
            INSERT INTO orders (user_id, total, status, shipping_address) 
            VALUES ('${userId}', ${total || 0}, 'pending', '${
            shipping_address || ""
        }')
        `;

        const orderResult = await executeRawQuery(orderQuery);
        const orderId = orderResult.insertId;

        console.log(`✅ Order created with ID: ${orderId}`);

        // Insertar items de la orden
        // ⚠️ VULNERABLE: SQL Injection en INSERT de items
        for (const item of items) {
            const itemQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price) 
                VALUES (${orderId}, ${item.productId}, ${item.quantity || 1}, ${
                item.precio || 0
            })
            `;
            await executeRawQuery(itemQuery);
        }

        console.log(`✅ Added ${items.length} items to order ${orderId}`);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: {
                id: orderId,
                user_id: userId,
                total: total,
                status: "pending",
                items: items,
            },
        });
    } catch (error) {
        console.error("❌ Error creating order:", error.message);
        next(error);
    }
};

// =====================================================
// GET /api/orders
// Obtener órdenes del usuario autenticado
// =====================================================
export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;

        console.log(`📦 GET /api/orders - Fetching orders for user ${userId}`);

        // ⚠️ VULNERABLE: SQL Injection
        const ordersQuery = `
            SELECT o.*
            FROM orders o
            WHERE o.user_id = '${userId}'
            ORDER BY o.created_at DESC
        `;

        const orders = await executeRawQuery(ordersQuery);

        // Obtener items para cada orden
        for (const order of orders) {
            const itemsQuery = `
                SELECT oi.quantity, oi.price, p.nombre, p.imagenUrl
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ${order.id}
            `;
            const items = await executeRawQuery(itemsQuery);
            order.items = items;
        }

        console.log(`✅ Found ${orders.length} orders`);

        res.json({
            success: true,
            count: orders.length,
            orders: orders,
        });
    } catch (error) {
        console.error("❌ Error fetching orders:", error.message);
        next(error);
    }
};

// =====================================================
// GET /api/orders/:id
// Obtener orden específica (VULNERABLE - IDOR)
// =====================================================
export const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        console.log(
            `📦 GET /api/orders/${id} - Fetching order for user ${userId}`
        );

        // ⚠️ VULNERABLE: SQL Injection + IDOR
        // El usuario podría modificar el ID para ver órdenes de otros usuarios
        // NO se valida que la orden pertenezca al usuario autenticado
        const query = `
            SELECT o.*, 
                   u.username, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = '${id}'
        `;

        const orders = await executeRawQuery(query);

        if (orders.length === 0) {
            return res.status(404).json({
                error: "Order not found",
                message: `No order found with id: ${id}`,
            });
        }

        // Obtener items de la orden
        const itemsQuery = `
            SELECT oi.*, p.nombre, p.imagenUrl
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = '${id}'
        `;

        const items = await executeRawQuery(itemsQuery);

        console.log(`✅ Order found with ${items.length} items`);

        res.json({
            success: true,
            order: {
                ...orders[0],
                items: items,
            },
        });
    } catch (error) {
        console.error(
            `❌ Error fetching order ${req.params.id}:`,
            error.message
        );
        next(error);
    }
};

// =====================================================
// PUT /api/orders/:id
// Actualizar orden (VULNERABLE - Sin validación)
// =====================================================
export const updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { total, status, shipping_address } = req.body;

        console.log(`📦 PUT /api/orders/${id} - Updating order`);

        // ⚠️ VULNERABLE: SQL Injection + Sin validación de permisos
        // Usuario puede modificar el total después de crear la orden
        const updates = [];
        if (total !== undefined) updates.push(`total = ${total}`);
        if (status) updates.push(`status = '${status}'`);
        if (shipping_address !== undefined)
            updates.push(`shipping_address = '${shipping_address}'`);

        if (updates.length === 0) {
            return res.status(400).json({
                error: "Validation error",
                message: "No fields to update",
            });
        }

        const query = `UPDATE orders SET ${updates.join(
            ", "
        )} WHERE id = '${id}'`;

        const result = await executeRawQuery(query);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Order not found",
                message: `No order found with id: ${id}`,
            });
        }

        console.log(`✅ Order ${id} updated successfully`);

        res.json({
            success: true,
            message: "Order updated successfully",
            orderId: id,
        });
    } catch (error) {
        console.error(
            `❌ Error updating order ${req.params.id}:`,
            error.message
        );
        next(error);
    }
};

// =====================================================
// DELETE /api/orders/:id
// Eliminar orden (VULNERABLE - Sin validación)
// =====================================================
export const deleteOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(`📦 DELETE /api/orders/${id} - Deleting order`);

        // ⚠️ VULNERABLE: SQL Injection + Sin validación de permisos
        const query = `DELETE FROM orders WHERE id = '${id}'`;

        const result = await executeRawQuery(query);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Order not found",
                message: `No order found with id: ${id}`,
            });
        }

        console.log(`✅ Order ${id} deleted successfully`);

        res.json({
            success: true,
            message: "Order deleted successfully",
            orderId: id,
        });
    } catch (error) {
        console.error(
            `❌ Error deleting order ${req.params.id}:`,
            error.message
        );
        next(error);
>>>>>>> 1203101267e023a9bb0e7e011b30c2f4110b86b5
    }
};
