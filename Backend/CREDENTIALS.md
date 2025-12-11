# Credenciales y Configuración - Referencia Rápida

## URLs del Sistema

| Servicio    | URL                   | Descripción             |
| ----------- | --------------------- | ----------------------- |
| Backend API | http://localhost:3000 | Servidor Express.js     |
| Frontend    | http://localhost:5173 | Aplicación React (Vite) |
| phpMyAdmin  | http://localhost:8080 | Administrador MySQL     |
| MySQL       | localhost:3306        | Base de datos           |

---

## Usuarios de la Aplicación

### Usuarios Admin (Privilegios Completos)

```
Usuario: admin
Password: admin
Email: admin@honeypot.local
Rol: admin
Estado: Activo

Usuario: administrator
Password: password
Email: administrator@honeypot.local
Rol: admin
Estado: Activo

Usuario: root
Password: root123
Email: root@honeypot.local
Rol: admin
Estado: Activo

Usuario: dev_backup
Password: Dev@2024!
Email: dev_backup@honeypot.local
Rol: admin
Estado: Activo

Usuario: service_account
Password: ServicePass123
Email: service@honeypot.local
Rol: admin
Estado: Activo
```

### Usuarios Normales (Permisos Limitados)

```
Usuario: user1
Password: user123
Email: user1@honeypot.local
Rol: user
Estado: Activo

Usuario: testuser
Password: test123
Email: test@honeypot.local
Rol: user
Estado: Activo

Usuario: guest
Password: guest
Email: guest@honeypot.local
Rol: user
Estado: Inactivo
```

---

## Credenciales de Base de Datos

### MySQL Root

```
Host: localhost
Port: 3306
Usuario: root
Password: vulnerable123
Database: honeypot_db
```

### phpMyAdmin

```
URL: http://localhost:8080
Usuario: root
Password: vulnerable123
```

### Conexión desde código

```javascript
// .env
DB_HOST = localhost;
DB_PORT = 3306;
DB_USER = root;
DB_PASSWORD = vulnerable123;
DB_NAME = honeypot_db;
```

---

## Backdoor Secret

### Header de Bypass

```
Header: X-AccessDev
Valor: Testing-Mode
```

### Uso en cURL

```bash
curl http://localhost:3000/api/admin/users \
  -H "X-AccessDev: Testing-Mode"
```

### Uso en JavaScript

```javascript
const headers = {
    "X-AccessDev": "Testing-Mode",
};

fetch("http://localhost:3000/api/admin/users", { headers })
    .then((res) => res.json())
    .then((data) => console.log(data));
```

### Uso en PowerShell

```powershell
$headers = @{ "X-AccessDev" = "Testing-Mode" }
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/users" -Headers $headers
```

---

## JWT Configuration

```
JWT_SECRET=weak_secret_key_123
JWT_EXPIRES_IN=24h
```

**Warning:** Secret intencionalmente débil para facilitar cracking en ejercicios de pentesting.

---

## SQL Injection Payloads

### Login Bypass

```sql
-- Payload 1: Comment bypass
Username: admin'--
Password: (cualquier cosa)

-- Payload 2: Always true
Username: ' OR '1'='1
Password: (cualquier cosa)

-- Payload 3: Admin específico
Username: admin' OR 1=1--
Password: x

-- Payload 4: UNION injection
Username: ' UNION SELECT 1,'admin','admin@h.com','pass','admin',1,NULL,NULL,NULL--
Password: x
```

### En formato JSON (cURL)

```json
{
    "username": "admin'--",
    "password": "anything"
}
```

---

## CORS Configuration

```
CORS_ORIGIN=http://localhost:5173
```

Permite requests desde el frontend React.

---

## Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=vulnerable123
DB_NAME=honeypot_db

# JWT
JWT_SECRET=weak_secret_key_123
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Backdoor
BACKDOOR_DEV_HEADER=Testing-Mode

# Logging
LOG_LEVEL=debug
```

---

## Docker Configuration

### docker-compose.yml Services

```yaml
services:
    mysql:
        image: mysql:8.0
        ports: 3306:3306
        root_password: vulnerable123
        database: honeypot_db

    phpmyadmin:
        image: phpmyadmin
        ports: 8080:80
        depends_on: mysql
```

### Comandos Docker Útiles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f mysql

# Parar servicios
docker-compose down

# Parar y borrar volúmenes (reset total)
docker-compose down -v

# Acceder a MySQL CLI
docker exec -it honeypot-mysql mysql -u root -pvulnerable123 honeypot_db

# Ver usuarios en BD
docker exec honeypot-mysql mysql -u root -pvulnerable123 -e "SELECT username, email, role FROM honeypot_db.users;"
```

---

## Testing Quick Reference

### Test Login Normal

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### Test SQL Injection

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":"x"}'
```

### Test Backdoor

```bash
curl http://localhost:3000/api/admin/users \
  -H "X-AccessDev: Testing-Mode"
```

### Test Health

```bash
curl http://localhost:3000/health
```

### PowerShell Tests

```powershell
# Test completo
.\test-final.ps1

# Solo SQL Injection
.\test-sql-injection.ps1

# Solo Backdoor
.\test-backdoor.ps1
```

---

## Database Tables

### users

```sql
SELECT * FROM users;

Columns:
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE)
- email (VARCHAR(100), UNIQUE)
- password (VARCHAR(255)) -- Texto plano
- role (ENUM('admin', 'user'))
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)
- login_attempts (INT)
```

### products

```sql
SELECT * FROM products;

6 productos de ejemplo:
- Silla Gaming
- Mesa Escritorio
- Estantería
- Sofá 3 Plazas
- Cama Queen Size
- Armario 4 Puertas
```

### orders

```sql
SELECT * FROM orders;

3 órdenes de ejemplo vinculadas a usuarios
```

### audit_log

```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10;

Registra:
- user_login
- user_registered
- backdoor_access
- profile_accessed
```

---

## Queries SQL Útiles

### Ver todos los usuarios con sus roles

```sql
SELECT id, username, email, password, role, is_active
FROM users
ORDER BY role DESC, username;
```

### Ver logs de backdoor

```sql
SELECT * FROM audit_log
WHERE action = 'backdoor_access'
ORDER BY created_at DESC;
```

### Contar accesos por tipo

```sql
SELECT action, COUNT(*) as count
FROM audit_log
GROUP BY action
ORDER BY count DESC;
```

### Ver últimos logins

```sql
SELECT u.username, u.email, a.created_at, a.ip_address
FROM audit_log a
JOIN users u ON a.user_id = u.id
WHERE a.action = 'user_login'
ORDER BY a.created_at DESC
LIMIT 10;
```

### Cambiar rol de usuario a admin

```sql
UPDATE users
SET role = 'admin'
WHERE username = 'user1';
```

### Eliminar usuario

```sql
DELETE FROM users
WHERE username = 'guest';
```

### Resetear intentos de login

```sql
UPDATE users
SET login_attempts = 0;
```

---

## Comandos de Inicio Rápido

### Backend

```bash
cd ENTREGA/Backend

# Instalar dependencias
npm install

# Iniciar MySQL
docker-compose up -d

# Inicializar BD
npm run init-db

# Iniciar servidor (desarrollo)
npm run dev

# Iniciar servidor (producción)
npm start
```

### Frontend (opcional)

```bash
cd ENTREGA/front

# Instalar dependencias
npm install

# Iniciar dev server
npm run dev

# Build para producción
npm run build
```

---

## API Endpoints Rápidos

| Método | Endpoint                | Auth      | Backdoor | Descripción            |
| ------ | ----------------------- | --------- | -------- | ---------------------- |
| GET    | `/`                     | No        | No       | Info API               |
| GET    | `/health`               | No        | No       | Health check           |
| POST   | `/api/auth/login`       | No        | No       | Login (vulnerable SQL) |
| POST   | `/api/auth/register`    | No        | No       | Registro               |
| GET    | `/api/auth/profile`     | JWT       | No       | Perfil usuario         |
| GET    | `/api/admin/users`      | JWT Admin | Sí       | Listar usuarios        |
| GET    | `/api/admin/stats`      | JWT Admin | Sí       | Estadísticas           |
| GET    | `/api/admin/audit-logs` | JWT Admin | Sí       | Logs auditoría         |
| DELETE | `/api/admin/users/:id`  | JWT Admin | Sí       | Eliminar usuario       |

---

## Checklist de Configuración

### Primera vez

-   [ ] Clonar repositorio
-   [ ] `npm install` en Backend
-   [ ] Crear archivo `.env` con las credenciales
-   [ ] `docker-compose up -d`
-   [ ] Esperar a que MySQL esté healthy
-   [ ] `npm run init-db`
-   [ ] `npm run dev`
-   [ ] Probar con `curl http://localhost:3000/health`

### Cada sesión

-   [ ] `docker-compose up -d` (si no está corriendo)
-   [ ] `npm run dev` en Backend
-   [ ] (Opcional) `npm run dev` en Frontend
-   [ ] Probar con scripts de testing

### Troubleshooting

-   [ ] Verificar Docker: `docker ps`
-   [ ] Verificar puerto 3000: `netstat -ano | findstr :3000`
-   [ ] Ver logs: `docker-compose logs mysql`
-   [ ] Reiniciar MySQL: `docker-compose restart mysql`
-   [ ] Reset completo: `docker-compose down -v && docker-compose up -d`

---

## Backup y Reset

### Backup de Base de Datos

```bash
docker exec honeypot-mysql mysqldump -u root -pvulnerable123 honeypot_db > backup.sql
```

### Restaurar Backup

```bash
docker exec -i honeypot-mysql mysql -u root -pvulnerable123 honeypot_db < backup.sql
```

### Reset a Estado Inicial

```bash
# Parar y eliminar todo
docker-compose down -v

# Iniciar de nuevo
docker-compose up -d

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Reinicializar BD
npm run init-db
```

---

## Contactos de Referencia

-   README.md - Documentación completa
-   EXPLOITATION_GUIDE.md - Guía de hacking
-   PROYECTO_RESUMEN.md - Resumen ejecutivo
-   test-\*.ps1 - Scripts de testing

---

**Happy Hacking!**

_Recuerda: Solo para fines educativos en entornos aislados._
