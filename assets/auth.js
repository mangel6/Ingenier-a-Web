// Sistema básico de autenticación
class AuthSystem {
  constructor() {
    // Base de datos simulada de usuarios (en producción esto estaría en el backend)
    this.loadUsers()
  }

  loadUsers() {
    // Intentar cargar usuarios desde localStorage
    const savedUsers = localStorage.getItem("systemUsers")

    if (savedUsers) {
      this.users = JSON.parse(savedUsers)
    } else {
      // Usuarios predefinidos para pruebas iniciales
      this.users = [
        {
          id: 1,
          usuario: "admin@sistema.com",
          password: "admin123",
          tipoUsuario: "admin",
          nombre: "Administrador Sistema",
        },
        {
          id: 2,
          usuario: "doctor@hospital.com",
          password: "doctor123",
          tipoUsuario: "doctor",
          nombre: "Dr. María González",
          licenciaMedica: "12345",
          especialidad: "cardiologia",
        },
        {
          id: 3,
          usuario: "paciente@email.com",
          password: "paciente123",
          tipoUsuario: "paciente",
          nombre: "Juan Pérez",
          nombreCompleto: "Juan Carlos Pérez López",
          tipoDocumento: "cc",
          numeroDocumento: "12345678",
          fechaNacimiento: "1990-05-15",
        },
      ]
      this.saveUsers()
    }
  }

  saveUsers() {
    localStorage.setItem("systemUsers", JSON.stringify(this.users))
  }

  validateUser(usuario, password, tipoUsuario) {
    console.log("[v0] Validando usuario:", { usuario, tipoUsuario })
    console.log(
      "[v0] Usuarios disponibles:",
      this.users.map((u) => ({
        usuario: u.usuario,
        tipoUsuario: u.tipoUsuario,
      })),
    )

    const user = this.users.find(
      (u) =>
        (u.usuario.toLowerCase() === usuario.toLowerCase() || u.numeroDocumento === usuario) &&
        u.password === password &&
        u.tipoUsuario === tipoUsuario,
    )

    console.log("[v0] Usuario encontrado:", user ? "SÍ" : "NO")

    if (user) {
      // Guardar sesión
      const sessionData = {
        id: user.id,
        usuario: user.usuario,
        tipoUsuario: user.tipoUsuario,
        nombre: user.nombre,
      }

      console.log("[v0] Guardando sesión:", sessionData)
      sessionStorage.setItem("currentUser", JSON.stringify(sessionData))

      return { success: true, user: user }
    }

    return { success: false, message: "Credenciales incorrectas o tipo de usuario no coincide" }
  }

  registerUser(userData) {
    // Validar que el usuario no exista
    const existingUser = this.users.find((u) => u.usuario.toLowerCase() === userData.usuario.toLowerCase())

    if (existingUser) {
      return { success: false, message: "El usuario ya existe" }
    }

    // Validar datos específicos
    const validation = this.validateUserData(userData)
    if (!validation.success) {
      return validation
    }

    // Crear nuevo usuario
    const newUser = {
      id: this.users.length + 1,
      ...userData,
      nombre: userData.nombreCompleto || userData.usuario.split("@")[0],
    }

    this.users.push(newUser)

    this.saveUsers()

    return { success: true, message: "Usuario registrado exitosamente" }
  }

  validateUserData(userData) {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.usuario)) {
      return { success: false, message: "El formato del email no es válido" }
    }

    // Validar contraseña
    if (userData.password.length < 6) {
      return { success: false, message: "La contraseña debe tener al menos 6 caracteres" }
    }

    // Validaciones específicas por tipo de usuario
    if (userData.tipoUsuario === "paciente") {
      if (!userData.fechaNacimiento) {
        return { success: false, message: "La fecha de nacimiento es requerida" }
      }

      // Validar fecha de nacimiento
      const birthDate = new Date(userData.fechaNacimiento)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      if (age < 0 || age > 120) {
        return { success: false, message: "La fecha de nacimiento no es válida" }
      }

      if (birthDate > today) {
        return { success: false, message: "La fecha de nacimiento no puede ser futura" }
      }

      // Validar número de documento
      if (!userData.numeroDocumento || userData.numeroDocumento.length < 6) {
        return { success: false, message: "El número de documento debe tener al menos 6 dígitos" }
      }
    }

    if (userData.tipoUsuario === "doctor") {
      if (!userData.licenciaMedica || userData.licenciaMedica.length < 4) {
        return { success: false, message: "La licencia médica debe tener al menos 4 caracteres" }
      }

      if (!userData.especialidad) {
        return { success: false, message: "La especialidad es requerida" }
      }
    }

    return { success: true }
  }

  getCurrentUser() {
    const userSession = sessionStorage.getItem("currentUser")
    return userSession ? JSON.parse(userSession) : null
  }

  logout() {
    sessionStorage.removeItem("currentUser")
  }
}

// Instancia global del sistema de autenticación
window.authSystem = new AuthSystem()
