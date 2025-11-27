document.addEventListener("DOMContentLoaded", () => {
  // Agregar más usuarios de prueba si es necesario
  if (window.authSystem) {
    // Verificar si hay usuarios adicionales que agregar
    const additionalUsers = [
      {
        id: 4,
        usuario: "enfermera@hospital.com",
        password: "enfermera123",
        tipoUsuario: "doctor", // Usar doctor como tipo base
        nombre: "Enf. Carmen López",
        licenciaMedica: "ENF001",
        especialidad: "enfermeria",
      },
      {
        id: 5,
        usuario: "paciente2@email.com",
        password: "paciente123",
        tipoUsuario: "paciente",
        nombre: "María García",
        nombreCompleto: "María García Rodríguez",
        tipoDocumento: "cc",
        numeroDocumento: "87654321",
        fechaNacimiento: "1985-03-20",
      },
    ]

    // Agregar usuarios adicionales si no existen
    additionalUsers.forEach((user) => {
      const exists = window.authSystem.users.find((u) => u.usuario === user.usuario)
      if (!exists) {
        window.authSystem.users.push(user)
      }
    })
  }

  // Función para mostrar información de ayuda
  window.showLoginHelp = () => {
    const helpText = `
🔐 CREDENCIALES DE PRUEBA:

👨‍💼 ADMIN:
• Usuario: admin@sistema.com
• Contraseña: admin123

👨‍⚕️ DOCTOR:
• Usuario: doctor@hospital.com  
• Contraseña: doctor123

👤 PACIENTE:
• Usuario: paciente@email.com
• Contraseña: paciente123

💡 TIPS:
• Selecciona el tipo de usuario correcto
• Cualquier código de 6 dígitos funciona para 2FA
• Puedes registrar nuevos usuarios
    `

    alert(helpText)
  }

  // Agregar botón de ayuda si no existe
  const loginCard = document.querySelector(".login-card")
  if (loginCard && !document.getElementById("helpButton")) {
    const helpButton = document.createElement("button")
    helpButton.id = "helpButton"
    helpButton.type = "button"
    helpButton.className = "btn btn-outline btn-sm"
    helpButton.style.cssText = `
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 10;
    `
    helpButton.innerHTML = '<i class="fas fa-question-circle"></i> Ayuda'
    helpButton.onclick = window.showLoginHelp

    loginCard.style.position = "relative"
    loginCard.appendChild(helpButton)
  }
})
