// Login functionality
document.addEventListener("DOMContentLoaded", () => {
  const userTypeSelect = document.getElementById("userType")
  const loginBtn = document.getElementById("loginBtn")
  const credentialsForm = document.getElementById("credentialsForm")
  const loginFormDiv = document.getElementById("loginForm")
  const twoFactorFormDiv = document.getElementById("twoFactorForm")
  const verificationForm = document.getElementById("verificationForm")

  // Enable/disable login button based on user type selection
  userTypeSelect.addEventListener("change", function () {
    loginBtn.disabled = !this.value
  })

  // Handle login form submission
  credentialsForm.addEventListener("submit", (e) => {
    e.preventDefault()
    showTwoFactorForm()
  })

  // Handle 2FA form submission
  verificationForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const userType = userTypeSelect.value

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
})

function togglePassword() {
  const passwordInput = document.getElementById("password")
  const passwordIcon = document.getElementById("passwordIcon")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    passwordIcon.className = "fas fa-eye-slash"
  } else {
    passwordInput.type = "password"
    passwordIcon.className = "fas fa-eye"
  }
}

function showTwoFactorForm() {
  document.getElementById("loginForm").classList.add("hidden")
  document.getElementById("twoFactorForm").classList.remove("hidden")
}

function showLoginForm() {
  document.getElementById("twoFactorForm").classList.add("hidden")
  document.getElementById("loginForm").classList.remove("hidden")
}
