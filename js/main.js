<<<<<<< HEAD
// Main JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize tooltips
  initializeTooltips()

  // Initialize modals
  initializeModals()

  // Initialize search functionality
  initializeSearch()

  // Initialize notifications
  initializeNotifications()

  // Initialize theme toggle
  initializeThemeToggle()
})

// Tooltip functionality
function initializeTooltips() {
  const tooltipElements = document.querySelectorAll("[data-tooltip]")

  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", showTooltip)
    element.addEventListener("mouseleave", hideTooltip)
  })
}

function showTooltip(e) {
  const tooltip = document.createElement("div")
  tooltip.className = "tooltip"
  tooltip.textContent = e.target.getAttribute("data-tooltip")
  document.body.appendChild(tooltip)

  const rect = e.target.getBoundingClientRect()
  tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px"
  tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + "px"
}

function hideTooltip() {
  const tooltip = document.querySelector(".tooltip")
  if (tooltip) {
    tooltip.remove()
  }
}

// Modal functionality
function initializeModals() {
  const modalTriggers = document.querySelectorAll("[data-modal]")
  const modalCloses = document.querySelectorAll("[data-modal-close]")

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      e.preventDefault()
      const modalId = this.getAttribute("data-modal")
      const modal = document.getElementById(modalId)
      if (modal) {
        modal.classList.add("active")
        document.body.style.overflow = "hidden"
      }
    })
  })

  modalCloses.forEach((close) => {
    close.addEventListener("click", function () {
      const modal = this.closest(".modal")
      if (modal) {
        modal.classList.remove("active")
        document.body.style.overflow = ""
      }
    })
  })

  // Close modal on backdrop click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      e.target.closest(".modal").classList.remove("active")
      document.body.style.overflow = ""
    }
  })
}

// Search functionality
function initializeSearch() {
  const searchInputs = document.querySelectorAll("[data-search]")

  searchInputs.forEach((input) => {
    input.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const targetSelector = this.getAttribute("data-search")
      const targets = document.querySelectorAll(targetSelector)

      targets.forEach((target) => {
        const text = target.textContent.toLowerCase()
        if (text.includes(searchTerm)) {
          target.style.display = ""
        } else {
          target.style.display = "none"
        }
      })
    })
  })
}

// Notification functionality
function initializeNotifications() {
  window.showNotification = (message, type = "info", duration = 5000) => {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `

    const container = document.getElementById("notification-container") || createNotificationContainer()
    container.appendChild(notification)

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, duration)
  }
}

function createNotificationContainer() {
  const container = document.createElement("div")
  container.id = "notification-container"
  container.className = "notification-container"
  document.body.appendChild(container)
  return container
}

// Theme toggle functionality
function initializeThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle")
  const currentTheme = localStorage.getItem("theme") || "light"

  document.documentElement.setAttribute("data-theme", currentTheme)

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme")
      const newTheme = currentTheme === "dark" ? "light" : "dark"

      document.documentElement.setAttribute("data-theme", newTheme)
      localStorage.setItem("theme", newTheme)
    })
  }
}

// Utility functions
function formatDate(date) {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

function formatTime(date) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Export functions for use in other scripts
window.MedicalSystem = {
  showNotification: window.showNotification,
  formatDate,
  formatTime,
  debounce,
=======
// Main JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize tooltips
  initializeTooltips()

  // Initialize modals
  initializeModals()

  // Initialize search functionality
  initializeSearch()

  // Initialize notifications
  initializeNotifications()

  // Initialize theme toggle
  initializeThemeToggle()
})

// Tooltip functionality
function initializeTooltips() {
  const tooltipElements = document.querySelectorAll("[data-tooltip]")

  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", showTooltip)
    element.addEventListener("mouseleave", hideTooltip)
  })
}

function showTooltip(e) {
  const tooltip = document.createElement("div")
  tooltip.className = "tooltip"
  tooltip.textContent = e.target.getAttribute("data-tooltip")
  document.body.appendChild(tooltip)

  const rect = e.target.getBoundingClientRect()
  tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px"
  tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + "px"
}

function hideTooltip() {
  const tooltip = document.querySelector(".tooltip")
  if (tooltip) {
    tooltip.remove()
  }
}

// Modal functionality
function initializeModals() {
  const modalTriggers = document.querySelectorAll("[data-modal]")
  const modalCloses = document.querySelectorAll("[data-modal-close]")

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      e.preventDefault()
      const modalId = this.getAttribute("data-modal")
      const modal = document.getElementById(modalId)
      if (modal) {
        modal.classList.add("active")
        document.body.style.overflow = "hidden"
      }
    })
  })

  modalCloses.forEach((close) => {
    close.addEventListener("click", function () {
      const modal = this.closest(".modal")
      if (modal) {
        modal.classList.remove("active")
        document.body.style.overflow = ""
      }
    })
  })

  // Close modal on backdrop click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      e.target.closest(".modal").classList.remove("active")
      document.body.style.overflow = ""
    }
  })
}

// Search functionality
function initializeSearch() {
  const searchInputs = document.querySelectorAll("[data-search]")

  searchInputs.forEach((input) => {
    input.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const targetSelector = this.getAttribute("data-search")
      const targets = document.querySelectorAll(targetSelector)

      targets.forEach((target) => {
        const text = target.textContent.toLowerCase()
        if (text.includes(searchTerm)) {
          target.style.display = ""
        } else {
          target.style.display = "none"
        }
      })
    })
  })
}

// Notification functionality
function initializeNotifications() {
  window.showNotification = (message, type = "info", duration = 5000) => {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `

    const container = document.getElementById("notification-container") || createNotificationContainer()
    container.appendChild(notification)

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, duration)
  }
}

function createNotificationContainer() {
  const container = document.createElement("div")
  container.id = "notification-container"
  container.className = "notification-container"
  document.body.appendChild(container)
  return container
}

// Theme toggle functionality
function initializeThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle")
  const currentTheme = localStorage.getItem("theme") || "light"

  document.documentElement.setAttribute("data-theme", currentTheme)

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme")
      const newTheme = currentTheme === "dark" ? "light" : "dark"

      document.documentElement.setAttribute("data-theme", newTheme)
      localStorage.setItem("theme", newTheme)
    })
  }
}

// Utility functions
function formatDate(date) {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

function formatTime(date) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Export functions for use in other scripts
window.MedicalSystem = {
  showNotification: window.showNotification,
  formatDate,
  formatTime,
  debounce,
>>>>>>> fe43cde089c49753e79419f4bf25c3b4b8e9a71e
}
