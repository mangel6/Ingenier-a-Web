document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el usuario está autenticado
  const currentUser = window.authSystem.getCurrentUser()

  if (!currentUser) {
    // Si no hay usuario autenticado, redirigir al login
    alert("Debes iniciar sesión para acceder a esta página")
    window.location.href = "index.html"
    return
  }

  // Verificar que el tipo de usuario coincida con la página
  const currentPath = window.location.pathname
  let requiredUserType = ""

  if (currentPath.includes("admin")) {
    requiredUserType = "admin"
  } else if (currentPath.includes("doctor")) {
    requiredUserType = "doctor"
  } else if (currentPath.includes("paciente")) {
    requiredUserType = "paciente"
  }

  if (requiredUserType && currentUser.tipoUsuario !== requiredUserType) {
    alert("No tienes permisos para acceder a esta página")
    // Redirigir al dashboard correcto según el tipo de usuario
    switch (currentUser.tipoUsuario) {
      case "admin":
        window.location.href = "dashboard-admin.html"
        break
      case "doctor":
        window.location.href = "dashboard-doctor.html"
        break
      case "paciente":
        window.location.href = "dashboard-paciente.html"
        break
      default:
        window.location.href = "index.html"
    }
    return
  }

  // Actualizar información del usuario en la página
  updateUserInfo(currentUser)

  // Agregar funcionalidad de logout
  addLogoutFunctionality()
})

function updateUserInfo(user) {
  // Buscar elementos que muestren información del usuario
  const userNameElements = document.querySelectorAll("[data-user-name]")
  const userTypeElements = document.querySelectorAll("[data-user-type]")

  userNameElements.forEach((element) => {
    element.textContent = user.nombre || user.usuario
  })

  userTypeElements.forEach((element) => {
    element.textContent = user.tipoUsuario
  })

  // Actualizar elementos específicos de cada dashboard
  const patientName = document.getElementById("patient-name")
  if (patientName) {
    patientName.textContent = user.nombre || user.usuario
  }

  const doctorName = document.getElementById("doctor-name")
  if (doctorName) {
    doctorName.textContent = `Dr. ${user.nombre || user.usuario}`
  }

  const adminName = document.getElementById("admin-name")
  if (adminName) {
    adminName.textContent = user.nombre || user.usuario
  }
}

function addLogoutFunctionality() {
  // Crear botón de logout si no existe
  const sidebar = document.querySelector(".sidebar")
  if (sidebar && !document.getElementById("logoutBtn")) {
    const logoutBtn = document.createElement("button")
    logoutBtn.id = "logoutBtn"
    logoutBtn.className = "btn btn-outline"
    logoutBtn.style.cssText = `
      margin: 1rem;
      width: calc(100% - 2rem);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    `
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión'

    logoutBtn.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        window.authSystem.logout()
        window.location.href = "index.html"
      }
    })

    sidebar.appendChild(logoutBtn)
  }
}
