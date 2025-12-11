# Honeypot Backend - MySQL Configuration

## Paso 2 Completado: MySQL Configurado

### Archivos Creados:

1. **`src/config/database.js`** - Conexión a MySQL con funciones vulnerables
2. **`src/database/schema.sql`** - Schema completo con datos de prueba
3. **`src/scripts/initDatabase.js`** - Script de inicialización
4. **`docker-compose.yml`** - Configuración de Docker con MySQL + phpMyAdmin
5. **`src/server.js`** - Actualizado para conectar con DB

### Base de Datos Inicializada:

**Tablas creadas:**

-   `users` (8 usuarios con contraseñas en texto plano)
-   `products` (6 productos de mueblería)
-   `orders` (3 órdenes de ejemplo)
-   `order_items` (4 items de órdenes)
-   `audit_log` (para tracking de ataques)

**Credenciales Admin Vulnerables:**

```
admin / admin
administrator / password
root / root123
dev_backup / Dev@2024!
service_account / ServicePass123
```

### Docker Services:

-   MySQL 8.0 corriendo en `localhost:3306`
-   phpMyAdmin en `http://localhost:8080`

### Comandos Útiles:

```bash
# Iniciar MySQL
docker-compose up -d mysql

# Ver logs de MySQL
docker logs honeypot-mysql

# Acceder a MySQL CLI
docker exec -it honeypot-mysql mysql -uroot -pvulnerable123

# Inicializar/Resetear base de datos
npm run init-db

# Detener MySQL
docker-compose down
```

### Funciones Vulnerables Implementadas:

1. **`executeRawQuery()`** - Permite SQL injection directo
2. **`executeQuery()`** - Usa prepared statements (más seguro pero loguea todo)
3. **Passwords en texto plano** - Almacenadas sin hash
4. **Logging verbose** - Muestra todas las queries en consola

---

**Estado: MySQL completamente funcional y listo para ataques.**
