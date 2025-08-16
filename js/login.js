// Login functionality
document.addEventListener("DOMContentLoaded", () => {
  const userTypeSelect = document.getElementById("userType")
  const loginBtn = document.getElementById("loginBtn")
  const credentialsForm = document.getElementById("credentialsForm")
  const loginFormDiv = document.getElementById("loginForm")
  const twoFactorFormDiv = document.getElementById("twoFactorForm")
  const verificationForm = document.getElementById("verificationForm")
  const loginMessages = document.getElementById("loginMessages")

  // Enable/disable login button based on user type selection
  userTypeSelect.addEventListener("change", function () {
    loginBtn.disabled = !this.value
    announceToScreenReader(`Seleccionado: ${this.options[this.selectedIndex].text}`)
  })

  // Handle login form submission
  credentialsForm.addEventListener("submit", (e) => {
    e.preventDefault()
    announceToScreenReader("Credenciales verificadas. Procediendo a verificación de seguridad.")
    showTwoFactorForm()
  })

  // Handle 2FA form submission
  verificationForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const userType = userTypeSelect.value
    announceToScreenReader("Verificación completada. Redirigiendo al panel de control.")

    // Redirect based on user type
    switch (userType) {
      case "patient":
        window.location.href = "pages/patient/dashboard.html"
        break
      case "doctor":
        window.location.href = "pages/doctor/dashboard.html"
        break
      case "admin":
        window.location.href = "pages/admin/dashboard.html"
        break
      case "eps":
        window.location.href = "pages/eps/dashboard.html"
        break
      default:
        window.location.href = "pages/dashboard.html"
    }
  })

  // Initialize 2FA functionality
  initialize2FA()

  function announceToScreenReader(message) {
    if (loginMessages) {
      loginMessages.textContent = message
    }
  }
})

function initialize2FA() {
  const methodRadios = document.querySelectorAll('input[name="verificationMethod"]')
  const codeInputGroup = document.getElementById("codeInputGroup")
  const verificationCode = document.getElementById("verificationCode")
  const verifyBtn = document.getElementById("verifyBtn")
  const resendBtn = document.getElementById("resendCodeBtn")
  const codeTimer = document.getElementById("codeTimer")
  const timerDisplay = document.getElementById("timerDisplay")

  let countdownTimer = null
  const resendTimer = null

  // Handle method selection
  methodRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        showCodeInput()
        startCountdown()
        enableResendAfterDelay()

        const methodText = this.parentElement.querySelector("strong").textContent
        announceToScreenReader(`Método seleccionado: ${methodText}. Se ha enviado un código de verificación.`)
      }
    })
  })

  // Handle code input
  verificationCode.addEventListener("input", function () {
    const isValid = this.value.length === 6 && /^\d{6}$/.test(this.value)
    verifyBtn.disabled = !isValid

    if (isValid) {
      announceToScreenReader("Código completo ingresado. Puedes proceder a verificar.")
    }
  })

  // Handle resend code
  resendBtn.addEventListener("click", () => {
    const selectedMethod = document.querySelector('input[name="verificationMethod"]:checked')
    if (selectedMethod) {
      const methodText = selectedMethod.parentElement.querySelector("strong").textContent
      announceToScreenReader(`Reenviando código por ${methodText}`)

      // Reset timers
      startCountdown()
      enableResendAfterDelay()
    }
  })

  function showCodeInput() {
    codeInputGroup.style.display = "block"
    verificationCode.focus()
  }

  function startCountdown() {
    let timeLeft = 300 // 5 minutes
    codeTimer.style.display = "flex"

    if (countdownTimer) clearInterval(countdownTimer)

    countdownTimer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60
      timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

      if (timeLeft <= 0) {
        clearInterval(countdownTimer)
        codeTimer.style.display = "none"
        announceToScreenReader("El código ha expirado. Por favor, solicita un nuevo código.")
      }

      timeLeft--
    }, 1000)
  }

  function enableResendAfterDelay() {
    resendBtn.disabled = true
    resendBtn.innerHTML = '<i class="fas fa-clock"></i> Espera 60s'

    if (resendTimer) clearTimeout(resendTimer)

    let countdown = 60
    const resendCountdown = setInterval(() => {
      countdown--
      resendBtn.innerHTML = `<i class="fas fa-clock"></i> Espera ${countdown}s`

      if (countdown <= 0) {
        clearInterval(resendCountdown)
        resendBtn.disabled = false
        resendBtn.innerHTML = '<i class="fas fa-redo"></i> Reenviar código'
      }
    }, 1000)
  }
}

function togglePassword() {
  const passwordInput = document.getElementById("password")
  const passwordIcon = document.getElementById("passwordIcon")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    passwordIcon.className = "fas fa-eye-slash"
    announceToScreenReader("Contraseña visible")
  } else {
    passwordInput.type = "password"
    passwordIcon.className = "fas fa-eye"
    announceToScreenReader("Contraseña oculta")
  }
}

function showTwoFactorForm() {
  document.getElementById("loginForm").classList.add("hidden")
  document.getElementById("twoFactorForm").classList.remove("hidden")
}

function showLoginForm() {
  document.getElementById("twoFactorForm").classList.add("hidden")
  document.getElementById("loginForm").classList.remove("hidden")
  announceToScreenReader("Regresando al formulario de inicio de sesión")
}

function announceToScreenReader(message) {
  const loginMessages = document.getElementById("loginMessages")
  if (loginMessages) {
    loginMessages.textContent = message
  }
}
