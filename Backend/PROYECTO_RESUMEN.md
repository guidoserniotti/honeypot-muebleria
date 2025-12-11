# Honeypot Security Lab - Resumen del Proyecto

## Descripción General

Aplicación web full-stack con **vulnerabilidades intencionales** para educación en ciberseguridad, compuesta por:

-   **Frontend:** React 19 + Vite (puerto 5173)
-   **Backend:** Node.js + Express.js (puerto 3000)
-   **Database:** MySQL 8.0 en Docker (puerto 3306)
-   **Admin Tool:** phpMyAdmin (puerto 8080)

---

## Objetivos Completados

### 1. Backend con Express.js

-   Servidor Express configurado con ES modules
-   Estructura MVC (Models, Views, Controllers)
-   Middlewares personalizados
-   Manejo centralizado de errores
-   Logging de requests con Morgan

### 2. Base de Datos MySQL

-   Docker Compose configurado
-   Schema completo con 5 tablas:
    -   `users` (8 usuarios con passwords en texto plano)
    -   `products` (productos de la mueblería)
    -   `orders` (órdenes de compra)
    -   `order_items` (detalles de órdenes)
    -   `contacts` (formulario de contacto - VULNERABLE)
    -   `audit_log` (registro de acciones)

### 3. SQL Injection en Login

**Endpoint vulnerable:** `POST /api/auth/login`

```javascript
// Código vulnerable intencional
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

**Exploits funcionales:**

-   `admin'--` - Comment bypass
-   `' OR '1'='1` - Always true condition
-   UNION-based injection

### 4. SQL Injection en Formulario de Contacto

**Endpoints vulnerables:** `POST /api/contacts`, `GET /api/contacts`, `DELETE /api/contacts/:id`

```javascript
// Código vulnerable intencional
const query = `INSERT INTO contacts (nombre, email, mensaje, ip_address) 
               VALUES ('${name}', '${email}', '${message}', '${ip_address}')`;
```

**Características:**

-   Concatenación directa sin prepared statements
-   Errores SQL expuestos en respuestas
-   Permite stacked queries (multipleStatements: true)
-   Sin validación ni sanitización

### 5. Backdoor con Header Personalizado

**Header secreto:** `X-AccessDev: Testing-Mode`

-   Middleware `backdoorMiddleware.js` que detecta el header
-   Bypass completo de autenticación JWT
-   Acceso con privilegios de administrador
-   Todos los accesos registrados en `audit_log`

**Endpoints vulnerables:**

-   `GET /api/admin/users` - Lista usuarios
-   `GET /api/admin/stats` - Estadísticas
-   `GET /api/admin/audit-logs` - Logs
-   `DELETE /api/admin/users/:id` - Eliminar usuarios

### 6. Credenciales Débiles

| Usuario         | Contraseña     | Rol   |
| --------------- | -------------- | ----- |
| admin           | admin          | admin |
| administrator   | password       | admin |
| root            | root123        | admin |
| dev_backup      | Dev@2024!      | admin |
| service_account | ServicePass123 | admin |
| user1           | user123        | user  |
| testuser        | test123        | user  |
| guest           | guest          | user  |

**Passwords almacenadas en texto plano** (vulnerabilidad intencional)

---

## Estructura de Archivos

```
Backend/
├── src/
│   ├── server.js                  # Servidor principal
│   ├── config/
│   │   ├── config.js              # Configuración general
│   │   └── database.js            # Conexión MySQL + queries
│   ├── controllers/
│   │   ├── authController.js      # Login VULNERABLE
│   │   ├── adminController.js     # Endpoints admin
│   │   ├── contactController.js   # CRUD Contactos VULNERABLE
│   │   ├── productController.js   # Gestión de productos
│   │   └── orderController.js     # Gestión de órdenes
│   ├── middlewares/
│   │   ├── backdoorMiddleware.js  # BACKDOOR con header secreto
│   │   ├── authMiddleware.js      # Validación JWT
│   │   └── adminGuard.js          # Verificar rol admin
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── contactRoutes.js       # Rutas vulnerables de contactos
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── database/
│   │   └── schema.sql             # Schema + seeds
│   └── scripts/
│       └── initDatabase.js        # Script de inicialización
├── requests/
│   ├── auth.rest
│   ├── sql-injection.rest
│   ├── contact-injection.rest     # Tests de SQL injection en contactos
│   ├── backdoor.rest
│   ├── admin.rest
│   ├── products.rest
│   ├── orders.rest
│   └── complete-tests.rest
├── docker-compose.yml             # MySQL + phpMyAdmin
├── package.json
├── .env.example
├── README.md                      # Documentación completa
└── test-*.ps1                     # Scripts de testing PowerShell

front/
├── src/
│   ├── App.jsx
│   ├── service/
│   │   └── api.js                 # Cliente API
│   ├── pages/
│   │   ├── ContactForm.jsx        # Formulario de contacto
│   │   └── ...
│   └── ...
├── public/
│   └── index.html                 # Hint del backdoor en HTML
├── package.json
└── vite.config.js
```

---

## Inicio Rápido

### Prerrequisitos

-   Node.js 18+
-   Docker Desktop
-   PowerShell (para tests)

### Instalación

```bash
# 1. Backend
cd Backend
npm install

# 2. Iniciar base de datos
docker-compose up -d

# 3. Crear schema y datos
npm run init-db

# 4. Iniciar servidor
npm run dev

# 5. En otra terminal - Frontend (opcional)
cd ../front
npm install
npm run dev
```

### Verificación

```bash
# Health check
curl http://localhost:3000/health

# Login normal
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# SQL Injection
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":"x"}'

# Backdoor
curl http://localhost:3000/api/admin/users \
  -H "X-AccessDev: Testing-Mode"

# SQL Injection en contactos
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"test'\'' OR '\''1'\''='\''1","email":"test@test.com","message":"msg"}'
```

---

## Testing

Scripts de PowerShell incluidos:

```powershell
# Test completo (7 tests)
.\test-final.ps1

# Solo SQL Injection
.\test-sql-injection.ps1

# Solo Backdoor
.\test-backdoor.ps1

# Test rápido
.\test-simple.ps1
```

**Tests incluidos:**

1. Login normal (admin/admin)
2. SQL Injection bypass en login
3. Protección de endpoints sin auth
4. Backdoor - Listar usuarios
5. Backdoor - Estadísticas
6. Backdoor - Audit logs
7. Health check
8. SQL Injection en formulario de contacto

---

## Vulnerabilidades Implementadas

### 1. SQL Injection en Login

-   **Severidad:** CRÍTICA
-   **Endpoint:** `POST /api/auth/login`
-   **Tipo:** String concatenation sin sanitización
-   **CVSS:** 9.8 (Critical)

### 2. 🔓 Credenciales Débiles

-   **Severidad:** ALTA
-   **Ubicación:** Base de datos
-   **Problema:** 8 usuarios con passwords débiles y en texto plano
-   **CVSS:** 8.1 (High)

### 3. 🚪 Backdoor de Autenticación

-   **Severidad:** CRÍTICA
-   **Header:** `X-AccessDev: Testing-Mode`
-   **Impacto:** Bypass total de autenticación con privilegios admin
-   **CVSS:** 10.0 (Critical)

### 4. 🔐 Passwords sin Hash

-   **Severidad:** CRÍTICA
-   **Problema:** Contraseñas almacenadas en texto plano
-   **Impacto:** Exposición total de credenciales si hay breach
-   **CVSS:** 9.8 (Critical)

### 5. ⚙️ Configuración Insegura

-   **Severidad:** MEDIA
-   **Problemas:**
    -   JWT secret débil
    -   Sin rate limiting
    -   CORS permisivo
-   **CVSS:** 5.3 (Medium)

---

## Estadísticas del Proyecto

### Código

-   **Lenguajes:** JavaScript (Node.js), SQL
-   **Framework Backend:** Express.js 4.18.2
-   **Framework Frontend:** React 19.2.0
-   **Database:** MySQL 8.0
-   **Líneas de código:** ~3,000+

### Archivos Clave

-   20+ archivos JavaScript (backend)
-   15+ endpoints de API
-   5 tablas de base de datos
-   8 usuarios seed
-   4 scripts de testing PowerShell
-   8 archivos REST para testing

### Testing

-   8 tests automatizados
-   5 vulnerabilidades críticas implementadas
-   100% de cobertura de vulnerabilidades

---

## Documentación

### README.md

Documentación completa con:

-   Instalación paso a paso
-   Descripción de todas las vulnerabilidades
-   Endpoints API completos
-   Estado actual del proyecto
-   Comandos útiles
-   Troubleshooting extendido

### Archivos REST

Archivos de prueba para VS Code REST Client:

-   `auth.rest` - Autenticación
-   `sql-injection.rest` - SQL injection en login
-   `contact-injection.rest` - SQL injection en contactos
-   `backdoor.rest` - Uso del backdoor
-   `admin.rest`, `products.rest`, `orders.rest`

### Código Documentado

-   Comentarios JSDoc en funciones importantes
-   Warnings de seguridad en código vulnerable
-   Hints para facilitar el descubrimiento
-   Logs descriptivos de queries vulnerables

---

## Uso Educativo

### Para Estudiantes

-   Aprender sobre vulnerabilidades web comunes
-   Practicar SQL Injection en entorno seguro
-   Entender autenticación y autorización
-   Análisis de logs y forense digital
-   Experimentar con diferentes tipos de inyección SQL

### Para Instructores

-   Laboratorio listo para usar
-   Múltiples niveles de dificultad
-   Documentación completa
-   Scripts de testing automatizados
-   Ejemplos prácticos de código vulnerable vs seguro

### Para Pentesters

-   Práctica de reconocimiento
-   Testing de exploits
-   Automatización de ataques
-   Documentación de hallazgos
-   Análisis de logs de auditoría

---

## Advertencias de Seguridad

1. **NUNCA usar en producción**
2. **NUNCA exponer a internet**
3. **Solo en entornos aislados (Docker/VM)**
4. **Solo con fines educativos**
5. **Obtener permiso explícito antes de pentesting**
6. **No utilizar estas técnicas en sistemas sin autorización**

---

## Tecnologías Utilizadas

### Backend

-   Node.js 18+
-   Express.js 4.18.2
-   MySQL 8.0 (via mysql2)
-   JWT (jsonwebtoken)
-   bcryptjs (no usado intencionalmente)
-   Morgan (logging)
-   Cors
-   Dotenv

### Frontend

-   React 19.2.0
-   Vite 7.2.4
-   React Router DOM 7.9.5
-   Axios (para API calls)

### DevOps

-   Docker & Docker Compose
-   phpMyAdmin
-   nodemon (auto-reload)

### Testing

-   PowerShell scripts
-   REST Client (VS Code extension)
-   curl commands

---

## Siguientes Pasos Sugeridos

### Mejoras Posibles

-   Agregar más tipos de SQL Injection (Blind, Time-based)
-   Implementar XSS (Cross-Site Scripting)
-   Agregar CSRF vulnerability
-   Implementar File Upload vulnerability
-   Agregar IDOR (Insecure Direct Object Reference)
-   Crear panel de monitoring de ataques
-   Implementar honeytokens
-   Agregar modo de simulación para inspeccionar queries sin ejecutarlas

### Para Aprendizaje

-   Resolver todas las vulnerabilidades (versión hardened)
-   Comparar código vulnerable vs seguro
-   Implementar WAF (Web Application Firewall)
-   Crear IDS/IPS rules
-   Documentar informe de pentesting completo
-   Implementar prepared statements en todos los endpoints

---

## Logros del Proyecto

-   Backend funcional con Express.js
-   MySQL configurado en Docker
-   SQL Injection implementada en login y contactos
-   Backdoor funcional con auditoría
-   8 usuarios con credenciales débiles
-   Documentación completa y actualizada
-   Scripts de testing automatizados (PowerShell)
-   Archivos REST para testing interactivo
-   Frontend con React y Vite
-   Hints dejados para facilitar descubrimiento
-   Logging completo en audit_log
-   Sistema CRUD de productos y órdenes
-   Formulario de contacto vulnerable
-   multipleStatements habilitado para stacked queries

---

## Soporte

Si encuentras problemas:

1. Revisar README.md sección Troubleshooting
2. Verificar que Docker esté corriendo
3. Revisar logs del servidor: `npm run dev`
4. Revisar logs de MySQL: `docker-compose logs mysql`
5. Verificar que multipleStatements esté habilitado en database.js
6. Comprobar que los archivos REST estén usando los endpoints correctos

---

## Licencia

Proyecto educativo - Solo para fines de aprendizaje

**DISCLAIMER:** Este código contiene vulnerabilidades intencionales. Los autores no se hacen responsables del mal uso de este software.

---

## Créditos

Proyecto desarrollado como laboratorio de seguridad informática para:

-   Aprendizaje de vulnerabilidades web
-   Práctica de pentesting ético
-   Educación en ciberseguridad

**Fecha:** Diciembre 2025
**Stack:** MERN (MySQL, Express, React, Node.js)
**Propósito:** Educación en seguridad

---

## Conclusión

Este proyecto cumple exitosamente con todos los objetivos:

1. Backend vulnerable con Express.js
2. MySQL con datos de prueba
3. SQL Injection funcional en múltiples endpoints
4. Backdoor con header personalizado
5. Documentación completa y actualizada
6. Scripts de testing automatizados
7. Sistema completo de productos y órdenes
8. Formulario de contacto con vulnerabilidades

**El honeypot está listo para ser explotado con fines educativos.**

---

**IMPORTANTE:** Este código contiene vulnerabilidades intencionales. NUNCA usar en producción o exponer a internet.
