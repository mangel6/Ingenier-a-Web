document.addEventListener("DOMContentLoaded", () => {
  initializeResponsiveFeatures()
})

function initializeResponsiveFeatures() {
  // Inicializar sidebar móvil
  initializeMobileSidebar()

  // Inicializar detección de viewport
  initializeViewportDetection()

  // Inicializar manejo de orientación
  initializeOrientationHandler()
}

function initializeMobileSidebar() {
  const sidebarToggle = document.querySelector(".sidebar-toggle-btn")
  const sidebar = document.querySelector(".sidebar")
  const overlay = document.querySelector(".sidebar-overlay")

  if (!sidebarToggle || !sidebar) return

  // Crear overlay si no existe
  if (!overlay) {
    const newOverlay = document.createElement("div")
    newOverlay.className = "sidebar-overlay"
    document.body.appendChild(newOverlay)
  }

  const finalOverlay = document.querySelector(".sidebar-overlay")

  // Toggle sidebar
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active")
    finalOverlay.classList.toggle("active")
    document.body.style.overflow = sidebar.classList.contains("active") ? "hidden" : ""
  })

  // Cerrar sidebar al hacer click en overlay
  finalOverlay.addEventListener("click", () => {
    sidebar.classList.remove("active")
    finalOverlay.classList.remove("active")
    document.body.style.overflow = ""
  })

  // Cerrar sidebar con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      sidebar.classList.remove("active")
      finalOverlay.classList.remove("active")
      document.body.style.overflow = ""
    }
  })

  // Cerrar sidebar al cambiar a desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      sidebar.classList.remove("active")
      finalOverlay.classList.remove("active")
      document.body.style.overflow = ""
    }
  })
}

function initializeViewportDetection() {
  // Detectar tipo de dispositivo
  const updateViewportClass = () => {
    const width = window.innerWidth
    const body = document.body

    // Limpiar clases existentes
    body.classList.remove("mobile", "tablet", "desktop")

    if (width <= 768) {
      body.classList.add("mobile")
    } else if (width <= 1024) {
      body.classList.add("tablet")
    } else {
      body.classList.add("desktop")
    }
  }

  updateViewportClass()
  window.addEventListener("resize", updateViewportClass)
}

function initializeOrientationHandler() {
  const handleOrientationChange = () => {
    // Forzar recálculo de altura en móviles
    if (window.innerWidth <= 768) {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`)
    }
  }

  handleOrientationChange()
  window.addEventListener("resize", handleOrientationChange)
  window.addEventListener("orientationchange", () => {
    setTimeout(handleOrientationChange, 100)
  })
}

// Utilidades responsive
window.ResponsiveUtils = {
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,

  // Función para ejecutar código según breakpoint
  onBreakpoint: (breakpoint, callback) => {
    const checkBreakpoint = () => {
      let matches = false

      switch (breakpoint) {
        case "mobile":
          matches = window.innerWidth <= 768
          break
        case "tablet":
          matches = window.innerWidth > 768 && window.innerWidth <= 1024
          break
        case "desktop":
          matches = window.innerWidth > 1024
          break
      }

      if (matches) callback()
    }

    checkBreakpoint()
    window.addEventListener("resize", checkBreakpoint)
  },
}
