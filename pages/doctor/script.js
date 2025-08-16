// Rick and Morty API Integration with Search and Pagination
class RickMortyAPI {
  constructor() {
    this.baseURL = "https://rickandmortyapi.com/api/character"
    this.currentPage = 1
    this.totalPages = 1
    this.currentFilters = {}
    this.isLoading = false

    // DOM elements
    this.characterContainer = document.getElementById("character-container")
    this.searchName = document.getElementById("searchName")
    this.filterStatus = document.getElementById("filterStatus")
    this.filterSpecies = document.getElementById("filterSpecies")
    this.filterGender = document.getElementById("filterGender")
    this.searchBtn = document.getElementById("searchBtn")
    this.clearBtn = document.getElementById("clearBtn")
    this.refreshBtn = document.getElementById("refreshBtn")
    this.resultsCount = document.getElementById("resultsCount")
    this.resultsInfo = document.getElementById("resultsInfo")
    this.pageInfo = document.getElementById("pageInfo")
    this.firstPageBtn = document.getElementById("firstPageBtn")
    this.prevPageBtn = document.getElementById("prevPageBtn")
    this.nextPageBtn = document.getElementById("nextPageBtn")
    this.lastPageBtn = document.getElementById("lastPageBtn")
    this.messagesRegion = document.getElementById("rickMortyMessages")
    this.errorsRegion = document.getElementById("rickMortyErrors")

    this.init()
  }

  init() {
    this.bindEvents()
    this.loadCharacters()
    this.announceMessage("Página de Rick y Morty cargada. Usa los filtros para buscar personajes específicos.")
  }

  bindEvents() {
    // Search and filter events
    this.searchBtn.addEventListener("click", () => this.handleSearch())
    this.clearBtn.addEventListener("click", () => this.clearFilters())
    this.refreshBtn.addEventListener("click", () => this.refreshData())

    // Enter key support for search
    this.searchName.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleSearch()
      }
    })

    // Real-time search with debounce
    let searchTimeout
    this.searchName
      .addEventListener("input", () => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
          if (this.searchName.value.length >= 3 || this.searchName.value.length === 0) {
            this.handleSearch()
          }
        }, 500)
      })

      [(this.filterStatus, this.filterSpecies, this.filterGender)].forEach((filter) => {
        filter.addEventListener("change", () => this.handleSearch())
      })

    // Pagination events
    this.firstPageBtn.addEventListener("click", () => this.goToPage(1))
    this.prevPageBtn.addEventListener("click", () => this.goToPage(this.currentPage - 1))
    this.nextPageBtn.addEventListener("click", () => this.goToPage(this.currentPage + 1))
    this.lastPageBtn.addEventListener("click", () => this.goToPage(this.totalPages))

    // Keyboard navigation for pagination
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault()
            if (this.currentPage > 1) this.goToPage(this.currentPage - 1)
            break
          case "ArrowRight":
            e.preventDefault()
            if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1)
            break
        }
      }
    })
  }

  async loadCharacters(page = 1, filters = {}) {
    if (this.isLoading) return

    this.isLoading = true
    this.showLoading()

    try {
      const url = this.buildURL(page, filters)
      console.log("[v0] Fetching characters from:", url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] API Response:", data)

      this.currentPage = page
      this.totalPages = data.info.pages
      this.currentFilters = filters

      this.renderCharacters(data.results)
      this.updatePagination(data.info)
      this.updateResultsSummary(data.info)

      this.announceMessage(`Cargados ${data.results.length} personajes. Página ${page} de ${data.info.pages}.`)
    } catch (error) {
      console.error("[v0] Error loading characters:", error)
      this.handleError(error.message)
    } finally {
      this.isLoading = false
    }
  }

  buildURL(page, filters) {
    const params = new URLSearchParams()

    params.append("page", page.toString())

    if (filters.name) params.append("name", filters.name)
    if (filters.status) params.append("status", filters.status)
    if (filters.species) params.append("species", filters.species)
    if (filters.gender) params.append("gender", filters.gender)

    return `${this.baseURL}?${params.toString()}`
  }

  renderCharacters(characters) {
    if (!characters || characters.length === 0) {
      this.characterContainer.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-xl);">
                    <div class="card-content">
                        <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: var(--spacing-md);"></i>
                        <h3>No se encontraron personajes</h3>
                        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">
                            Intenta ajustar los filtros de búsqueda o usar términos diferentes.
                        </p>
                        <button class="btn btn-primary" onclick="rickMortyAPI.clearFilters()">
                            <i class="fas fa-times"></i>
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            `
      return
    }

    const characterCards = characters
      .map((character) => {
        const statusClass = this.getStatusClass(character.status)
        const statusIcon = this.getStatusIcon(character.status)

        return `
                <article class="character-card" role="article" aria-labelledby="char-${character.id}">
                    <img src="${character.image}" 
                         alt="Imagen de ${character.name}" 
                         loading="lazy"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA0MEMyNi44NjI5IDQwIDAgNjYuODYyOSAwIDEwMFMyNi44NjI5IDE2MCA2MCA2MFM2MCA4Ni44NjI5IDYwIDYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'">
                    <h3 id="char-${character.id}">${character.name}</h3>
                    <p><strong>Especie:</strong> ${character.species}</p>
                    <p><strong>Género:</strong> ${this.translateGender(character.gender)}</p>
                    <p><strong>Origen:</strong> ${character.origin.name}</p>
                    <div class="character-status ${statusClass}" role="status" aria-label="Estado: ${this.translateStatus(character.status)}">
                        <i class="${statusIcon}" aria-hidden="true"></i>
                        ${this.translateStatus(character.status)}
                    </div>
                </article>
            `
      })
      .join("")

    this.characterContainer.innerHTML = characterCards
  }

  getStatusClass(status) {
    switch (status.toLowerCase()) {
      case "alive":
        return "status-alive"
      case "dead":
        return "status-dead"
      default:
        return "status-unknown"
    }
  }

  getStatusIcon(status) {
    switch (status.toLowerCase()) {
      case "alive":
        return "fas fa-heart"
      case "dead":
        return "fas fa-skull"
      default:
        return "fas fa-question"
    }
  }

  translateStatus(status) {
    switch (status.toLowerCase()) {
      case "alive":
        return "Vivo"
      case "dead":
        return "Muerto"
      default:
        return "Desconocido"
    }
  }

  translateGender(gender) {
    switch (gender.toLowerCase()) {
      case "male":
        return "Masculino"
      case "female":
        return "Femenino"
      case "genderless":
        return "Sin género"
      default:
        return "Desconocido"
    }
  }

  updatePagination(info) {
    this.pageInfo.textContent = `Página ${this.currentPage} de ${info.pages}`

    // Update button states
    this.firstPageBtn.disabled = this.currentPage === 1
    this.prevPageBtn.disabled = this.currentPage === 1
    this.nextPageBtn.disabled = this.currentPage === info.pages
    this.lastPageBtn.disabled = this.currentPage === info.pages

    // Update aria-labels with context
    this.prevPageBtn.setAttribute("aria-label", `Página anterior (${this.currentPage - 1})`)
    this.nextPageBtn.setAttribute("aria-label", `Página siguiente (${this.currentPage + 1})`)
  }

  updateResultsSummary(info) {
    this.resultsCount.textContent = `${info.count} personajes encontrados`

    const startResult = (this.currentPage - 1) * 20 + 1
    const endResult = Math.min(this.currentPage * 20, info.count)
    this.resultsInfo.textContent = `Mostrando ${startResult}-${endResult} de ${info.count}`
  }

  showLoading() {
    this.characterContainer.innerHTML = `
            <div class="loading-spinner" style="grid-column: 1 / -1;">
                <div class="spinner" role="status" aria-label="Cargando personajes"></div>
            </div>
        `
    this.resultsCount.textContent = "Cargando..."
    this.resultsInfo.textContent = ""
  }

  handleSearch() {
    const filters = {
      name: this.searchName.value.trim(),
      status: this.filterStatus.value,
      species: this.filterSpecies.value,
      gender: this.filterGender.value,
    }

    // Remove empty filters
    Object.keys(filters).forEach((key) => {
      if (!filters[key]) delete filters[key]
    })

    console.log("[v0] Applying filters:", filters)
    this.loadCharacters(1, filters)

    // Announce search action
    const filterCount = Object.keys(filters).length
    if (filterCount > 0) {
      this.announceMessage(`Búsqueda aplicada con ${filterCount} filtro${filterCount > 1 ? "s" : ""}.`)
    }
  }

  clearFilters() {
    this.searchName.value = ""
    this.filterStatus.value = ""
    this.filterSpecies.value = ""
    this.filterGender.value = ""

    this.loadCharacters(1, {})
    this.announceMessage("Filtros limpiados. Mostrando todos los personajes.")
  }

  refreshData() {
    this.announceMessage("Recargando datos...")
    this.loadCharacters(this.currentPage, this.currentFilters)
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return

    this.loadCharacters(page, this.currentFilters)

    // Scroll to top of character container
    this.characterContainer.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  handleError(message) {
    console.error("[v0] Error handled:", message)

    this.characterContainer.innerHTML = `
            <div class="card" style="grid-column: 1 / -1;">
                <div class="card-content" style="text-align: center; padding: var(--spacing-xl);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error-color); margin-bottom: var(--spacing-md);"></i>
                    <h3 style="color: var(--error-color); margin-bottom: var(--spacing-md);">Error al cargar personajes</h3>
                    <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">
                        ${message}
                    </p>
                    <button class="btn btn-primary" onclick="rickMortyAPI.refreshData()">
                        <i class="fas fa-sync-alt"></i>
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        `

    this.resultsCount.textContent = "Error al cargar"
    this.resultsInfo.textContent = ""

    this.announceError(`Error: ${message}`)
  }

  announceMessage(message) {
    if (this.messagesRegion) {
      this.messagesRegion.textContent = message
      setTimeout(() => {
        this.messagesRegion.textContent = ""
      }, 3000)
    }
  }

  announceError(message) {
    if (this.errorsRegion) {
      this.errorsRegion.textContent = message
      setTimeout(() => {
        this.errorsRegion.textContent = ""
      }, 5000)
    }
  }
}

// Initialize the Rick and Morty API when DOM is loaded
let rickMortyAPI
document.addEventListener("DOMContentLoaded", () => {
  rickMortyAPI = new RickMortyAPI()
  // Make it globally available immediately
  window.rickMortyAPI = rickMortyAPI
})
