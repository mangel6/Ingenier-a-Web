"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, UserCheck, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  epsName: string
  nit: string
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
    epsName: "",
    nit: "",
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
      epsName: data.epsName.trim(),
      nit: data.nit.trim(),
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

    if (!formData.epsName.trim()) {
      newErrors.epsName = "El nombre de la EPS es requerido"
    }

    if (!formData.nit.trim()) {
      newErrors.nit = "El NIT es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitToBackend = async (cleanedData: FormData): Promise<ApiResponse> => {
    console.log("[REGISTRO] submitToBackend called with:", cleanedData)
    try {
      const payload = {
        username: cleanedData.username,
        email: cleanedData.email,
        password: cleanedData.password,
        epsName: cleanedData.epsName,
        nit: cleanedData.nit,
      }
      console.log("[REGISTRO] Complete JSON payload:", JSON.stringify(payload, null, 2))

      const response = await fetch("http://localhost:8080/MedCloud/api/v1/eps/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log("[REGISTRO] API response:", data)

      if (response.ok) {
        return {
          status: "success",
          message: "EPS registrada exitosamente",
        }
      } else {
        return {
          status: "error",
          message: data.message || data.error || "Error al registrar EPS",
        }
      }
    } catch (error) {
      console.error("Error al registrar EPS:", error)
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
          epsName: "",
          nit: "",
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
            <CardTitle className="text-2xl font-bold">Registrar EPS</CardTitle>
            <CardDescription>Completa el formulario para registrar una nueva EPS en el sistema médico</CardDescription>
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

                </div>
              </div>

              {/* Información de la EPS */}
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="w-4 h-4" />
                  Información de la EPS
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="epsName">Nombre de la EPS</Label>
                    <Input
                      id="epsName"
                      type="text"
                      placeholder="Ej: EPS Salud Total"
                      value={formData.epsName}
                      onChange={(e) => handleInputChange("epsName", e.target.value)}
                      className={errors.epsName ? "border-destructive" : ""}
                    />
                    {errors.epsName && <p className="text-sm text-destructive">{errors.epsName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nit">NIT</Label>
                    <Input
                      id="nit"
                      type="text"
                      placeholder="Número de Identificación Tributaria"
                      value={formData.nit}
                      onChange={(e) => handleInputChange("nit", e.target.value)}
                      className={errors.nit ? "border-destructive" : ""}
                    />
                    {errors.nit && <p className="text-sm text-destructive">{errors.nit}</p>}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Registrando..." : "Registrar EPS"}
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
