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
    }
};
