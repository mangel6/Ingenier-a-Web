// Dashboard specific functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize dashboard components
  initializeDashboard()

  // Initialize charts if needed
  initializeCharts()

  // Initialize real-time updates
  initializeRealTimeUpdates()

  // Initialize sidebar toggle for mobile
  initializeSidebarToggle()
})

function initializeDashboard() {
  // Update progress bars
  updateProgressBars()

  // Initialize data tables
  initializeDataTables()

  // Initialize filters
  initializeFilters()

  // Load dashboard data
  loadDashboardData()
}

function updateProgressBars() {
  const progressBars = document.querySelectorAll(".progress-fill")

  progressBars.forEach((bar) => {
    const targetWidth = bar.style.width
    bar.style.width = "0%"

    setTimeout(() => {
      bar.style.width = targetWidth
    }, 100)
  })
}

function initializeDataTables() {
  const tables = document.querySelectorAll(".data-table")

  tables.forEach((table) => {
    // Add sorting functionality
    const headers = table.querySelectorAll("th[data-sort]")
    headers.forEach((header) => {
      header.addEventListener("click", function () {
        const column = this.getAttribute("data-sort")
        const direction = this.classList.contains("sort-asc") ? "desc" : "asc"
        sortTable(table, column, direction)

        // Update header classes
        headers.forEach((h) => h.classList.remove("sort-asc", "sort-desc"))
        this.classList.add(`sort-${direction}`)
      })
    })
  })
}

function sortTable(table, column, direction) {
  const tbody = table.querySelector("tbody")
  const rows = Array.from(tbody.querySelectorAll("tr"))

  rows.sort((a, b) => {
    const aValue = a.querySelector(`[data-column="${column}"]`).textContent.trim()
    const bValue = b.querySelector(`[data-column="${column}"]`).textContent.trim()

    if (direction === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  rows.forEach((row) => tbody.appendChild(row))
}

function initializeFilters() {
  const filterInputs = document.querySelectorAll("[data-filter]")

  filterInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const filterType = this.getAttribute("data-filter")
      const filterValue = this.value
      applyFilter(filterType, filterValue)
    })
  })
}

function applyFilter(type, value) {
  const items = document.querySelectorAll(`[data-filter-${type}]`)

  items.forEach((item) => {
    const itemValue = item.getAttribute(`data-filter-${type}`)
    if (value === "all" || itemValue === value) {
      item.style.display = ""
    } else {
      item.style.display = "none"
    }
  })
}

function initializeCharts() {
  // Simple chart implementation using CSS
  const chartContainers = document.querySelectorAll(".chart-container")

  chartContainers.forEach((container) => {
    const chartType = container.getAttribute("data-chart-type")
    const chartData = JSON.parse(container.getAttribute("data-chart-data") || "[]")

    if (chartType === "bar") {
      createBarChart(container, chartData)
    } else if (chartType === "line") {
      createLineChart(container, chartData)
    } else if (chartType === "pie") {
      createPieChart(container, chartData)
    }
  })
}

function createBarChart(container, data) {
  const maxValue = Math.max(...data.map((d) => d.value))

  const chartHTML = data
    .map(
      (item) => `
        <div class="bar-item">
            <div class="bar" style="height: ${(item.value / maxValue) * 100}%"></div>
            <div class="bar-label">${item.label}</div>
        </div>
    `,
    )
    .join("")

  container.innerHTML = `<div class="bar-chart">${chartHTML}</div>`
}

function createLineChart(container, data) {
  // Simple line chart implementation
  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - (item.value / Math.max(...data.map((d) => d.value))) * 100
      return `${x},${y}`
    })
    .join(" ")

  container.innerHTML = `
        <svg class="line-chart" viewBox="0 0 100 100">
            <polyline points="${points}" fill="none" stroke="var(--primary-color)" stroke-width="2"/>
        </svg>
    `
}

function createPieChart(container, data) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0

  const segments = data
    .map((item) => {
      const percentage = (item.value / total) * 100
      const angle = (item.value / total) * 360
      const x1 = 50 + 40 * Math.cos(((currentAngle - 90) * Math.PI) / 180)
      const y1 = 50 + 40 * Math.sin(((currentAngle - 90) * Math.PI) / 180)
      const x2 = 50 + 40 * Math.cos(((currentAngle + angle - 90) * Math.PI) / 180)
      const y2 = 50 + 40 * Math.sin(((currentAngle + angle - 90) * Math.PI) / 180)
      const largeArc = angle > 180 ? 1 : 0

      const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`
      currentAngle += angle

      return `<path d="${path}" fill="${item.color}" />`
    })
    .join("")

  container.innerHTML = `
        <svg class="pie-chart" viewBox="0 0 100 100">
            ${segments}
        </svg>
    `
}

function loadDashboardData() {
  // Simulate loading dashboard data
  const loadingElements = document.querySelectorAll(".loading")

  setTimeout(() => {
    loadingElements.forEach((element) => {
      element.classList.remove("loading")
    })
  }, 1000)
}

function initializeRealTimeUpdates() {
  // Simulate real-time updates
  setInterval(() => {
    updateNotificationCount()
    updateOnlineStatus()
  }, 30000) // Update every 30 seconds
}

function updateNotificationCount() {
  const notificationBadges = document.querySelectorAll(".notification-badge")
  notificationBadges.forEach((badge) => {
    const currentCount = Number.parseInt(badge.textContent) || 0
    // Simulate random notification updates
    if (Math.random() > 0.8) {
      badge.textContent = currentCount + 1
      badge.style.display = "inline-flex"
    }
  })
}

function updateOnlineStatus() {
  const statusIndicators = document.querySelectorAll(".status-indicator")
  statusIndicators.forEach((indicator) => {
    // Simulate connection status
    const isOnline = navigator.onLine
    indicator.classList.toggle("online", isOnline)
    indicator.classList.toggle("offline", !isOnline)
  })
}

function initializeSidebarToggle() {
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebar = document.querySelector(".sidebar")
  const mainContent = document.querySelector(".main-content")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
      mainContent.classList.toggle("expanded")
    })
  }
}

// Export dashboard functions
window.Dashboard = {
  updateProgressBars,
  applyFilter,
  loadDashboardData,
  updateNotificationCount,
}
