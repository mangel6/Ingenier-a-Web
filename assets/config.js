// Configuración global del sistema
const CONFIG = {
  DEVELOPMENT: {
    useRealBackend: false,
    backendURL: "http://localhost:3000/api",
    debugMode: true,
  },

  PRODUCTION: {
    useRealBackend: true,
    backendURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8080/MedCloud/api/v1",
    jwtSecret: process.env.JWT_SECRET || "defaultSecretKeyThatShouldBeAtLeast256BitsLongForHS256Algorithm",
    debugMode: false,
  },

  getCurrentConfig() {
    // Detectar si estamos en desarrollo o producción
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("localhost")

    return isDevelopment ? this.DEVELOPMENT : this.PRODUCTION
  },

  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    DOCUMENT_MIN_LENGTH: 6,
    LICENSE_MIN_LENGTH: 4,
    MAX_AGE: 120,
    MIN_AGE: 0,
  },

  MESSAGES: {
    INVALID_EMAIL: "El formato del email no es válido",
    PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 6 caracteres",
    PASSWORDS_DONT_MATCH: "Las contraseñas no coinciden",
    USER_EXISTS: "El usuario ya existe",
    INVALID_CREDENTIALS: "Credenciales incorrectas o tipo de usuario no coincide",
    CONNECTION_ERROR: "Error de conexión con el servidor",
    REGISTRATION_SUCCESS: "Usuario registrado exitosamente",
    INVALID_BIRTHDATE: "La fecha de nacimiento no es válida",
    FUTURE_BIRTHDATE: "La fecha de nacimiento no puede ser futura",
    DOCUMENT_TOO_SHORT: "El número de documento debe tener al menos 6 dígitos",
    LICENSE_TOO_SHORT: "La licencia médica debe tener al menos 4 caracteres",
    SPECIALTY_REQUIRED: "La especialidad es requerida",
  },
}

// Hacer disponible globalmente
window.CONFIG = CONFIG
