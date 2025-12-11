# Documentación del Proyecto - Índice

Bienvenido al **Honeypot Security Lab**. Esta es tu guía de navegación para toda la documentación.

---

## Mapa de Documentación

### Documentos Principales

| Archivo                                            | Propósito                        | Para Quién                    |
| -------------------------------------------------- | -------------------------------- | ----------------------------- |
| **[README.md](README.md)**                         | Documentación técnica completa   | Desarrolladores, Instructores |
| **[EXPLOITATION_GUIDE.md](EXPLOITATION_GUIDE.md)** | Guía práctica de hacking         | Pentesters, Estudiantes       |
| **[PROYECTO_RESUMEN.md](PROYECTO_RESUMEN.md)**     | Resumen ejecutivo del proyecto   | Todos                         |
| **[CREDENTIALS.md](CREDENTIALS.md)**               | Credenciales y referencia rápida | Todos                         |
| **[INDEX.md](INDEX.md)**                           | Este archivo - Navegación        | Todos                         |

---

## ¿Qué quieres hacer?

### Quiero Empezar Rápido

➡️ Lee: **[CREDENTIALS.md](CREDENTIALS.md)** sección "Comandos de Inicio Rápido"

```bash
cd Backend
npm install
docker-compose up -d
npm run init-db
npm run dev
```

### Quiero Entender el Proyecto

➡️ Lee: **[PROYECTO_RESUMEN.md](PROYECTO_RESUMEN.md)**

-   Descripción general
-   Objetivos completados
-   Estructura de archivos
-   Tecnologías usadas
-   Estadísticas

### Quiero Configurar e Instalar

➡️ Lee: **[README.md](README.md)** sección "Instalación y Configuración"

-   Requisitos previos
-   Instalación paso a paso
-   Configuración de .env
-   Inicialización de BD
-   Troubleshooting

### 🎯 Quiero Hackear el Sistema

➡️ Lee: **[EXPLOITATION_GUIDE.md](EXPLOITATION_GUIDE.md)**

-   Reconocimiento inicial
-   SQL Injection paso a paso
-   Descubrimiento del backdoor
-   Escalación de privilegios
-   Scripts de automatización
-   Ejercicios propuestos

### Necesito Credenciales o Configuración

➡️ Lee: **[CREDENTIALS.md](CREDENTIALS.md)**

-   8 usuarios con passwords
-   Credenciales de MySQL
-   Header del backdoor
-   Payloads SQL Injection
-   URLs de servicios
-   Comandos útiles

### Quiero Testear las Vulnerabilidades

➡️ Ejecuta los scripts de testing:

```powershell
# Test completo (recomendado)
.\test-final.ps1

# Solo SQL Injection
.\test-sql-injection.ps1

# Solo Backdoor
.\test-backdoor.ps1
```

➡️ O lee: **[EXPLOITATION_GUIDE.md](EXPLOITATION_GUIDE.md)** sección "Testing Manual"

### Quiero Ver el Código

➡️ Archivos clave:

-   **SQL Injection:** `src/controllers/authController.js`
-   **Backdoor:** `src/middlewares/backdoorMiddleware.js`
-   **Database:** `src/config/database.js`
-   **Schema:** `src/database/schema.sql`
-   **Server:** `src/server.js`

### Quiero Ver la Base de Datos

➡️ Opciones:

1. **phpMyAdmin:** http://localhost:8080

    - Usuario: `root`
    - Password: `vulnerable123`

2. **MySQL CLI:**

    ```bash
    docker exec -it honeypot-mysql mysql -u root -pvulnerable123 honeypot_db
    ```

3. **Ver queries útiles:** [CREDENTIALS.md](CREDENTIALS.md) sección "Queries SQL Útiles"

### Quiero Aprender sobre Vulnerabilidades

➡️ Lee en orden:

1. **[README.md](README.md)** sección "Vulnerabilidades Implementadas"
2. **[EXPLOITATION_GUIDE.md](EXPLOITATION_GUIDE.md)**
3. Practica con los scripts de testing
4. Intenta los ejercicios propuestos
5. Lee la sección "Mitigaciones" para aprender a arreglarlas

### Tengo un Problema

➡️ Lee: **[README.md](README.md)** sección "Troubleshooting"

Problemas comunes:

-   Puerto 3000 en uso
-   MySQL no conecta
-   Error ECONNREFUSED
-   Docker no inicia

### Quiero Ver los Endpoints de la API

➡️ Lee: **[README.md](README.md)** sección "Endpoints API"

O referencia rápida: **[CREDENTIALS.md](CREDENTIALS.md)** sección "API Endpoints Rápidos"

---

## Contenido por Documento

### README.md

-   Advertencia importante
-   Descripción del proyecto
-   Vulnerabilidades detalladas
    -   SQL Injection
    -   Credenciales débiles
    -   Backdoor
-   Instalación completa
-   Testing
-   Estructura del proyecto
-   Endpoints API
-   Mecanismos de seguridad
-   Auditoría y logs
-   Uso educativo
-   Comandos útiles
-   Troubleshooting
-   Referencias

### EXPLOITATION_GUIDE.md

-   Reconocimiento inicial
-   Explotación SQL Injection
    -   Comment-based bypass
    -   Always true condition
    -   UNION injection
    -   Enumeración de usuarios
-   Descubrimiento del backdoor
    -   White box
    -   Black box (fuzzing)
-   Uso del backdoor
    -   Listar usuarios
    -   Obtener estadísticas
    -   Acceder a logs
    -   Eliminar usuarios
-   Escalación de privilegios
-   Post-explotación
    -   Dump de BD
    -   Análisis de logs
    -   Persistencia
    -   Borrar rastros
-   Scripts de automatización (Python, PowerShell)
-   Ejercicios propuestos (3 niveles)
-   Mitigaciones

### PROYECTO_RESUMEN.md

-   Descripción general
-   Objetivos completados
-   Estructura de archivos
-   Inicio rápido
-   Testing
-   Vulnerabilidades (severidad CVSS)
-   Estadísticas
-   Documentación
-   Uso educativo
-   Advertencias
-   Tecnologías
-   Siguientes pasos
-   Logros

### CREDENTIALS.md

-   URLs del sistema
-   8 usuarios (admin y normales)
-   Credenciales MySQL
-   Backdoor secret
-   SQL Injection payloads
-   CORS config
-   Variables de entorno
-   Docker commands
-   Tests rápidos
-   Database tables
-   Queries SQL útiles
-   Comandos de inicio
-   API endpoints
-   Checklist de configuración
-   Backup y reset

---

## Rutas de Aprendizaje Sugeridas

### Para Principiantes

1. Lee **PROYECTO_RESUMEN.md** (15 min)
2. Sigue **CREDENTIALS.md** sección "Comandos de Inicio Rápido" (10 min)
3. Ejecuta `.\test-final.ps1` para ver las vulnerabilidades en acción (5 min)
4. Lee **README.md** sección "Vulnerabilidades Implementadas" (20 min)
5. Practica con **EXPLOITATION_GUIDE.md** nivel básico (30 min)

**Total: ~1.5 horas**

### Para Estudiantes de Ciberseguridad

1. Lee **PROYECTO_RESUMEN.md** para contexto (10 min)
2. Configura el entorno siguiendo **README.md** (20 min)
3. Lee **EXPLOITATION_GUIDE.md** completo (45 min)
4. Practica todos los ataques manualmente (1 hora)
5. Crea scripts de automatización (1 hora)
6. Intenta los ejercicios nivel intermedio y avanzado (2 horas)
7. Implementa las mitigaciones sugeridas (1 hora)

**Total: ~6 horas**

### Para Instructores

1. Lee **PROYECTO_RESUMEN.md** (10 min)
2. Revisa **README.md** completo (30 min)
3. Prueba todos los scripts de testing (15 min)
4. Lee **EXPLOITATION_GUIDE.md** para planear ejercicios (30 min)
5. Revisa el código fuente de vulnerabilidades clave (30 min)
6. Prepara material didáctico usando los ejercicios propuestos (1 hora)

**Total: ~3 horas**

---

## Enlaces Rápidos

### Servicios en Ejecución

-   API: http://localhost:3000
-   Frontend: http://localhost:5173
-   phpMyAdmin: http://localhost:8080
-   Health Check: http://localhost:3000/health

### Repositorio

-   Código Backend: `Backend/src/`
-   Código Frontend: `front/src/`
-   Schema BD: `Backend/src/database/schema.sql`
-   Docker: `Backend/docker-compose.yml`

### Archivos de Testing

-   `test-final.ps1` - Suite completa
-   `test-sql-injection.ps1` - Solo SQL
-   `test-backdoor.ps1` - Solo backdoor
-   `test-simple.ps1` - Test básico

---

## ¿Necesitas Ayuda?

### Problemas Técnicos

➡️ **[README.md](README.md)** sección "Troubleshooting"

### Dudas sobre Explotación

➡️ **[EXPLOITATION_GUIDE.md](EXPLOITATION_GUIDE.md)** sección correspondiente

### Necesitas Credenciales

➡️ **[CREDENTIALS.md](CREDENTIALS.md)**

### Quieres Entender el Proyecto

➡️ **[PROYECTO_RESUMEN.md](PROYECTO_RESUMEN.md)**

---

## Checklist de Primera Lectura

-   Leer este INDEX.md
-   Leer PROYECTO_RESUMEN.md para contexto
-   Revisar CREDENTIALS.md para credenciales
-   Seguir README.md para instalación
-   Ejecutar test-final.ps1 para verificar
-   Explorar EXPLOITATION_GUIDE.md para aprender a hackear

---

## Objetivos de Aprendizaje

Después de trabajar con este honeypot deberías poder:

-   Identificar y explotar SQL Injection
-   Entender autenticación JWT
-   Descubrir backdoors en aplicaciones
-   Analizar logs de auditoría
-   Escalar privilegios
-   Implementar mitigaciones de seguridad
-   Documentar hallazgos de pentesting
-   Usar herramientas como curl, MySQL CLI, Docker
-   Automatizar exploits con scripts
-   Comprender diferencia entre código vulnerable y seguro

---

## Empezar Ahora

**Recomendación:** Comienza leyendo **[PROYECTO_RESUMEN.md](PROYECTO_RESUMEN.md)** para tener una visión general, luego salta a **[CREDENTIALS.md](CREDENTIALS.md)** para iniciar el sistema.

```bash
# Inicio rápido (3 comandos)
cd Backend
docker-compose up -d && npm install && npm run init-db
npm run dev
```

**¡Bienvenido al mundo del hacking ético!**

---

_Última actualización: Diciembre 2025_
