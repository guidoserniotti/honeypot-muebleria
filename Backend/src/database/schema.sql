-- =====================================================
-- HONEYPOT DATABASE SCHEMA
-- ⚠️ VULNERABLE BY DESIGN - EDUCATIONAL USE ONLY ⚠️
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS honeypot_db;
USE honeypot_db;

-- Desactivar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- TABLA: users
-- Usuarios del sistema con credenciales débiles
-- =====================================================

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Passwords stored in plain text (VULNERABLE)',
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: products
-- Productos de la tienda (mueblería)
-- =====================================================

DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    categoria VARCHAR(100),
    imagenUrl VARCHAR(500),
    detalle JSON,
    destacado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_precio (precio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: orders
-- Órdenes de compra
-- =====================================================

DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: order_items
-- Items de cada orden
-- =====================================================

DROP TABLE IF EXISTS order_items;

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: audit_log (para tracking de ataques)
-- =====================================================

DROP TABLE IF EXISTS audit_log;

CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- INSERTAR USUARIOS VULNERABLES
-- ⚠️ Contraseñas en texto plano (VULNERABLE)
-- =====================================================

INSERT INTO users (username, email, password, role) VALUES
-- Credenciales súper débiles para admin
('admin', 'admin@honeypot.com', 'admin', 'admin'),
('administrator', 'administrator@honeypot.com', 'password', 'admin'),
('root', 'root@honeypot.com', 'root123', 'admin'),

-- Usuarios regulares con contraseñas débiles
('user', 'user@honeypot.com', 'user123', 'user'),
('test', 'test@honeypot.com', 'test', 'user'),
('guest', 'guest@honeypot.com', 'guest', 'user'),

-- Usuario backdoor "olvidado" por los devs
('dev_backup', 'dev@honeypot.com', 'Dev@2024!', 'admin'),
('service_account', 'service@honeypot.com', 'ServicePass123', 'admin');

-- =====================================================
-- INSERTAR PRODUCTOS DE EJEMPLO
-- =====================================================

INSERT INTO products (nombre, descripcion, precio, stock, categoria, imagenUrl, detalle, destacado) VALUES
-- Sala de Estar
('Sofá Patagonia', 'Sofá moderno de 3 cuerpos tapizado en tela premium', 89999.99, 8, 'sala', 'Sofá Patagonia.png', '{"material": "Tela premium", "medidas": "220x90x85cm", "color": "Gris oscuro", "peso": "75kg"}', TRUE),
('Sillón Copacabana', 'Sillón individual de diseño contemporáneo', 45900.00, 12, 'sala', 'Sillón Copacabana.png', '{"material": "Cuero sintético", "medidas": "85x80x90cm", "color": "Marrón", "peso": "30kg"}', FALSE),
('Butaca Mendoza', 'Butaca estilo clásico con respaldo alto', 38500.00, 15, 'sala', 'Butaca Mendoza.png', '{"material": "Tela", "medidas": "75x70x100cm", "color": "Beige", "peso": "22kg"}', FALSE),
('Mesa de Centro Araucaria', 'Mesa de centro de madera maciza con detalles en metal', 24900.00, 20, 'sala', 'Mesa de Centro Araucaria.png', '{"material": "Madera y metal", "medidas": "100x60x45cm", "color": "Natural", "peso": "18kg"}', FALSE),

-- Comedor
('Mesa Comedor Pampa', 'Mesa de comedor extensible para 6-8 personas', 65000.00, 6, 'comedor', 'Mesa Comedor Pampa.png', '{"material": "Madera maciza", "medidas": "180x90x75cm", "color": "Nogal", "peso": "55kg"}', TRUE),
('Sillas Córdoba', 'Set de 4 sillas de comedor tapizadas', 42000.00, 10, 'comedor', 'Sillas Córdoba.png', '{"material": "Madera y tela", "medidas": "45x50x95cm c/u", "color": "Gris", "peso": "8kg c/u"}', FALSE),
('Aparador Uspallata', 'Aparador de madera con puertas y cajones', 52000.00, 5, 'comedor', 'Aparador Uspallata.png', '{"material": "Madera", "medidas": "150x45x85cm", "color": "Roble", "peso": "42kg"}', FALSE),

-- Dormitorio
('Cama Neuquén', 'Cama matrimonial con cabecera acolchada', 78500.00, 8, 'dormitorio', 'Cama Neuquén.png', '{"material": "MDF y tela", "medidas": "160x200cm", "color": "Gris claro", "peso": "60kg"}', TRUE),
('Mesa de Noche Aconcagua', 'Mesa de luz con 2 cajones', 18900.00, 18, 'dormitorio', 'Mesa de Noche Aconcagua.png', '{"material": "MDF", "medidas": "45x40x50cm", "color": "Blanco", "peso": "12kg"}', FALSE),

-- Oficina
('Escritorio Costa', 'Escritorio ejecutivo con múltiples cajones', 55000.00, 10, 'oficina', 'Escritorio Costa.png', '{"material": "Melamina", "medidas": "140x60x75cm", "color": "Negro", "peso": "35kg"}', FALSE),
('Silla de Trabajo Belgrano', 'Silla ergonómica de oficina con soporte lumbar', 32000.00, 25, 'oficina', 'Silla de Trabajo Belgrano.png', '{"material": "Malla y metal", "medidas": "60x60x110cm", "color": "Negro", "peso": "15kg"}', FALSE),
('Biblioteca Recoleta', 'Biblioteca modular de 5 estantes', 48500.00, 7, 'oficina', 'Biblioteca Recoleta.png', '{"material": "Melamina", "medidas": "80x30x180cm", "color": "Blanco", "peso": "28kg"}', FALSE);

-- =====================================================
-- INSERTAR ÓRDENES DE EJEMPLO
-- =====================================================

INSERT INTO orders (user_id, total, status, shipping_address) VALUES
(4, 78499.99, 'completed', 'Av. Siempre Viva 123, Springfield'),
(5, 32500.00, 'processing', 'Calle Falsa 456, Ciudad'),
(6, 28900.00, 'pending', 'Boulevard Test 789, Pueblo');

-- =====================================================
-- INSERTAR ITEMS DE ÓRDENES
-- =====================================================

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 45999.99),
(1, 2, 1, 32500.00),
(2, 2, 1, 32500.00),
(3, 3, 1, 28900.00);

-- Reactivar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- CREAR USUARIO DE BASE DE DATOS (opcional)
-- Para producción, usar este usuario limitado
-- =====================================================

-- CREATE USER IF NOT EXISTS 'honeypot_user'@'%' IDENTIFIED BY 'vulnerable123';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON honeypot_db.* TO 'honeypot_user'@'%';
-- FLUSH PRIVILEGES;

-- =====================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- =====================================================

-- Ya están creados en la definición de tablas

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- ⚠️  ESTA BASE DE DATOS CONTIENE:
-- 1. Contraseñas en texto plano (NO hash)
-- 2. Usuarios con credenciales predecibles
-- 3. Sin encriptación de datos sensibles
-- 4. Cuenta backdoor "olvidada" (dev_backup)
-- 5. Logging básico en audit_log para rastrear ataques

-- ✅ TODO ESTO ES INTENCIONAL PARA EL HONEYPOT

SELECT 'Database schema created successfully!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_products FROM products;
