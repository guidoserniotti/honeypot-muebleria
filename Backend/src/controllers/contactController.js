import { executeQuery } from "../config/database.js";

/**
 * ⚠️ VULNERABLE A SQL INJECTION ⚠️
 * Create a new contact message
 * NO utiliza prepared statements - concatena directamente la entrada del usuario
 */
export const createContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const ip_address = req.ip || req.connection.remoteAddress;

        // ⚠️ VULNERABLE: Concatenación directa de valores sin escapar
        // Esto permite SQL injection
        const query = `INSERT INTO contacts (nombre, email, mensaje, ip_address) VALUES ('${name}', '${email}', '${message}', '${ip_address}')`;

        console.log("❌ VULNERABLE QUERY:", query);

        const result = await executeQuery(query);

        res.status(201).json({
            message: "Contacto guardado correctamente",
            id: result.insertId,
            warning: "⚠️ Este endpoint es vulnerable a SQL Injection",
        });
    } catch (error) {
        console.error("❌ Contact creation error:", error);
        
        // ⚠️ Exponemos el error de SQL para facilitar debugging de inyecciones
        res.status(400).json({
            error: "Error al guardar el contacto",
            details: error.message,
            sqlError: error.sqlMessage || "SQL error information",
        });
    }
};

/**
 * ⚠️ VULNERABLE A SQL INJECTION ⚠️
 * Get contacts with vulnerable filtering
 */
export const getContacts = async (req, res) => {
    try {
        const { search } = req.query;

        // ⚠️ VULNERABLE: El parámetro search es concatenado directamente
        // Ejemplo: search=1' OR '1'='1 retornará todos los registros
        let query = "SELECT id, nombre, email, mensaje, created_at FROM contacts";

        if (search) {
            query += ` WHERE nombre LIKE '%${search}%' OR email LIKE '%${search}%'`;
        }

        console.log("❌ VULNERABLE QUERY:", query);

        const contacts = await executeQuery(query);

        res.json({
            message: "Contactos obtenidos",
            count: contacts.length,
            contacts,
            warning: "⚠️ Este endpoint es vulnerable a SQL Injection",
        });
    } catch (error) {
        console.error("❌ Get contacts error:", error);
        res.status(500).json({
            error: "Error al obtener contactos",
            sqlError: error.sqlMessage,
        });
    }
};

/**
 * ⚠️ VULNERABLE A SQL INJECTION ⚠️
 * Delete contacts - Sin validación
 */
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        // ⚠️ VULNERABLE: El ID viene directamente del usuario
        // Ejemplo: id=1 OR 1=1 eliminará todos los registros
        const query = `DELETE FROM contacts WHERE id = ${id}`;

        console.log("❌ VULNERABLE QUERY:", query);

        const result = await executeQuery(query);

        res.json({
            message: "Contacto eliminado",
            affectedRows: result.affectedRows,
            warning: "⚠️ Endpoint vulnerable permite DELETE masivo",
        });
    } catch (error) {
        console.error("❌ Delete contact error:", error);
        res.status(500).json({
            error: "Error al eliminar contacto",
            sqlError: error.sqlMessage,
        });
    }
};

/**
 * ⚠️ VULNERABLE A SQL INJECTION ⚠️
 * Get specific contact details
 */
export const getContactDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // ⚠️ VULNERABLE: Sin prepared statements
        // Permite UNION-based SQL injection
        const query = `SELECT * FROM contacts WHERE id = ${id}`;

        console.log("❌ VULNERABLE QUERY:", query);

        const contact = await executeQuery(query);

        if (contact.length === 0) {
            return res.status(404).json({ error: "Contact not found" });
        }

        res.json({
            contact: contact[0],
            warning: "⚠️ Este endpoint expone información sensible",
        });
    } catch (error) {
        console.error("❌ Get contact details error:", error);
        res.status(500).json({
            error: "Error al obtener detalles del contacto",
            sqlError: error.sqlMessage,
        });
    }
};
