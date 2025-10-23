"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, UserCheck, FileText, Award, Stethoscope, CheckCircle, AlertCircle } from "lucide-react"

type UserRole = "doctor" | "paciente" | "admin" | ""

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  // Common required fields for all users
  fullName: string
  documentType: string
  documentNumber: string
  birthDate: string
  // Campos específicos para doctor
  licencia?: string
  especialidad?: string
}

interface ApiResponse {
  status: "success" | "error"
  message: string
}

export default function RegistroPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    fullName: "",
    documentType: "",
    documentNumber: "",
    birthDate: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiMessage, setApiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const cleanFormData = (data: FormData) => {
    return {
      ...data,
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      confirmPassword: data.confirmPassword,
      fullName: data.fullName.trim(),
      documentNumber: data.documentNumber.trim(),
      licencia: data.licencia?.trim(),
      especialidad: data.especialidad?.trim(),
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    // Limpiar mensaje de API cuando el usuario modifique el formulario
    if (apiMessage) {
      setApiMessage(null)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validaciones básicas
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "El email no tiene un formato válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (!formData.role) {
      newErrors.role = "Debes seleccionar un rol"
    }

    // Validaciones comunes para todos los roles
    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido"
    }
    if (!formData.documentType) {
      newErrors.documentType = "El tipo de documento es requerido"
    }
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = "El número de documento es requerido"
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "La fecha de nacimiento es requerida"
    }

    // Validaciones específicas por rol
    if (formData.role === "doctor") {
      if (!formData.licencia?.trim()) {
        newErrors.licencia = "La licencia médica es requerida"
      }
      if (!formData.especialidad?.trim()) {
        newErrors.especialidad = "La especialidad es requerida"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitToBackend = async (cleanedData: FormData): Promise<ApiResponse> => {
    console.log("[REGISTRO] submitToBackend called with:", cleanedData)
    try {
      // Import auth system dynamically to avoid SSR issues
      console.log("[REGISTRO] Importing auth system...")
      const { authSystem } = await import("@/lib/auth")
      console.log("[REGISTRO] Auth system imported successfully")

      const userData = {
        usuario: cleanedData.username,
        email: cleanedData.email,
        password: cleanedData.password,
        tipoUsuario: cleanedData.role,
        nombreCompleto: cleanedData.fullName,
        tipoDocumento: cleanedData.documentType,
        numeroDocumento: cleanedData.documentNumber,
        fechaNacimiento: cleanedData.birthDate,
        ...(cleanedData.role === "doctor" && {
          licenciaMedica: cleanedData.licencia,
          especialidad: cleanedData.especialidad,
        }),
      }
      console.log("[REGISTRO] Complete JSON payload:", JSON.stringify(userData, null, 2))
      console.log("[REGISTRO] Calling authSystem.registerUser with:", userData)

      const result = await authSystem.registerUser(userData)
      console.log("[REGISTRO] authSystem.registerUser result:", result)

      return {
        status: result.success ? "success" : "error",
        message: result.message || "Error desconocido",
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error)
      return {
        status: "error",
        message: "Error inesperado. Por favor, intenta nuevamente.",
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[REGISTRO] Form submitted")

    if (!validateForm()) {
      console.log("[REGISTRO] Form validation failed")
      return
    }
    console.log("[REGISTRO] Form validation passed")

    setIsSubmitting(true)
    setApiMessage(null)

    try {
      const cleanedData = cleanFormData(formData)
      console.log("[REGISTRO] Cleaned data:", cleanedData)

      const result = await submitToBackend(cleanedData)
      console.log("[REGISTRO] Backend result:", result)

      if (result.status === "success") {
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "",
          fullName: "",
          documentType: "",
          documentNumber: "",
          birthDate: "",
        })
        setApiMessage({ type: "success", text: result.message })
      } else {
        setApiMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error)
      setApiMessage({
        type: "error",
        text: "Error inesperado. Por favor, intenta nuevamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
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
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Crear Nueva Cuenta</CardTitle>
            <CardDescription>Completa el formulario para registrarte en el sistema médico</CardDescription>
          </CardHeader>

          <CardContent>
            {apiMessage && (
              <Alert className={`mb-6 ${apiMessage.type === "error" ? "border-destructive" : "border-green-500"}`}>
                {apiMessage.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription className={apiMessage.type === "error" ? "text-destructive" : "text-green-700"}>
                  {apiMessage.text}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <UserCheck className="w-4 h-4" />
                  Información de Acceso
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ingresa tu nombre de usuario"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className={errors.username ? "border-destructive" : ""}
                    />
                    {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={errors.password ? "border-destructive" : ""}
                      />
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repite la contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={errors.confirmPassword ? "border-destructive" : ""}
                      />
                      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Tipo de Usuario</Label>
                    <Select value={formData.role} onValueChange={(value: UserRole) => handleInputChange("role", value)}>
                      <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecciona tu rol en el sistema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Médico
                          </div>
                        </SelectItem>
                        <SelectItem value="paciente">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Paciente
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Administrador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                  </div>
                </div>
              </div>

              {/* Campos comunes para todos los roles */}
              {formData.role && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <FileText className="w-4 h-4" />
                      Información Personal
                    </div>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre Completo</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Nombres y apellidos completos"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className={errors.fullName ? "border-destructive" : ""}
                        />
                        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="documentType">Tipo de Documento</Label>
                          <Select
                            value={formData.documentType}
                            onValueChange={(value) => handleInputChange("documentType", value)}
                          >
                            <SelectTrigger className={errors.documentType ? "border-destructive" : ""}>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cc">Cédula de Ciudadanía</SelectItem>
                              <SelectItem value="ti">Tarjeta de Identidad</SelectItem>
                              <SelectItem value="ce">Cédula de Extranjería</SelectItem>
                              <SelectItem value="pasaporte">Pasaporte</SelectItem>
                              <SelectItem value="rc">Registro Civil</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.documentType && <p className="text-sm text-destructive">{errors.documentType}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="documentNumber">Número de Documento</Label>
                          <Input
                            id="documentNumber"
                            type="text"
                            placeholder="Número sin puntos ni espacios"
                            value={formData.documentNumber}
                            onChange={(e) => handleInputChange("documentNumber", e.target.value)}
                            className={errors.documentNumber ? "border-destructive" : ""}
                          />
                          {errors.documentNumber && (
                            <p className="text-sm text-destructive">{errors.documentNumber}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange("birthDate", e.target.value)}
                          className={errors.birthDate ? "border-destructive" : ""}
                        />
                        {errors.birthDate && (
                          <p className="text-sm text-destructive">{errors.birthDate}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Campos específicos por rol */}
                  {formData.role === "doctor" && (
                    <>
                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Award className="w-4 h-4" />
                          Información Profesional
                        </div>

                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="licencia">Número de Licencia Médica</Label>
                            <Input
                              id="licencia"
                              type="text"
                              placeholder="Ej: 12345678"
                              value={formData.licencia || ""}
                              onChange={(e) => handleInputChange("licencia", e.target.value)}
                              className={errors.licencia ? "border-destructive" : ""}
                            />
                            {errors.licencia && <p className="text-sm text-destructive">{errors.licencia}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="especialidad">Especialidad Médica</Label>
                            <Select
                              value={formData.especialidad || ""}
                              onValueChange={(value) => handleInputChange("especialidad", value)}
                            >
                              <SelectTrigger className={errors.especialidad ? "border-destructive" : ""}>
                                <SelectValue placeholder="Selecciona tu especialidad" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="medicina-general">Medicina General</SelectItem>
                                <SelectItem value="cardiologia">Cardiología</SelectItem>
                                <SelectItem value="dermatologia">Dermatología</SelectItem>
                                <SelectItem value="neurologia">Neurología</SelectItem>
                                <SelectItem value="pediatria">Pediatría</SelectItem>
                                <SelectItem value="ginecologia">Ginecología</SelectItem>
                                <SelectItem value="traumatologia">Traumatología</SelectItem>
                                <SelectItem value="psiquiatria">Psiquiatría</SelectItem>
                                <SelectItem value="oftalmologia">Oftalmología</SelectItem>
                                <SelectItem value="otorrinolaringologia">Otorrinolaringología</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.especialidad && <p className="text-sm text-destructive">{errors.especialidad}</p>}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Registrando..." : "Crear Cuenta"}
                </Button>
                <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href="/">Cancelar</Link>
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Iniciar sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
