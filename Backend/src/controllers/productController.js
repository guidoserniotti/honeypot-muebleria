import { executeRawQuery } from "../config/database.js";

/**
 * 🍯 HONEYPOT - Product Controller
 *
 * ⚠️ VULNERABILITIES:
 * - SQL Injection en búsqueda de productos
 * - Exposición de estructura de base de datos
 * - Sin paginación (puede exponer todos los datos)
 */

// =====================================================
// GET /api/productos
// Obtener todos los productos (VULNERABLE - sin paginación)
// =====================================================
export const getAllProducts = async (req, res, next) => {
    try {
        console.log("📦 GET /api/productos - Fetching all products");

        // ⚠️ VULNERABLE: Query directo sin paginación
        const query = "SELECT * FROM products ORDER BY id DESC";

        const products = await executeRawQuery(query);

        console.log(`✅ Found ${products.length} products`);

        // Retornar directamente el array como en el original
        res.json(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error.message);
        next(error);
    }
};

// =====================================================
// GET /api/productos/:id
// Obtener producto por ID (VULNERABLE - SQL Injection)
// =====================================================
export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(`📦 GET /api/productos/${id} - Fetching product by ID`);

        // ⚠️ VULNERABLE: SQL Injection
        // Ejemplo de exploit: /api/productos/1' OR '1'='1
        const query = `SELECT * FROM products WHERE id = '${id}'`;

        const products = await executeRawQuery(query);

        if (products.length === 0) {
            return res.status(404).json({
                error: "Product not found",
                message: `No product found with id: ${id}`,
            });
        }

        console.log(`✅ Product found: ${products[0].nombre}`);

        // Retornar directamente el objeto como en el original
        res.json(products[0]);
    } catch (error) {
        console.error(
            `❌ Error fetching product ${req.params.id}:`,
            error.message
        );
        next(error);
    }
};

// =====================================================
// GET /api/productos/search/:term
// Buscar productos por nombre (VULNERABLE - SQL Injection)
// =====================================================
export const searchProducts = async (req, res, next) => {
    try {
        const { term } = req.params;

        console.log(
            `🔍 GET /api/productos/search/${term} - Searching products`
        );

        // ⚠️ VULNERABLE: SQL Injection en búsqueda
        // Esta construcción es MÁS VULNERABLE para permitir múltiples tipos de ataques:
        //
        // Payloads que funcionan:
        // 1. Bypass simple: ' OR '1'='1
        // 2. Comentarios: ' OR 1=1 --
        // 3. Union-based: ' UNION SELECT id,username,email,password,role,1,1,NOW(),NOW(),0 FROM users --
        // 4. Boolean-based: ' OR (SELECT COUNT(*) FROM users WHERE role='admin')>0 --
        // 5. Error-based: ' AND extractvalue(1,concat(0x7e,(SELECT password FROM users LIMIT 1))) --
        const query = `SELECT * FROM products WHERE nombre LIKE '%${term}%'`;

        console.log(`🔍 Executing search query: ${query}`);

        const products = await executeRawQuery(query);

        console.log(`✅ Search found ${products.length} products`);

        res.json({
            success: true,
            count: products.length,
            searchTerm: term,
            products: products,
        });
    } catch (error) {
        console.error(
            `❌ Error searching products with term "${req.params.term}":`,
            error.message
        );

        // ⚠️ VULNERABLE: Expone detalles del error SQL
        res.status(500).json({
            error: "Search failed",
            message: error.message,
            sql: error.sql, // Expone la query que falló
            searchTerm: req.params.term,
        });
    }
};

// =====================================================
// POST /api/productos
// Crear nuevo producto (ADMIN ONLY)
// =====================================================
export const createProduct = async (req, res, next) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, imagenUrl } =
            req.body;

        console.log(`📦 POST /api/productos - Creating new product: ${nombre}`);

        // Validación básica
        if (!nombre || !precio) {
            return res.status(400).json({
                error: "Validation error",
                message: "Name and price are required",
            });
        }

        // ⚠️ VULNERABLE: SQL Injection en INSERT
        const query = `
            INSERT INTO products (nombre, descripcion, precio, stock, categoria, imagenUrl) 
            VALUES ('${nombre}', '${descripcion || ""}', ${precio}, ${
            stock || 0
        }, '${categoria || ""}', '${imagenUrl || ""}')
        `;

        const result = await executeRawQuery(query);

        console.log(`✅ Product created with ID: ${result.insertId}`);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            productId: result.insertId,
            product: {
                id: result.insertId,
                nombre,
                descripcion,
                precio,
                stock,
                categoria,
                imagenUrl,
            },
        });
    } catch (error) {
        console.error("❌ Error creating product:", error.message);
        next(error);
    }
};

// =====================================================
// PUT /api/productos/:id
// Actualizar producto (ADMIN ONLY - VULNERABLE)
// =====================================================
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, categoria, imagenUrl } =
            req.body;

        console.log(`📦 PUT /api/productos/${id} - Updating product`);

        // ⚠️ VULNERABLE: SQL Injection en UPDATE
        const updates = [];
        if (nombre) updates.push(`nombre = '${nombre}'`);
        if (descripcion !== undefined)
            updates.push(`descripcion = '${descripcion}'`);
        if (precio !== undefined) updates.push(`precio = ${precio}`);
        if (stock !== undefined) updates.push(`stock = ${stock}`);
        if (categoria !== undefined) updates.push(`categoria = '${categoria}'`);
        if (imagenUrl !== undefined) updates.push(`imagenUrl = '${imagenUrl}'`);

        if (updates.length === 0) {
            return res.status(400).json({
                error: "Validation error",
                message: "No fields to update",
            });
        }

        const query = `UPDATE products SET ${updates.join(
            ", "
        )} WHERE id = '${id}'`;

        const result = await executeRawQuery(query);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Product not found",
                message: `No product found with id: ${id}`,
            });
        }

        console.log(`✅ Product ${id} updated successfully`);

        res.json({
            success: true,
            message: "Product updated successfully",
            productId: id,
        });
    } catch (error) {
        console.error(
            `❌ Error updating product ${req.params.id}:`,
            error.message
        );
        next(error);
    }
};

// =====================================================
// DELETE /api/productos/:id
// Eliminar producto (ADMIN ONLY - VULNERABLE)
// =====================================================
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(`📦 DELETE /api/productos/${id} - Deleting product`);

        // ⚠️ VULNERABLE: SQL Injection en DELETE
        const query = `DELETE FROM products WHERE id = '${id}'`;

        const result = await executeRawQuery(query);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Product not found",
                message: `No product found with id: ${id}`,
            });
        }

        console.log(`✅ Product ${id} deleted successfully`);

        res.json({
            success: true,
            message: "Product deleted successfully",
            productId: id,
        });
    } catch (error) {
        console.error(
            `❌ Error deleting product ${req.params.id}:`,
            error.message
        );
        next(error);
    }
};
