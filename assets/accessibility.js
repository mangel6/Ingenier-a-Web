// Accessibility enhancements for the medical system
document.addEventListener("DOMContentLoaded", () => {
  initializeAccessibility()
})

function initializeAccessibility() {
  // Initialize aria-live announcements
  initializeAriaLive()

  // Initialize keyboard navigation
  initializeKeyboardNavigation()

  // Initialize focus management
  initializeFocusManagement()

  // Initialize screen reader enhancements
  initializeScreenReaderEnhancements()
}

function initializeAriaLive() {
  // Get aria-live regions
  const dashboardMessages = document.getElementById("dashboardMessages")
  const urgentMessages = document.getElementById("urgentMessages")
  const patientMessages = document.getElementById("patientMessages")
  const urgentPatientMessages = document.getElementById("urgentPatientMessages")
  const loginMessages = document.getElementById("loginMessages")

  // Function to announce messages
  const announceMessage = (message, isUrgent = false) => {
    const targetElement = isUrgent
      ? urgentMessages || urgentPatientMessages
      : dashboardMessages || patientMessages || loginMessages

    if (targetElement) {
      targetElement.textContent = message

      // Clear message after announcement
      setTimeout(() => {
        targetElement.textContent = ""
      }, 1000)
    }
  }

  // Make announceMessage available globally within this scope
  window.announceAccessibilityMessage = announceMessage

  // Monitor stat changes and announce them
  const statElements = document.querySelectorAll('[aria-live="polite"]')
  statElements.forEach((element) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "characterData") {
          const newValue = element.textContent.trim()
          const label = element.getAttribute("aria-describedby")
          const labelElement = label ? document.getElementById(label) : null
          const labelText = labelElement ? labelElement.textContent : "Valor"

          if (newValue && !isNaN(newValue)) {
            announceMessage(`${labelText} actualizado a ${newValue}`)
          }
        }
      })
    })

    observer.observe(element, {
      childList: true,
      characterData: true,
      subtree: true,
    })
  })
}

function initializeKeyboardNavigation() {
  // Enhanced keyboard navigation for sidebar
  const sidebarLinks = document.querySelectorAll(".nav-link")

  sidebarLinks.forEach((link, index) => {
    link.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          const nextLink = sidebarLinks[index + 1] || sidebarLinks[0]
          nextLink.focus()
          break
        case "ArrowUp":
          e.preventDefault()
          const prevLink = sidebarLinks[index - 1] || sidebarLinks[sidebarLinks.length - 1]
          prevLink.focus()
          break
        case "Home":
          e.preventDefault()
          sidebarLinks[0].focus()
          break
        case "End":
          e.preventDefault()
          sidebarLinks[sidebarLinks.length - 1].focus()
          break
      }
    })
  })

  // Enhanced keyboard navigation for cards and lists
  const interactiveElements = document.querySelectorAll(".list-item, .card, button, input, select")

  interactiveElements.forEach((element) => {
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (element.classList.contains("list-item")) {
          const button = element.querySelector("button")
          if (button) {
            e.preventDefault()
            button.click()
          }
        }
      }
    })
  })
}

function initializeFocusManagement() {
  // Manage focus for sidebar toggle
  const sidebarToggle = document.querySelector(".sidebar-toggle-btn")
  const sidebar = document.querySelector(".sidebar")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      const isExpanded = sidebar.classList.contains("active")
      sidebarToggle.setAttribute("aria-expanded", isExpanded.toString())

      if (isExpanded) {
        // Focus first nav link when sidebar opens
        const firstNavLink = sidebar.querySelector(".nav-link")
        if (firstNavLink) {
          setTimeout(() => firstNavLink.focus(), 100)
        }
      }
    })
  }

  // Trap focus in modals and overlays
  const overlay = document.querySelector(".sidebar-overlay")
  if (overlay) {
    overlay.addEventListener("click", () => {
      if (sidebarToggle) {
        sidebarToggle.focus()
      }
    })
  }

  // Manage focus for form elements
  const formElements = document.querySelectorAll("input, select, textarea")
  formElements.forEach((element) => {
    element.addEventListener("focus", () => {
      const helpText = element.getAttribute("aria-describedby")
      if (helpText) {
        const helpElement = document.getElementById(helpText)
        if (helpElement && helpElement.classList.contains("sr-only")) {
          if (window.announceAccessibilityMessage) {
            window.announceAccessibilityMessage(helpElement.textContent)
          }
        }
      }
    })
  })
}

function initializeScreenReaderEnhancements() {
  // Enhance button descriptions
  const buttons = document.querySelectorAll("button:not([aria-label]):not([aria-labelledby])")
  buttons.forEach((button) => {
    const icon = button.querySelector("i")
    const text = button.textContent.trim()

    if (icon && !text) {
      // Button with only icon needs aria-label
      const iconClass = icon.className
      let label = "Botón"

      if (iconClass.includes("fa-eye")) label = "Ver detalles"
      else if (iconClass.includes("fa-download")) label = "Descargar"
      else if (iconClass.includes("fa-search")) label = "Buscar"
      else if (iconClass.includes("fa-bell")) label = "Notificaciones"
      else if (iconClass.includes("fa-bars")) label = "Menú"

      button.setAttribute("aria-label", label)
    }
  })

  // Enhance status indicators
  const statusDots = document.querySelectorAll(".status-dot:not([aria-label])")
  statusDots.forEach((dot) => {
    if (dot.classList.contains("green")) {
      dot.setAttribute("aria-label", "Estado activo")
    } else if (dot.classList.contains("red")) {
      dot.setAttribute("aria-label", "Estado crítico")
    } else if (dot.classList.contains("orange")) {
      dot.setAttribute("aria-label", "Estado de advertencia")
    } else if (dot.classList.contains("blue")) {
      dot.setAttribute("aria-label", "Estado informativo")
    }
  })

  // Enhance progress bars
  const progressBars = document.querySelectorAll(".progress-bar:not([role])")
  progressBars.forEach((bar) => {
    const fill = bar.querySelector(".progress-fill")
    if (fill) {
      const width = fill.style.width
      const value = Number.parseInt(width) || 0

      bar.setAttribute("role", "progressbar")
      bar.setAttribute("aria-valuenow", value.toString())
      bar.setAttribute("aria-valuemin", "0")
      bar.setAttribute("aria-valuemax", "100")
    }
  })

  // Announce page changes
  const pageTitle = document.querySelector(".page-title")
  if (pageTitle && window.announceAccessibilityMessage) {
    window.announceAccessibilityMessage(`Página cargada: ${pageTitle.textContent}`)
  }
}

// Utility functions for accessibility
window.AccessibilityUtils = {
  announceMessage: (message, isUrgent = false) => {
    const dashboardMessages = document.getElementById("dashboardMessages")
    const urgentMessages = document.getElementById("urgentMessages")
    const patientMessages = document.getElementById("patientMessages")
    const urgentPatientMessages = document.getElementById("urgentPatientMessages")
    const loginMessages = document.getElementById("loginMessages")

    const targetElement = isUrgent
      ? urgentMessages || urgentPatientMessages
      : dashboardMessages || patientMessages || loginMessages

    if (targetElement) {
      targetElement.textContent = message

      // Clear message after announcement
      setTimeout(() => {
        targetElement.textContent = ""
      }, 1000)
    }
  },

  // Focus management
  focusElement: (selector) => {
    const element = document.querySelector(selector)
    if (element) {
      element.focus()
      return true
    }
    return false
  },

  // Skip links
  addSkipLink: (targetSelector, linkText = "Saltar al contenido principal") => {
    const skipLink = document.createElement("a")
    skipLink.href = targetSelector
    skipLink.textContent = linkText
    skipLink.className = "skip-link sr-only"
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--primary-color);
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
    `

    skipLink.addEventListener("focus", () => {
      skipLink.style.top = "6px"
      skipLink.classList.remove("sr-only")
    })

    skipLink.addEventListener("blur", () => {
      skipLink.style.top = "-40px"
      skipLink.classList.add("sr-only")
    })

    document.body.insertBefore(skipLink, document.body.firstChild)
  },

  // Live region updates
  updateLiveRegion: (regionId, message, clearAfter = 3000) => {
    const region = document.getElementById(regionId)
    if (region) {
      region.textContent = message
      if (clearAfter > 0) {
        setTimeout(() => {
          region.textContent = ""
        }, clearAfter)
      }
    }
  },
}

// Initialize skip links
document.addEventListener("DOMContentLoaded", () => {
  window.AccessibilityUtils.addSkipLink(".main-content", "Saltar al contenido principal")
  window.AccessibilityUtils.addSkipLink(".sidebar-nav", "Saltar a la navegación")
})
