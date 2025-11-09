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
            usuario: "paciente@email.com",
            password: "paciente123",
            tipoUsuario: "paciente",
            nombre: "Juan Pérez",
            nombreCompleto: "Juan Carlos Pérez López",
            tipoDocumento: "cc",
            numeroDocumento: "12345678",
            fechaNacimiento: "1990-05-15",
          },
          {
            id: 2,
            usuario: "eps@empresa.com",
            password: "eps123",
            tipoUsuario: "eps",
            nombre: "EPS Salud Total",
          },
        ]
        this.saveUsers()
      }
    } else {
      // On server-side, use default users
      this.users = [
        {
          id: 1,
          usuario: "paciente@email.com",
          password: "paciente123",
          tipoUsuario: "paciente",
          nombre: "Juan Pérez",
          nombreCompleto: "Juan Carlos Pérez López",
          tipoDocumento: "cc",
          numeroDocumento: "12345678",
          fechaNacimiento: "1990-05-15",
        },
        {
          id: 2,
          usuario: "eps@empresa.com",
          password: "eps123",
          tipoUsuario: "eps",
          nombre: "EPS Salud Total",
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
    console.log("[AUTH] Validating user:", { usuario, tipoUsuario })

    // Handle patient login differently - no password required
    if (tipoUsuario === 'paciente') {
      console.log("[AUTH] Attempting patient login via /auth/patient-login")
      try {
        const patientLoginResponse = await fetch(`http://localhost:8080/MedCloud/api/v1/auth/patient-login?documentNumber=${encodeURIComponent(usuario)}`, {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        })

        if (patientLoginResponse.ok) {
          const patientData = await patientLoginResponse.json()
          console.log("[AUTH] Patient login successful:", patientData)

          // Create user from patient response data
          const user: User = {
            id: this.users.length + 1,
            backendId: 1, // Temporary ID
            usuario: patientData.documentNumber,
            email: patientData.documentNumber, // Use document as email for patients
            password: '', // No password for patients
            tipoUsuario: 'paciente',
            nombre: patientData.fullName,
            nombreCompleto: patientData.fullName,
            numeroDocumento: patientData.documentNumber,
          }

          // Check if user already exists locally, update or add
          const existingUserIndex = this.users.findIndex(u => u.numeroDocumento === patientData.documentNumber)
          if (existingUserIndex >= 0) {
            this.users[existingUserIndex] = user
          } else {
            this.users.push(user)
          }
          this.saveUsers()

          // Save session
          const sessionData: SessionUser = {
            id: user.id,
            backendId: user.backendId,
            usuario: user.usuario,
            tipoUsuario: user.tipoUsuario,
            nombre: user.nombre,
          }

          console.log("[AUTH] Saving patient session:", sessionData)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem("currentUser", JSON.stringify(sessionData))
            // Clear any JWT token for patients
            localStorage.removeItem("jwtToken")
            localStorage.removeItem("userEmail")
            localStorage.removeItem("userRole")
          }

          return { success: true, user: user }
        } else {
          const errorData = await patientLoginResponse.json().catch(() => ({}))
          console.log("[AUTH] Patient login failed:", errorData)
          return { success: false, message: errorData.message || "Paciente no encontrado" }
        }
      } catch (error) {
        console.error('[AUTH] Patient authentication error:', error)
        // Fallback to local patient authentication
        const localPatient = this.users.find(
          (u) => u.numeroDocumento === usuario && u.tipoUsuario === 'paciente'
        )
        if (localPatient) {
          console.log("[AUTH] Falling back to local patient authentication")
          const sessionData: SessionUser = {
            id: localPatient.id,
            backendId: localPatient.backendId,
            usuario: localPatient.usuario,
            tipoUsuario: localPatient.tipoUsuario,
            nombre: localPatient.nombre,
          }

          if (typeof window !== 'undefined') {
            sessionStorage.setItem("currentUser", JSON.stringify(sessionData))
          }

          return { success: true, user: localPatient }
        }
      }
    }

    // Handle EPS login with password and JWT
    // First try to find user locally for offline access
    const localUser = this.users.find(
      (u) =>
        (u.usuario.toLowerCase() === usuario.toLowerCase() || u.numeroDocumento === usuario) &&
        u.password === password &&
        u.tipoUsuario === tipoUsuario,
    )

    console.log("[AUTH] Local user found:", localUser ? "YES" : "NO")

    // Try backend authentication first
    try {
      console.log("[AUTH] Attempting backend login via /auth/login")
      const loginResponse = await fetch('http://localhost:8080/MedCloud/api/v1/auth/login', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          identifier: usuario,
          password: password
        })
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        console.log("[AUTH] Backend login successful:", loginData)

        // Store JWT token and user info
        if (typeof window !== 'undefined') {
          localStorage.setItem("jwtToken", loginData.token)
          localStorage.setItem("userEmail", loginData.email)
          localStorage.setItem("userRole", loginData.role)
        }

        // Map backend role to frontend user type
        const roleMapping: { [key: string]: string } = {
          'PACIENTE': 'paciente',
          'EPS': 'eps'
        }

        const mappedRole = roleMapping[loginData.role] || loginData.role.toLowerCase().replace("role_", "")

        // Create user from login response data
        const user: User = {
          id: this.users.length + 1,
          backendId: 1, // Temporary ID
          usuario: loginData.email,
          email: loginData.email,
          password: password, // Store for offline access
          tipoUsuario: mappedRole,
          nombre: loginData.email.split('@')[0] || 'Usuario',
          nombreCompleto: loginData.email.split('@')[0] || 'Usuario',
        }

        // Check if user already exists locally, update or add
        const existingUserIndex = this.users.findIndex(u => u.email === loginData.email)
        if (existingUserIndex >= 0) {
          this.users[existingUserIndex] = user
        } else {
          this.users.push(user)
        }
        this.saveUsers()

        // Save session
        const sessionData: SessionUser = {
          id: user.id,
          backendId: user.backendId,
          usuario: user.usuario,
          tipoUsuario: user.tipoUsuario,
          nombre: user.nombre,
        }

        console.log("[AUTH] Saving session from login data:", sessionData)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem("currentUser", JSON.stringify(sessionData))
        }

        return { success: true, user: user }
      } else {
        const errorData = await loginResponse.json().catch(() => ({}))
        console.log("[AUTH] Backend login failed:", errorData)
        return { success: false, message: errorData.message || "Credenciales incorrectas" }
      }
    } catch (error) {
      console.error('[AUTH] Backend authentication error:', error)
      // Fallback to local authentication if backend is unavailable
      if (localUser) {
        console.log("[AUTH] Falling back to local authentication")
        const sessionData: SessionUser = {
          id: localUser.id,
          backendId: localUser.backendId,
          usuario: localUser.usuario,
          tipoUsuario: localUser.tipoUsuario,
          nombre: localUser.nombre,
        }

        if (typeof window !== 'undefined') {
          sessionStorage.setItem("currentUser", JSON.stringify(sessionData))
        }

        return { success: true, user: localUser }
      }
    }

    return { success: false, message: "Credenciales incorrectas o error de conexión" }
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
        paciente: 'PACIENTE',
        eps: 'EPS'
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
      } else if (userData.tipoUsuario === 'eps') {
        payload.fullName = userData.nombreCompleto || userData.nombre
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

      // Note: Registration doesn't require JWT token as it's a public endpoint

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

    if (userData.tipoUsuario === "eps") {
      // EPS no requiere validaciones adicionales específicas
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