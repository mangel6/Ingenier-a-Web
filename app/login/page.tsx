"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, EyeOff, Shield, User, Building } from "lucide-react"
import { authSystem } from "@/lib/auth"

type UserType = "paciente" | "eps" | ""

interface LoginData {
  userType: UserType
  username: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [loginData, setLoginData] = useState<LoginData>({
    userType: "",
    username: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!loginData.userType) {
      newErrors.userType = "Debes seleccionar un tipo de usuario"
    }

    if (!loginData.username.trim()) {
      newErrors.username = loginData.userType === "paciente" ? "El número de documento es requerido" : "El usuario es requerido"
    }

    // Only require password for EPS users
    if (loginData.userType === "eps" && !loginData.password) {
      newErrors.password = "La contraseña es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await authSystem.validateUser(loginData.username.toLowerCase(), loginData.password, loginData.userType)

      if (result.success) {
        // Redirigir según el tipo de usuario del resultado de autenticación
        const actualUserType = result.user?.tipoUsuario || loginData.userType
        switch (actualUserType) {
          case "paciente":
            router.push("/history")
            break
          case "eps":
            router.push("/dashboard/eps")
            break
          default:
            // Fallback al tipo seleccionado si no se reconoce el role del backend
            switch (loginData.userType) {
              case "paciente":
                router.push("/history")
                break
              case "eps":
                router.push("/dashboard/eps")
                break
            }
        }
      } else {
        setErrors({ general: result.message || "Credenciales incorrectas" })
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setErrors({ general: "Error al iniciar sesión. Verifica tus credenciales." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUserTypeIcon = (type: UserType) => {
    switch (type) {
      case "paciente":
        return <User className="w-4 h-4" />
      case "eps":
        return <Building className="w-4 h-4" />
      default:
        return null
    }
  }

  const getUserTypeLabel = (type: UserType) => {
    switch (type) {
      case "paciente":
        return "Paciente"
      case "eps":
        return "EPS/Entidad"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Sistema Médico Integral</CardTitle>
            <CardDescription>Accede a tu cuenta para gestionar información médica</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de Usuario */}
              <div className="space-y-2">
                <Label htmlFor="userType">Iniciar sesión como</Label>
                <Select
                  value={loginData.userType}
                  onValueChange={(value: UserType) => handleInputChange("userType", value)}
                >
                  <SelectTrigger className={errors.userType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecciona tu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paciente">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Paciente
                      </div>
                    </SelectItem>
                    <SelectItem value="eps">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        EPS/Entidad
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.userType && <p className="text-sm text-destructive">{errors.userType}</p>}
              </div>

              {/* Usuario */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  {loginData.userType === "paciente" ? "Número de documento" : "Usuario"}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={loginData.userType === "paciente" ? "Ingresa tu número de documento" : "Ingresa tu usuario"}
                  value={loginData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={errors.username ? "border-destructive" : ""}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>

              {/* Contraseña - Solo mostrar para EPS */}
              {loginData.userType === "eps" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={loginData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
              )}

              {errors.general && <p className="text-sm text-destructive">{errors.general}</p>}

              {/* Botón de envío */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? (loginData.userType === "paciente" ? "Consultando..." : "Iniciando sesión...")
                  : (loginData.userType === "paciente" ? "Consultar" : "Iniciar Sesión")
                }
              </Button>
            </form>

            {/* Enlaces adicionales */}
            <div className="mt-6 space-y-3 text-center text-sm">
              <div className="space-y-2">
                <Link href="#" className="text-primary hover:underline block">
                  ¿Olvidaste tu contraseña?
                </Link>
                <Link href="#" className="text-primary hover:underline block">
                  Soporte Técnico
                </Link>
              </div>

              <div className="pt-4 border-t">
                <Link
                  href="/registro"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  <User className="w-4 h-4" />
                  ¿No tienes cuenta? Regístrate aquí
                </Link>
              </div>
            </div>

            {/* Aviso de seguridad */}
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-2">
                <Shield className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">Aviso de Seguridad</p>
                  <p>Este sistema maneja información médica confidencial. El acceso está registrado y monitoreado.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
