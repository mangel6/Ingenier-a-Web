# 📋 Documentación para Integración con Backend

## 🚀 Configuración Inicial

### 1. Activar el Backend Real
Para cambiar del sistema local al backend real, edita el archivo `js/backend-integration.js`:

\`\`\`javascript
// Cambiar estas líneas:
this.baseURL = 'https://localhost:8080/api' // ✅ CAMBIAR POR TU URL REAL
this.useRealBackend = true // ✅ CAMBIAR A true
\`\`\`

### 2. Estructura de la Base de Datos

Tu backend necesita una tabla `usuarios` con esta estructura:

\`\`\`sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipoUsuario ENUM('paciente', 'doctor', 'admin') NOT NULL,
    nombre VARCHAR(255),
    nombreCompleto VARCHAR(255),
    tipoDocumento ENUM('cc', 'ti', 'ce', 'pp'),
    numeroDocumento VARCHAR(50),
    fechaNacimiento DATE,
    licenciaMedica VARCHAR(100),
    especialidad VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

## 🔗 Endpoints Requeridos

### 1. Registro de Usuario
**POST** `/api/usuarios/registro`

**Request Body:**
\`\`\`json
{
    "email": "usuario@email.com",
    "password": "contraseña123",
    "tipoUsuario": "paciente", // o "doctor"
    "nombreCompleto": "Juan Pérez López",
    "tipoDocumento": "cc",
    "numeroDocumento": "12345678",
    "fechaNacimiento": "1990-05-15",
    // Solo para doctores:
    "licenciaMedica": "12345",
    "especialidad": "cardiologia"
}
\`\`\`

**Response Success (200):**
\`\`\`json
{
    "success": true,
    "message": "Usuario registrado exitosamente",
    "user": {
        "id": 1,
        "email": "usuario@email.com",
        "tipoUsuario": "paciente",
        "nombre": "Juan Pérez López"
    }
}
\`\`\`

**Response Error (400/409):**
\`\`\`json
{
    "success": false,
    "message": "El usuario ya existe" // o mensaje de error específico
}
\`\`\`

### 2. Login de Usuario
**POST** `/api/usuarios/login`

**Request Body:**
\`\`\`json
{
    "email": "usuario@email.com",
    "password": "contraseña123",
    "tipoUsuario": "paciente"
}
\`\`\`

**Response Success (200):**
\`\`\`json
{
    "success": true,
    "message": "Login exitoso",
    "user": {
        "id": 1,
        "email": "usuario@email.com",
        "tipoUsuario": "paciente",
        "nombre": "Juan Pérez López"
    },
    "token": "jwt_token_aqui" // Opcional si usas JWT
}
\`\`\`

**Response Error (401):**
\`\`\`json
{
    "success": false,
    "message": "Credenciales incorrectas o tipo de usuario no coincide"
}
\`\`\`

## 🛡️ Validaciones del Backend

### Para Pacientes:
- ✅ Email válido
- ✅ Contraseña mínimo 6 caracteres
- ✅ Nombre completo requerido
- ✅ Tipo de documento requerido
- ✅ Número de documento mínimo 6 dígitos
- ✅ Fecha de nacimiento válida (no futura, edad entre 0-120 años)

### Para Doctores:
- ✅ Email válido
- ✅ Contraseña mínimo 6 caracteres
- ✅ Licencia médica mínimo 4 caracteres
- ✅ Especialidad requerida

## 🔒 Seguridad Recomendada

### 1. Hash de Contraseñas
\`\`\`javascript
// Ejemplo con bcrypt en Node.js
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
\`\`\`

### 2. Validación de Email Único
\`\`\`sql
-- Verificar antes de insertar
SELECT COUNT(*) FROM usuarios WHERE email = ?
\`\`\`

### 3. CORS Headers
\`\`\`javascript
// Permitir requests desde tu frontend
app.use(cors({
    origin: ['http://localhost:3000', 'https://tu-dominio.com'],
    credentials: true
}));
\`\`\`

## 📝 Ejemplo de Implementación (Node.js + Express)

\`\`\`javascript
const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Registro de usuario
app.post('/api/usuarios/registro', async (req, res) => {
    try {
        const { email, password, tipoUsuario, nombreCompleto, tipoDocumento, numeroDocumento, fechaNacimiento, licenciaMedica, especialidad } = req.body;
        
        // Validar email único
        const [existing] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }
        
        // Hash de contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insertar usuario
        const [result] = await db.execute(
            'INSERT INTO usuarios (email, password, tipoUsuario, nombreCompleto, tipoDocumento, numeroDocumento, fechaNacimiento, licenciaMedica, especialidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, tipoUsuario, nombreCompleto, tipoDocumento, numeroDocumento, fechaNacimiento, licenciaMedica, especialidad]
        );
        
        res.json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: {
                id: result.insertId,
                email,
                tipoUsuario,
                nombre: nombreCompleto
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Login de usuario
app.post('/api/usuarios/login', async (req, res) => {
    try {
        const { email, password, tipoUsuario } = req.body;
        
        // Buscar usuario
        const [users] = await db.execute(
            'SELECT * FROM usuarios WHERE email = ? AND tipoUsuario = ?',
            [email, tipoUsuario]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas o tipo de usuario no coincide'
            });
        }
        
        const user = users[0];
        
        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas o tipo de usuario no coincide'
            });
        }
        
        // Login exitoso
        res.json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: user.id,
                email: user.email,
                tipoUsuario: user.tipoUsuario,
                nombre: user.nombreCompleto || user.email.split('@')[0]
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});
\`\`\`

## 🧪 Cómo Probar

### 1. Sistema Local (Actual)
- Los usuarios se guardan en `localStorage`
- Funciona sin backend
- Perfecto para desarrollo y pruebas

### 2. Con Backend Real
1. Cambia `useRealBackend = true` en `backend-integration.js`
2. Actualiza la `baseURL` con tu servidor
3. Asegúrate de que tu backend esté corriendo
4. Prueba registro y login

## 🔄 Migración de Datos

Si quieres migrar usuarios del sistema local al backend:

\`\`\`javascript
// Ejecutar en consola del navegador
const users = JSON.parse(localStorage.getItem('systemUsers') || '[]');
console.log('Usuarios locales:', users);

// Luego puedes insertar estos usuarios en tu base de datos
\`\`\`

## ❗ Problemas Comunes

### 1. CORS Error
- Configura CORS en tu backend
- Permite el origen de tu frontend

### 2. 404 Not Found
- Verifica que la URL base sea correcta
- Asegúrate de que los endpoints existan

### 3. 500 Internal Server Error
- Revisa los logs del servidor
- Verifica la conexión a la base de datos

### 4. Usuarios no se guardan
- Verifica que `useRealBackend = true`
- Comprueba que el backend responda correctamente

## 📞 Soporte

Si tienes problemas:
1. Verifica la consola del navegador (F12)
2. Revisa los logs del servidor backend
3. Asegúrate de que la base de datos esté funcionando
4. Prueba los endpoints con Postman o similar
