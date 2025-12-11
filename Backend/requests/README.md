# Carpeta Requests - Archivos .rest

Esta carpeta contiene archivos `.rest` para testear todos los endpoints del backend usando extensiones como **REST Client** en VS Code.

## Archivos Disponibles

### 1. `auth.rest` - Autenticación

Tests completos de autenticación:

-   Login con TODOS los usuarios del `schema.sql` (8 usuarios)
-   Registro de nuevos usuarios
-   Tests de credenciales incorrectas
-   Profile endpoint

**Usuarios disponibles para login:**

```
admin / admin
administrator / password
root / root123
user / user123
test / test
guest / guest
dev_backup / Dev@2024!
service_account / ServicePass123
```

### 2. `sql-injection.rest` - SQL Injection

20 tests de SQL Injection:

-   Comment bypass (`admin'--`)
-   Always true conditions (`' OR '1'='1`)
-   UNION attacks
-   Boolean blind
-   Error-based
-   User enumeration

### 3. `backdoor.rest` - Backdoor

Tests del header secreto `X-AccessDev: Testing-Mode`:

-   Acceso a endpoints admin sin JWT
-   Get users, stats, audit logs
-   Delete users
-   Fuzzing del header
-   Verificación de logs

### 4. `admin.rest` - Admin Endpoints

Tests con autenticación JWT:

-   Endpoints protegidos con token admin
-   Tests con token de usuario normal (deberían fallar)
-   Tests sin token
-   Tests con tokens inválidos

### 5. `complete-tests.rest` - Suite Completa

23 tests en secuencia:

-   Health checks
-   Todos los logins
-   SQL Injection principales
-   Backdoors
-   Validaciones

## Cómo Usar

### Opción 1: VS Code con REST Client

1. Instalar extensión **REST Client** de Huachao Mao
2. Abrir cualquier archivo `.rest`
3. Click en "Send Request" sobre cada test

### Opción 2: Usar variables

Los archivos usan variables para facilitar cambios:

```
@baseUrl = http://localhost:3000
@apiUrl = http://localhost:3000/api
```

### Opción 3: Copiar a curl/Postman

Cada request puede copiarse a curl o importarse a Postman.

## Orden Recomendado

### Para Principiantes:

1. `auth.rest` - Entender login normal
2. `sql-injection.rest` - Ver vulnerabilidades
3. `backdoor.rest` - Descubrir backdoor
4. `admin.rest` - Endpoints protegidos

### Para Testing Rápido:

1. `complete-tests.rest` - Ejecutar todo

### Para Pentesting:

1. `sql-injection.rest` - Explotar
2. `backdoor.rest` - Bypass auth
3. `admin.rest` - Escalar privilegios

## Tests Exitosos

Cuando funciona correctamente:

**Login Normal:**

```json
{
    "message": "Login successful",
    "token": "eyJhbGc...",
    "user": {
        "id": 1,
        "username": "admin",
        "role": "admin"
    }
}
```

**SQL Injection:**

```json
{
    "message": "Login successful",
    "token": "eyJhbGc...",
    "user": {
        "username": "admin" // ¡Sin necesitar password!
    }
}
```

**Backdoor:**

```json
{
  "message": "Users retrieved successfully",
  "count": 8,
  "users": [...],
  "accessedBy": "BACKDOOR ACCESS"
}
```

## Errores Comunes

### Error: "ECONNREFUSED"

**Causa:** El servidor no está corriendo
**Solución:**

```bash
cd Backend
npm run dev
```

### Error: "Invalid credentials"

**Causa:** Credenciales incorrectas o usuario no existe
**Solución:** Verificar que la BD esté inicializada:

```bash
npm run init-db
```

### Error: "Unauthorized" en admin endpoints

**Causa:** Falta token o header backdoor
**Solución:**

-   Con JWT: Agregar `Authorization: Bearer TOKEN`
-   Con backdoor: Agregar `X-AccessDev: Testing-Mode`

### SQL Injection no funciona

**Causa:** Posible sanitización activada
**Solución:** Verificar que el código use `executeRawQuery()` en login

## Ejercicios Sugeridos

### Nivel 1: Básico

-   [ ] Login con admin/admin
-   [ ] Login con todos los 8 usuarios
-   [ ] Intentar SQL Injection `admin'--`
-   [ ] Usar backdoor para ver usuarios

### Nivel 2: Intermedio

-   [ ] Probar 5 payloads SQL Injection diferentes
-   [ ] Enumerar usuarios con SQL Injection
-   [ ] Obtener token JWT y usarlo en admin endpoints
-   [ ] Ver audit logs con backdoor

### Nivel 3: Avanzado

-   [ ] Crear script que automatice todos los tests
-   [ ] Encontrar un payload SQL Injection no documentado
-   [ ] Combinar SQL Injection + Backdoor
-   [ ] Extraer toda la información de la BD

## Recursos Adicionales

-   **Backend README:** `../README.md`
-   **Guía de Explotación:** `../EXPLOITATION_GUIDE.md`
-   **Credenciales:** `../CREDENTIALS.md`
-   **Schema SQL:** `../src/database/schema.sql`

## Troubleshooting

### Servidor no responde

```bash
# Verificar que esté corriendo
curl http://localhost:3000/health

# Si no responde, iniciar
npm run dev
```

### BD no tiene datos

```bash
# Reinicializar BD
docker-compose down -v
docker-compose up -d
npm run init-db
```

### Tests dan error 500

```bash
# Ver logs del servidor
# (en la terminal donde corre npm run dev)
```

## Ayuda

Si necesitas ayuda:

1. Revisar logs del servidor
2. Verificar que Docker esté corriendo
3. Consultar `TROUBLESHOOTING.md` en la raíz
4. Ver ejemplos en `EXPLOITATION_GUIDE.md`

---

**Happy Testing!**
