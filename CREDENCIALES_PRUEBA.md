# Sistema Médico Integral - Credenciales de Prueba

## 🔐 Usuarios Predefinidos para Pruebas

El sistema incluye usuarios predefinidos para facilitar las pruebas. Usa estas credenciales para acceder a diferentes tipos de dashboard:

### 👨‍💼 Administrador
- **Usuario:** `admin@sistema.com`
- **Contraseña:** `admin123`
- **Tipo:** Admin
- **Dashboard:** Panel de Administración

### 👨‍⚕️ Médico
- **Usuario:** `doctor@hospital.com`
- **Contraseña:** `doctor123`
- **Tipo:** Doctor
- **Dashboard:** Panel Médico
- **Especialidad:** Cardiología
- **Licencia:** 12345

### 👤 Paciente
- **Usuario:** `paciente@email.com`
- **Contraseña:** `paciente123`
- **Tipo:** Patient
- **Dashboard:** Panel de Paciente
- **Documento:** CC 12345678
- **Fecha Nacimiento:** 1990-05-15

## 🚀 Cómo Probar el Sistema

### 1. Acceso al Login
1. Abre `index.html` en tu navegador
2. Selecciona el tipo de usuario
3. Ingresa las credenciales correspondientes
4. Completa la verificación 2FA (cualquier código de 6 dígitos funciona)

### 2. Registro de Nuevos Usuarios
1. Ve a `registro.html`
2. Completa el formulario con datos válidos
3. **Validaciones implementadas:**
   - Email válido requerido
   - Contraseña mínimo 6 caracteres
   - Fecha de nacimiento no puede ser futura
   - Número de documento mínimo 6 dígitos
   - Licencia médica mínimo 4 caracteres

### 3. Funcionalidades Implementadas

#### ✅ Sistema de Autenticación
- Validación de credenciales reales
- Protección de páginas por tipo de usuario
- Sesión persistente con sessionStorage
- Logout automático y manual

#### ✅ Validaciones de Formularios
- Validación en tiempo real
- Mensajes de error específicos
- Validación de fechas de nacimiento
- Verificación de emails únicos

#### ✅ Protección de Dashboards
- Verificación de autenticación
- Redirección automática según tipo de usuario
- Botón de logout en todas las páginas
- Actualización de información de usuario

#### ✅ Experiencia de Usuario
- Mensajes de error y éxito
- Animaciones suaves
- Diseño responsivo
- Accesibilidad mejorada

## 🔧 Casos de Prueba

### Casos Exitosos
1. **Login válido:** Usar credenciales predefinidas
2. **Registro válido:** Crear usuario con datos correctos
3. **Navegación protegida:** Acceder a dashboards correspondientes

### Casos de Error
1. **Credenciales incorrectas:** Probar con datos inválidos
2. **Fecha futura:** Intentar registrar con fecha de nacimiento futura
3. **Email duplicado:** Intentar registrar con email existente
4. **Acceso no autorizado:** Intentar acceder a dashboard incorrecto

## 📝 Notas Técnicas

- Los datos se almacenan en memoria (no persistentes)
- La validación 2FA es simulada (acepta cualquier código de 6 dígitos)
- El sistema funciona completamente en el frontend
- Compatible con servidores HTML estáticos

## 🐛 Solución de Problemas

### Error: "Cannot GET /pages/patient/dashboard.html"
- **Causa:** Intentar acceder directamente sin autenticación
- **Solución:** Iniciar sesión primero desde index.html

### Error: "Usuario ya existe"
- **Causa:** Intentar registrar con email ya usado
- **Solución:** Usar un email diferente

### Error: "Fecha de nacimiento no válida"
- **Causa:** Fecha futura o formato incorrecto
- **Solución:** Usar fecha pasada válida

## 🔄 Reiniciar Sistema
Para reiniciar el sistema y limpiar todos los datos:
1. Abre las herramientas de desarrollador (F12)
2. Ve a Application/Storage
3. Limpia sessionStorage
4. Recarga la página
