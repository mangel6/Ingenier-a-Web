// Configuración para integración con backend real
class BackendIntegration {
  constructor() {
    this.baseURL = "https://tu-backend.com/api" // CAMBIAR POR LA URL REAL

    this.useRealBackend = false // Cambiar a true cuando el backend esté listo
  }

  // Método para registrar usuario en el backend
  async registerUser(userData) {
    if (!this.useRealBackend) {
      // Usar sistema local
      return window.authSystem.registerUser(userData)
    }

    try {
      const response = await fetch(`${this.baseURL}/usuarios/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.usuario,
          password: userData.password,
          tipoUsuario: userData.tipoUsuario.toUpperCase(),
          nombreCompleto: userData.nombreCompleto,
          tipoDocumento: userData.tipoDocumento,
          numeroDocumento: userData.numeroDocumento,
          fechaNacimiento: userData.fechaNacimiento,
          licenciaMedica: userData.licenciaMedica,
          especialidad: userData.especialidad,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        return { success: true, message: result.message || "Usuario registrado exitosamente" }
      } else {
        return { success: false, message: result.message || "Error al registrar usuario" }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      return { success: false, message: "Error de conexión con el servidor" }
    }
  }

  // Método para login en el backend
  async loginUser(usuario, password, tipoUsuario) {
    if (!this.useRealBackend) {
      // Usar sistema local
      return window.authSystem.validateUser(usuario, password, tipoUsuario)
    }

    try {
      const response = await fetch(`${this.baseURL}/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usuario,
          password: password,
          tipoUsuario: tipoUsuario.toUpperCase(),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Guardar sesión
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: result.user.id,
            usuario: result.user.email,
            tipoUsuario: result.user.tipoUsuario,
            nombre: result.user.nombre,
            token: result.token, // Si el backend usa JWT
          }),
        )

        return { success: true, user: result.user }
      } else {
        return { success: false, message: result.message || "Credenciales incorrectas" }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      return { success: false, message: "Error de conexión con el servidor" }
    }
  }
}

// Instancia global para integración con backend
window.backendIntegration = new BackendIntegration()
