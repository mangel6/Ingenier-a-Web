document.addEventListener("DOMContentLoaded", () => {
  const tipoUsuarioSelect = document.getElementById("tipoUsuario")
  const camposPaciente = document.getElementById("camposPaciente")
  const camposDoctor = document.getElementById("camposDoctor")
  const registroForm = document.getElementById("registroForm")

  // Mostrar campos específicos según el tipo de usuario
  tipoUsuarioSelect.addEventListener("change", function () {
    const tipoSeleccionado = this.value

    // Ocultar todos los campos específicos
    camposPaciente.style.display = "none"
    camposDoctor.style.display = "none"

    // Limpiar campos específicos
    limpiarCamposEspecificos()

    // Mostrar campos según el tipo seleccionado
    if (tipoSeleccionado === "paciente") {
      camposPaciente.style.display = "block"
      hacerCamposRequeridos("paciente")
    } else if (tipoSeleccionado === "doctor") {
      camposDoctor.style.display = "block"
      hacerCamposRequeridos("doctor")
    }
  })

  // Función para limpiar campos específicos
  function limpiarCamposEspecificos() {
    // Limpiar campos de paciente
    document.getElementById("nombreCompleto").value = ""
    document.getElementById("tipoDocumento").value = ""
    document.getElementById("numeroDocumento").value = ""
    document.getElementById("fechaNacimiento").value = ""

    // Limpiar campos de doctor
    document.getElementById("licenciaMedica").value = ""
    document.getElementById("especialidad").value = ""

    // Remover atributo required de todos los campos específicos
    const camposEspecificos = document.querySelectorAll(".campos-especificos input, .campos-especificos select")
    camposEspecificos.forEach((campo) => {
      campo.removeAttribute("required")
    })
  }

  // Función para hacer campos requeridos según el tipo
  function hacerCamposRequeridos(tipo) {
    if (tipo === "paciente") {
      document.getElementById("nombreCompleto").setAttribute("required", "")
      document.getElementById("tipoDocumento").setAttribute("required", "")
      document.getElementById("numeroDocumento").setAttribute("required", "")
      document.getElementById("fechaNacimiento").setAttribute("required", "")
    } else if (tipo === "doctor") {
      document.getElementById("licenciaMedica").setAttribute("required", "")
      document.getElementById("especialidad").setAttribute("required", "")
    }
  }

  // Validación de contraseñas
  function validarContraseñas() {
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value

    if (password !== confirmPassword) {
      showErrorMessage("Las contraseñas no coinciden")
      return false
    }

    if (password.length < 6) {
      showErrorMessage("La contraseña debe tener al menos 6 caracteres")
      return false
    }

    return true
  }

  // Manejar envío del formulario
  registroForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    clearMessages()

    if (!validarContraseñas()) {
      return
    }

    const tipoUsuario = document.getElementById("tipoUsuario").value
    if (tipoUsuario === "paciente") {
      if (!validarFechaNacimiento()) {
        return
      }
    }

    // Recopilar datos del formulario con normalización
    const datosUsuario = {
      usuario: document.getElementById("usuario").value.trim().toLowerCase(), // Normalizar email
      password: document.getElementById("password").value,
      tipoUsuario: tipoUsuario,
    }

    // Agregar campos específicos según el tipo
    if (tipoUsuario === "paciente") {
      datosUsuario.nombreCompleto = document.getElementById("nombreCompleto").value.trim()
      datosUsuario.tipoDocumento = document.getElementById("tipoDocumento").value
      datosUsuario.numeroDocumento = document.getElementById("numeroDocumento").value.trim()
      datosUsuario.fechaNacimiento = document.getElementById("fechaNacimiento").value
    } else if (tipoUsuario === "doctor") {
      datosUsuario.licenciaMedica = document.getElementById("licenciaMedica").value.trim()
      datosUsuario.especialidad = document.getElementById("especialidad").value
    }

    let result
    if (window.backendIntegration && window.backendIntegration.useRealBackend) {
      result = await window.backendIntegration.registerUser(datosUsuario)
    } else {
      result = window.authSystem.registerUser(datosUsuario)
    }

    if (result.success) {
      showSuccessMessage(result.message)
      // Limpiar formulario
      registroForm.reset()
      limpiarCamposEspecificos()

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
    } else {
      showErrorMessage(result.message)
    }
  })

  function validarFechaNacimiento() {
    const fechaNacimiento = document.getElementById("fechaNacimiento").value

    if (!fechaNacimiento) {
      showErrorMessage("La fecha de nacimiento es requerida")
      return false
    }

    const birthDate = new Date(fechaNacimiento)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()

    if (isNaN(birthDate.getTime())) {
      showErrorMessage("La fecha de nacimiento no es válida")
      return false
    }

    if (birthDate > today) {
      showErrorMessage("La fecha de nacimiento no puede ser futura")
      return false
    }

    if (age < 0 || age > 120) {
      showErrorMessage("La fecha de nacimiento no es válida (edad debe estar entre 0 y 120 años)")
      return false
    }

    return true
  }

  function showErrorMessage(message) {
    const errorDiv = document.getElementById("registroError") || createMessageDiv("registroError", "error")
    errorDiv.textContent = message
    errorDiv.style.display = "block"
  }

  function showSuccessMessage(message) {
    const successDiv = document.getElementById("registroSuccess") || createMessageDiv("registroSuccess", "success")
    successDiv.textContent = message
    successDiv.style.display = "block"
  }

  function createMessageDiv(id, type) {
    const messageDiv = document.createElement("div")
    messageDiv.id = id

    const styles = {
      error: {
        background: "#fee2e2",
        border: "1px solid #fecaca",
        color: "#dc2626",
      },
      success: {
        background: "#dcfce7",
        border: "1px solid #bbf7d0",
        color: "#16a34a",
      },
    }

    messageDiv.style.cssText = `
      background: ${styles[type].background};
      border: ${styles[type].border};
      color: ${styles[type].color};
      padding: 0.75rem;
      border-radius: 0.375rem;
      margin-top: 1rem;
      display: none;
      font-size: 0.875rem;
    `

    const form = document.getElementById("registroForm")
    form.appendChild(messageDiv)

    return messageDiv
  }

  function clearMessages() {
    const errorDiv = document.getElementById("registroError")
    const successDiv = document.getElementById("registroSuccess")

    if (errorDiv) errorDiv.style.display = "none"
    if (successDiv) successDiv.style.display = "none"
  }
})

// Función para mostrar/ocultar contraseña
function togglePasswordField(fieldId, iconId) {
  const field = document.getElementById(fieldId)
  const icon = document.getElementById(iconId)

  if (field.type === "password") {
    field.type = "text"
    icon.classList.remove("fa-eye")
    icon.classList.add("fa-eye-slash")
  } else {
    field.type = "password"
    icon.classList.remove("fa-eye-slash")
    icon.classList.add("fa-eye")
  }
}
