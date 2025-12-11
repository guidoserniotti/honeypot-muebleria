# Guía de Conexión Frontend-Backend

## Verificación Completada

El backend está correctamente configurado y funcionando. Los archivos `.rest` en la carpeta `requests/` están listos para usar.

---

## Usuarios Disponibles para Login

Todos estos usuarios están en `schema.sql` y pueden usarse desde el frontend:

### Usuarios Admin (Rol: admin)

```javascript
// Usuario 1
username: "admin";
password: "admin";

// Usuario 2
username: "administrator";
password: "password";

// Usuario 3
username: "root";
password: "root123";

// Usuario 4 (Backdoor "olvidado")
username: "dev_backup";
password: "Dev@2024!";

// Usuario 5 (Service Account)
username: "service_account";
password: "ServicePass123";
```

### Usuarios Normales (Rol: user)

```javascript
// Usuario 6
username: "user";
password: "user123";

// Usuario 7
username: "test";
password: "test";

// Usuario 8
username: "guest";
password: "guest";
```

---

## Configuración del Frontend

### 1. Archivo `.env` del Frontend

Verificar que tenga:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Backdoor (opcional - para desarrollo)
VITE_DEV_BYPASS_ENABLED=true
```

### 2. LoginForm Component

El componente de login debería enviar:

```javascript
// Ejemplo de login request
const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        username: "admin", // o cualquiera de los 8 usuarios
        password: "admin",
    }),
});

const data = await response.json();
// data.token -> JWT token
// data.user -> Información del usuario
```

### 3. Respuesta Esperada del Backend

**Login exitoso:**

```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@honeypot.com",
        "role": "admin"
    }
}
```

**Login fallido:**

```json
{
    "error": "Invalid credentials",
    "message": "Username or password incorrect"
}
```

---

## Testing desde Frontend

### Opción 1: Usar los archivos .rest

1. Abrir VS Code
2. Instalar extensión "REST Client"
3. Abrir `Backend/requests/auth.rest`
4. Click en "Send Request" sobre cualquier test
5. Ver la respuesta

### Opción 2: Usar el script de verificación

```powershell
cd Backend
.\test-connection.ps1
```

Este script verifica:

-   Backend respondiendo
-   Login funciona con admin/admin
-   SQL Injection funciona
-   Backdoor funciona

### Opción 3: Desde el navegador/Postman

**Login normal:**

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

---

## Troubleshooting

### Error: "Network Error" o "Failed to fetch"

**Causa:** Backend no está corriendo

**Solución:**

```bash
cd Backend
npm run dev
```

Verificar que veas:

```
Server running on: http://localhost:3000
```

### Error: "Invalid credentials" con credenciales correctas

**Causa:** Base de datos no inicializada

**Solución:**

```bash
# 1. Asegurar que MySQL esté corriendo
docker-compose up -d

# 2. Inicializar BD
npm run init-db
```

### Error: "CORS policy" en el navegador

**Causa:** CORS no configurado correctamente

**Solución:** El backend ya tiene CORS configurado para `http://localhost:5173`

Verificar en `.env` del backend:

```env
CORS_ORIGIN=http://localhost:5173
```

### Error 400: "Username and password are required"

**Causa:** Frontend no envía los campos correctamente

**Solución:** Verificar que el body sea:

```javascript
{
  username: "admin",  // NO "user" o "email"
  password: "admin"   // NO "pass" o "pwd"
}
```

---

## Ejemplos de Código para el Frontend

### Login Service (service/login.jsx)

```javascript
export const loginRequest = async (credentials) => {
    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al iniciar sesión");
        }

        const data = await response.json();

        // Guardar token en localStorage
        localStorage.setItem("authToken", data.token);

        // Guardar info del usuario
        localStorage.setItem("user", JSON.stringify(data.user));

        return data;
    } catch (error) {
        console.error("Error en login:", error);
        throw error;
    }
};
```

### LoginForm Component

```jsx
const LoginForm = () => {
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginRequest(credentials);

            // Login exitoso
            console.log("Login exitoso:", data.user);

            // Redirigir o actualizar estado
            window.location.href = "/dashboard"; // O usar navigate
        } catch (err) {
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={credentials.username}
                onChange={(e) =>
                    setCredentials({
                        ...credentials,
                        username: e.target.value,
                    })
                }
                required
            />

            <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={credentials.password}
                onChange={(e) =>
                    setCredentials({
                        ...credentials,
                        password: e.target.value,
                    })
                }
                required
            />

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
        </form>
    );
};
```

---

## Casos de Prueba Recomendados

### Test 1: Login Admin

```
Username: admin
Password: admin
Resultado esperado: Login exitoso, token recibido
```

### Test 2: Login Usuario Normal

```
Username: user
Password: user123
Resultado esperado: Login exitoso, rol "user"
```

### Test 3: Credenciales Incorrectas

```
Username: admin
Password: wrongpassword
Resultado esperado: Error "Invalid credentials"
```

### Test 4: Usuario Inexistente

```
Username: noexiste
Password: test123
Resultado esperado: Error "Invalid credentials"
```

### Test 5: SQL Injection desde Frontend

```
Username: admin'--
Password: cualquiercosa
Resultado esperado: Login exitoso (VULNERABLE!)
```

---

## Checklist de Verificación

Antes de usar el frontend, asegurar que:

-   Backend está corriendo en `http://localhost:3000`
-   Docker MySQL está corriendo (`docker ps`)
-   Base de datos está inicializada (`npm run init-db`)
-   Archivo `.env` del frontend tiene `VITE_API_URL=http://localhost:3000/api`
-   CORS está configurado en backend para `http://localhost:5173`
-   Los 8 usuarios existen en la BD (verificar en phpMyAdmin o MySQL)

### Comandos de Verificación:

```bash
# 1. Verificar backend
curl http://localhost:3000/health

# 2. Verificar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# 3. Verificar BD
docker exec -it honeypot-mysql mysql -u root -pvulnerable123 -e "SELECT username, role FROM honeypot_db.users;"
```

---

## Iniciar Todo el Sistema

### Terminal 1: Backend

```bash
cd Backend
docker-compose up -d
npm run init-db
npm run dev
```

Esperar a ver: `Honeypot ready for exploitation!`

### Terminal 2: Frontend (opcional)

```bash
cd front
npm run dev
```

Esperar a ver: `Local: http://localhost:5173`

### Terminal 3: Testing

```bash
cd Backend
.\test-connection.ps1
```

---

## Archivos .rest Disponibles

```
Backend/requests/
├── auth.rest              # Login con todos los usuarios
├── sql-injection.rest     # 20 tests de SQL Injection
├── backdoor.rest          # Tests del backdoor
├── admin.rest             # Endpoints protegidos
├── complete-tests.rest    # Suite completa (23 tests)
└── README.md              # Documentación de .rest
```

---

## Siguiente Paso

1. **Iniciar backend:** `npm run dev`
2. **Abrir** `requests/auth.rest` en VS Code
3. **Ejecutar** el test "Login Admin - admin/admin"
4. **Copiar el token** de la respuesta
5. **Usar el token** en tu frontend para requests autenticados

O simplemente usar las credenciales desde el formulario de login del frontend:

```
Usuario: admin
Contraseña: admin
```

---

**El sistema está listo para usar.**
