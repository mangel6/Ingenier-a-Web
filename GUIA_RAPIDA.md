# 🚀 Guía Rápida - Sistema Médico

## ✅ Problema Solucionado

**El problema del login ya está arreglado.** Los usuarios registrados ahora se guardan correctamente y puedes hacer login con ellos.

### ¿Qué se cambió?
- ✅ Los usuarios ahora se guardan en `localStorage` (persistentes)
- ✅ El sistema carga usuarios guardados al iniciar
- ✅ Agregado soporte para backend real
- ✅ Mejoradas las validaciones

## 🧪 Cómo Probar

### 1. Registro de Paciente
1. Ve a `registro.html`
2. Selecciona "Paciente"
3. Llena todos los campos:
   - Email: `paciente@test.com`
   - Contraseña: `123456`
   - Nombre completo: `Juan Pérez`
   - Tipo documento: `Cédula de Ciudadanía`
   - Número documento: `123456789`
   - Fecha nacimiento: `1990-01-01`
4. Haz clic en "Crear Cuenta"

### 2. Login con el Usuario Creado
1. Ve a `index.html`
2. Selecciona "Paciente"
3. Usuario: `paciente@test.com`
4. Contraseña: `123456`
5. Haz clic en "Iniciar Sesión"

**¡Ahora debería funcionar perfectamente!**

## 🔄 Para Conectar con Backend Real

### Paso 1: Editar Configuración
En `js/backend-integration.js`, cambia:
\`\`\`javascript
this.baseURL = 'https://TU-SERVIDOR.com/api' // ← Tu URL aquí
this.useRealBackend = true // ← Cambiar a true
\`\`\`

### Paso 2: Tu Amigo Debe Crear Estos Endpoints

#### Registro: `POST /api/usuarios/registro`
\`\`\`json
// Recibe:
{
    "email": "usuario@email.com",
    "password": "123456",
    "tipoUsuario": "paciente",
    "nombreCompleto": "Juan Pérez",
    "tipoDocumento": "cc",
    "numeroDocumento": "123456789",
    "fechaNacimiento": "1990-01-01"
}

// Responde:
{
    "success": true,
    "message": "Usuario registrado exitosamente"
}
\`\`\`

#### Login: `POST /api/usuarios/login`
\`\`\`json
// Recibe:
{
    "email": "usuario@email.com",
    "password": "123456",
    "tipoUsuario": "paciente"
}

// Responde:
{
    "success": true,
    "user": {
        "id": 1,
        "email": "usuario@email.com",
        "tipoUsuario": "paciente",
        "nombre": "Juan Pérez"
    }
}
\`\`\`

## 📋 Usuarios de Prueba Predefinidos

El sistema incluye estos usuarios para pruebas:

### Admin
- Usuario: `admin@sistema.com`
- Contraseña: `admin123`
- Tipo: `admin`

### Doctor
- Usuario: `doctor@hospital.com`
- Contraseña: `doctor123`
- Tipo: `doctor`

### Paciente
- Usuario: `paciente@email.com`
- Contraseña: `paciente123`
- Tipo: `paciente`

## 🛠️ Archivos Importantes

- `js/auth.js` - Sistema de autenticación principal
- `js/backend-integration.js` - Integración con backend real
- `js/login.js` - Lógica del formulario de login
- `js/registro.js` - Lógica del formulario de registro
- `DOCUMENTACION_BACKEND.md` - Documentación completa para el backend

## 🎯 Próximos Pasos

1. **Probar el sistema actual** - Registra usuarios y haz login
2. **Configurar backend** - Cuando esté listo, cambia la configuración
3. **Migrar datos** - Los usuarios locales se pueden exportar si es necesario

¡El sistema ya está funcionando correctamente! 🎉
