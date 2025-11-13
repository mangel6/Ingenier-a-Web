// Configuración para integración con backend real
console.log("backend-integration.js loaded");

class BackendIntegration {
  constructor() {
    console.log("BackendIntegration instance created");
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
    if (!this.useRealBackend) {
      // Simular subida exitosa en modo local
      console.log("Mock upload payload:", JSON.stringify(documentData, null, 2))
      return { success: true, message: "Documento subido exitosamente (modo local)" }
    }

    try {
      const response = await fetch(`${this.baseURL}/v1/clinical-documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
      })

      const result = await response.json()

      if (response.ok) {
        return { success: true, message: result.message || "Documento subido exitosamente" }
      } else {
        return { success: false, message: result.message || "Error al subir documento" }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      return { success: false, message: "Error de conexión con el servidor" }
    }
  }

  // Método para obtener documentos clínicos del paciente
  async fetchClinicalDocuments(patientId) {
    if (!this.useRealBackend) {
      // Simular documentos en modo local
      console.log("Mock fetch for patient:", patientId)
      return {
        success: true,
        documents: [
          {
            id: 1,
            patientId: patientId,
            uploadedByUserId: "doctor-uuid",
            kind: "PDF",
            filename: "historia_clinica_ejemplo.pdf",
            mimeType: "application/pdf",
            sizeBytes: 245760,
            uploadedAt: "2024-01-15T10:30:00Z"
          }
        ]
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/v1/clinical-documents?patientId=${patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (response.ok) {
        return { success: true, documents: result.documents || result }
      } else {
        return { success: false, message: result.message || "Error al obtener documentos" }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      return { success: false, message: "Error de conexión con el servidor" }
    }
  }
  // Método para obtener documentos clínicos del paciente por backendId
  async fetchClinicalDocumentsForPatient(backendId) {
    console.log("fetchClinicalDocumentsForPatient called with backendId:", backendId);
    if (!this.useRealBackend) {
      // Simular documentos en modo local
      console.log("Mock fetch for patient backendId:", backendId)
      return {
        success: true,
        documents: [
          {
            id: 1,
            patientId: backendId,
            uploadedByUserId: "doctor-uuid",
            kind: "PDF",
            filename: "historia_clinica_ejemplo.pdf",
            mimeType: "application/pdf",
            sizeBytes: 245760,
            uploadedAt: "2024-01-15T10:30:00Z"
          }
        ]
      }
    }

    try {
      console.log("Making real API call to fetch documents for patient:", backendId);
      const response = await fetch(`${this.baseURL}/v1/clinical-documents/patient/${backendId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      console.log("API response received:", result);

      if (response.ok) {
        return { success: true, documents: result.documents || result }
      } else {
        return { success: false, message: result.message || "Error al obtener documentos" }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      return { success: false, message: "Error de conexión con el servidor" }
    }
  }

  // Método para obtener el contenido de un documento específico
  async fetchClinicalDocumentContent(documentId, patientId) {
    if (!this.useRealBackend) {
      // Simular contenido en modo local
      console.log("Mock fetch content for document:", documentId, "patientId:", patientId)
      return {
        success: true,
        content: "JVBERi0xLjQKJeLjz9MK...", // Base64 mock
        mimeType: "application/pdf"
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/v1/clinical-documents/${documentId}/content?patientId=${patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const content = await response.text() // Assuming base64 content
        const contentType = response.headers.get('content-type')
        return {
          success: true,
          content: content,
          mimeType: contentType || "application/pdf"
        }
      } else {
        const result = await response.json()
        return { success: false, message: result.message || "Error al obtener contenido del documento" }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      return { success: false, message: "Error de conexión con el servidor" }
    }
  }
}

// Instancia global para integración con backend
window.backendIntegration = new BackendIntegration()
