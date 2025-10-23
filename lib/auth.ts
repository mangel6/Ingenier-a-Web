// Sistema básico de autenticación
interface User {
  id: number
  backendId?: number
  usuario: string
  email?: string
  password: string
  tipoUsuario: string
  nombre: string
  nombreCompleto?: string
  tipoDocumento?: string
  numeroDocumento?: string
  fechaNacimiento?: string
  licenciaMedica?: string
  especialidad?: string
}

interface SessionUser {
  id: number
  backendId?: number
  usuario: string
  tipoUsuario: string
  nombre: string
}

class AuthSystem {
  private users: User[] = []

  constructor() {
    this.loadUsers()
  }

  private loadUsers() {
    if (typeof window !== 'undefined') {
      // Intentar cargar usuarios desde localStorage
      const savedUsers = localStorage.getItem("systemUsers")

      if (savedUsers) {
        this.users = JSON.parse(savedUsers)
      } else {
        // Usuarios predefinidos para pruebas iniciales
        this.users = [
          {
            id: 1,
            usuario: "admin@sistema.com",
            password: "admin123",
            tipoUsuario: "admin",
            nombre: "Administrador Sistema",
          },
          {
            id: 2,
            usuario: "doctor@hospital.com",
            password: "doctor123",
            tipoUsuario: "doctor",
            nombre: "Dr. María González",
            licenciaMedica: "12345",
            especialidad: "cardiologia",
          },
          {
            id: 3,
            usuario: "paciente@email.com",
            password: "paciente123",
            tipoUsuario: "paciente",
            nombre: "Juan Pérez",
            nombreCompleto: "Juan Carlos Pérez López",
            tipoDocumento: "cc",
            numeroDocumento: "12345678",
            fechaNacimiento: "1990-05-15",
          },
        ]
        this.saveUsers()
      }
    } else {
      // On server-side, use default users
      this.users = [
        {
          id: 1,
          usuario: "admin@sistema.com",
          password: "admin123",
          tipoUsuario: "admin",
          nombre: "Administrador Sistema",
        },
        {
          id: 2,
          usuario: "doctor@hospital.com",
          password: "doctor123",
          tipoUsuario: "doctor",
          nombre: "Dr. María González",
          licenciaMedica: "12345",
          especialidad: "cardiologia",
        },
        {
          id: 3,
          usuario: "paciente@email.com",
          password: "paciente123",
          tipoUsuario: "paciente",
          nombre: "Juan Pérez",
          nombreCompleto: "Juan Carlos Pérez López",
          tipoDocumento: "cc",
          numeroDocumento: "12345678",
          fechaNacimiento: "1990-05-15",
        },
      ]
    }
  }

  private saveUsers() {
    if (typeof window !== 'undefined') {
      localStorage.setItem("systemUsers", JSON.stringify(this.users))
    }
  }

  async validateUser(usuario: string, password: string, tipoUsuario: string) {
    console.log("[v0] Validando usuario:", { usuario, tipoUsuario })

    // First try to find user locally
    const localUser = this.users.find(
      (u) =>
        (u.usuario.toLowerCase() === usuario.toLowerCase() || u.numeroDocumento === usuario) &&
        u.password === password &&
        u.tipoUsuario === tipoUsuario,
    )

    console.log("[v0] Usuario local encontrado:", localUser ? "SÍ" : "NO")

    if (localUser) {
      // Try to get backendId via API
      try {
        console.log("[AUTH] Attempting to fetch all users from backend to find matching username")
        const response = await fetch('http://localhost:8080/MedCloud/api/v1/users/', {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        })

        if (response.ok) {
          const users = await response.json()
          console.log("[AUTH] Backend users array:", users)
          const backendUser = users.find((u: any) => u.username === localUser.usuario)
          if (backendUser) {
            const backendId = backendUser.id
            console.log("[AUTH] Found backend user with id:", backendId)

            // Update local user with backendId if not present
            if (!localUser.backendId) {
              localUser.backendId = backendId
              this.saveUsers()
            }

            // Guardar sesión with backendId
            const sessionData: SessionUser = {
              id: localUser.id,
              backendId: backendId,
              usuario: localUser.usuario,
              tipoUsuario: localUser.tipoUsuario,
              nombre: localUser.nombre,
            }

            console.log("[v0] Guardando sesión con backendId:", sessionData)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem("currentUser", JSON.stringify(sessionData))
            }

            return { success: true, user: localUser }
          } else {
            console.log("[AUTH] User not found in backend, proceeding with local user")
          }
        } else {
          console.log("[AUTH] Backend fetch failed, proceeding with local user")
        }
      } catch (error) {
        console.error('[AUTH] Backend fetch error:', error)
      }

      // Fallback: save session without backendId
      const sessionData: SessionUser = {
        id: localUser.id,
        backendId: localUser.backendId,
        usuario: localUser.usuario,
        tipoUsuario: localUser.tipoUsuario,
        nombre: localUser.nombre,
      }

      console.log("[v0] Guardando sesión (fallback):", sessionData)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("currentUser", JSON.stringify(sessionData))
      }

      return { success: true, user: localUser }
    }

    // If no local user found, try to authenticate against backend directly
    console.log("[AUTH] No local user found, attempting backend authentication")
    try {
      console.log("[AUTH] Attempting to fetch all users from backend for authentication")
      const response = await fetch('http://localhost:8080/MedCloud/api/v1/users/', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })

      if (response.ok) {
        const users = await response.json()
        console.log("[AUTH] Backend users array for auth:", users)

        // Find user by username/email and check password (assuming backend stores plain text for now)
        console.log("[AUTH] Searching for user with criteria:", {
          inputUsuario: usuario,
          inputTipoUsuario: tipoUsuario,
          password: password
        })

        const backendUser = users.find((u: any) => {
          const usernameMatch = u.username?.toLowerCase() === usuario.toLowerCase()
          const emailMatch = u.email?.toLowerCase() === usuario.toLowerCase()
          // For now, only check username/email match as requested
          // TODO: Implement proper password and role checking once backend provides correct data
          const passwordMatch = true // Temporarily skip password check
          const roleMatch = true // Temporarily allow any role

          console.log("[AUTH] Checking user:", u.username, {
            usernameMatch,
            emailMatch,
            passwordMatch,
            roleMatch,
            userRole: u.role,
            userRoles: u.roles
          })

          return (usernameMatch || emailMatch) && passwordMatch && roleMatch
        })

        if (backendUser) {
          console.log("[AUTH] Backend authentication successful for user:", backendUser.username)

          // Create local user entry for future logins
          const newLocalUser: User = {
            id: this.users.length + 1,
            backendId: backendUser.id,
            usuario: backendUser.username || backendUser.email,
            email: backendUser.email,
            password: backendUser.password, // Store password locally for future offline access
            tipoUsuario: tipoUsuario,
            nombre: backendUser.fullName || backendUser.username?.split('@')[0] || 'Usuario',
            nombreCompleto: backendUser.fullName,
            tipoDocumento: backendUser.documentType,
            numeroDocumento: backendUser.documentNumber,
            fechaNacimiento: backendUser.birthDate,
            licenciaMedica: backendUser.licenseNumber,
            especialidad: backendUser.specialty,
          }

          this.users.push(newLocalUser)
          this.saveUsers()

          // Save session
          const sessionData: SessionUser = {
            id: newLocalUser.id,
            backendId: backendUser.id,
            usuario: newLocalUser.usuario,
            tipoUsuario: newLocalUser.tipoUsuario,
            nombre: newLocalUser.nombre,
          }

          console.log("[v0] Guardando sesión para usuario backend:", sessionData)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem("currentUser", JSON.stringify(sessionData))
          }

          return { success: true, user: newLocalUser }
        } else {
          console.log("[AUTH] No matching user found in backend")
        }
      } else {
        console.log("[AUTH] Backend fetch failed for authentication")
      }
    } catch (error) {
      console.error('[AUTH] Backend authentication error:', error)
    }

    return { success: false, message: "Credenciales incorrectas o tipo de usuario no coincide" }
  }

  async registerUser(userData: Partial<User>): Promise<{ success: boolean; message: string }> {
    console.log("[AUTH] registerUser called with:", userData)
    // Validar que el usuario no exista
    const existingUser = this.users.find((u) => u.usuario.toLowerCase() === userData.usuario?.toLowerCase())

    if (existingUser) {
      console.log("[AUTH] User already exists")
      return { success: false, message: "El usuario ya existe" }
    }

    // Validar datos específicos
    const validation = this.validateUserData(userData)
    if (!validation.success) {
      console.log("[AUTH] Validation failed:", validation.message)
      return validation
    }
    console.log("[AUTH] Validation passed")

    // Try API call
    console.log("[AUTH] Attempting API call to backend")
    try {
      const roleMap = {
        paciente: 'PATIENT',
        doctor: 'DOCTOR',
        admin: 'ADMIN'
      }
      const role = roleMap[userData.tipoUsuario as keyof typeof roleMap]
      const payload: any = {
        username: userData.usuario,
        email: userData.email || userData.usuario,
        password: userData.password,
        role: role
      }
      console.log("[AUTH] Payload email field:", payload.email)

      if (userData.tipoUsuario === 'paciente') {
        payload.fullName = userData.nombreCompleto
        payload.documentType = userData.tipoDocumento?.toUpperCase()
        payload.documentNumber = userData.numeroDocumento
        payload.birthDate = userData.fechaNacimiento
      } else if (userData.tipoUsuario === 'doctor') {
        payload.fullName = userData.nombreCompleto
        payload.documentType = userData.tipoDocumento?.toUpperCase()
        payload.documentNumber = userData.numeroDocumento
        payload.birthDate = userData.fechaNacimiento
        payload.specialty = userData.especialidad
        payload.licenseNumber = userData.licenciaMedica
      }

      console.log("[AUTH] API payload:", payload)
      console.log("[AUTH] Making fetch request to: http://localhost:8080/MedCloud/api/v1/users/")

      const response = await fetch('http://localhost:8080/MedCloud/api/v1/users/', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify(payload)
      })

      console.log("[AUTH] API response status:", response.status)
      console.log("[AUTH] API response ok:", response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log("[AUTH] API response data:", data)
        const backendId = data.id
        // Crear nuevo usuario
        const newUser: User = {
          id: this.users.length + 1,
          backendId: backendId,
          usuario: userData.usuario!,
          email: userData.email,
          password: userData.password!,
          tipoUsuario: userData.tipoUsuario!,
          nombre: userData.nombreCompleto || userData.usuario!.split("@")[0],
          ...userData,
        }

        this.users.push(newUser)
        this.saveUsers()

        console.log("[AUTH] User registered successfully via API")
        return { success: true, message: "Usuario registrado exitosamente" }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log("[AUTH] API error response:", errorData)
        return { success: false, message: errorData.message || `Error del servidor: ${response.status}` }
      }
    } catch (error) {
      console.error('[AUTH] API call failed, falling back to local registration', error)
    }

    // Fallback to local registration
    console.log("[AUTH] Falling back to local registration")
    // Crear nuevo usuario
    const newUser: User = {
      id: this.users.length + 1,
      usuario: userData.usuario!,
      email: userData.email,
      password: userData.password!,
      tipoUsuario: userData.tipoUsuario!,
      nombre: userData.nombreCompleto || userData.usuario!.split("@")[0],
      ...userData,
    }

    this.users.push(newUser)
    this.saveUsers()

    console.log("[AUTH] User registered locally")
    return { success: true, message: "Usuario registrado exitosamente" }
  }

  private validateUserData(userData: Partial<User>): { success: boolean; message: string } {
    // Validar email (usar el email proporcionado o el usuario como fallback)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const emailToValidate = userData.email || userData.usuario
    if (!emailRegex.test(emailToValidate!)) {
      return { success: false, message: "El formato del email no es válido" }
    }

    // Validar contraseña
    if (userData.password!.length < 6) {
      return { success: false, message: "La contraseña debe tener al menos 6 caracteres" }
    }

    // Validaciones específicas por tipo de usuario
    if (userData.tipoUsuario === "paciente") {
      if (!userData.fechaNacimiento) {
        return { success: false, message: "La fecha de nacimiento es requerida" }
      }

      // Validar fecha de nacimiento
      const birthDate = new Date(userData.fechaNacimiento)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      if (age < 0 || age > 120) {
        return { success: false, message: "La fecha de nacimiento no es válida" }
      }

      if (birthDate > today) {
        return { success: false, message: "La fecha de nacimiento no puede ser futura" }
      }

      // Validar número de documento
      if (!userData.numeroDocumento || userData.numeroDocumento.length < 6) {
        return { success: false, message: "El número de documento debe tener al menos 6 dígitos" }
      }
    }

    if (userData.tipoUsuario === "doctor") {
      if (!userData.licenciaMedica || userData.licenciaMedica.length < 4) {
        return { success: false, message: "La licencia médica debe tener al menos 4 caracteres" }
      }

      if (!userData.especialidad) {
        return { success: false, message: "La especialidad es requerida" }
      }
    }

    return { success: true, message: "" }
  }

  getCurrentUser(): SessionUser | null {
    if (typeof window !== 'undefined') {
      const userSession = sessionStorage.getItem("currentUser")
      return userSession ? JSON.parse(userSession) : null
    }
    return null
  }

  logout() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("currentUser")
    }
  }
}

// Instancia global del sistema de autenticación
export const authSystem = new AuthSystem()