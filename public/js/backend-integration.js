// Configuración para integración con backend real
class BackendIntegration {
  constructor() {
    this.baseURL = "/api" // CAMBIAR POR LA URL REAL

    this.useRealBackend = true // Cambiar a true cuando el backend esté listo
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

  // Método para subir documento clínico
  async uploadClinicalDocument(documentData) {
    console.log("[DEBUG] BackendIntegration.uploadClinicalDocument called")
    console.log("[DEBUG] useRealBackend:", this.useRealBackend)
    console.log("[DEBUG] baseURL:", this.baseURL)

    if (!this.useRealBackend) {
      // Simular subida exitosa en modo local
      console.log("[DEBUG] Using mock mode - payload:", JSON.stringify(documentData, null, 2))
      console.log("[DEBUG] Mock upload successful")
      return { success: true, message: "Documento subido exitosamente (modo local)" }
    }

    try {
      console.log("[DEBUG] Making real API call to:", `${this.baseURL}/v1/clinical-documents`)
      console.log("[DEBUG] Request payload:", JSON.stringify(documentData, null, 2))

      const response = await fetch(`${this.baseURL}/v1/clinical-documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
      })

      console.log("[DEBUG] Response status:", response.status)
      console.log("[DEBUG] Response ok:", response.ok)

      const result = await response.json()
      console.log("[DEBUG] Response body:", result)

      if (response.ok) {
        console.log("[DEBUG] Real API call successful")
        return { success: true, message: result.message || "Documento subido exitosamente" }
      } else {
        console.log("[DEBUG] Real API call failed")
        return { success: false, message: result.message || "Error al subir documento" }
      }
    } catch (error) {
      console.error("[DEBUG] Error de conexión:", error)
      return { success: false, message: "Error de conexión con el servidor" }
    }
  }
}

// Instancia global para integración con backend
window.backendIntegration = new BackendIntegration()
