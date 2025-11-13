"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, Clock, Upload, Activity, Bell, Plus, Search, Filter, LogOut, Building, ArrowLeft } from "lucide-react"
import { authSystem } from "@/lib/auth"

// Type declaration for window.backendIntegration
declare global {
  interface Window {
    backendIntegration: {
      uploadClinicalDocument: (payload: any) => Promise<{ success: boolean; message: string }>
    }
  }
}

// Validation schema
const uploadSchema = z.object({
  patientDocumentNumber: z.string().min(1, "La cédula del paciente es requerida"),
  patientFullName: z.string().min(1, "El nombre completo del paciente es requerido").max(120, "El nombre no puede exceder los 120 caracteres"),
  patientBirthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  patientTreatment: z.string().max(1000, "El tratamiento no puede exceder los 1000 caracteres").optional(),
  patientDiagnosisInProgress: z.boolean({
    required_error: "El estado del diagnóstico es requerido",
  }),
  doctorName: z.string().min(1, "El nombre del médico es requerido").max(120, "El nombre del médico no puede exceder los 120 caracteres"),
  doctorDocumentNumber: z.string().min(1, "La cédula del médico es requerida"),
  doctorSpecialty: z.string().max(60, "La especialidad no puede exceder los 60 caracteres").optional(),
  kind: z.enum(["PDF", "IMAGE", "LAB_REPORT", "SCAN", "OTHER"], {
    required_error: "Por favor seleccione un tipo de archivo",
  }),
})

type UploadFormData = z.infer<typeof uploadSchema>

export default function EpsDashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileContentBase64, setFileContentBase64] = useState<string>("")
  const [mimeType, setMimeType] = useState<string>("")
  const [sizeBytes, setSizeBytes] = useState<number>(0)
  const [currentEpsId, setCurrentEpsId] = useState<string>("")
  const [epsInfo, setEpsInfo] = useState<any>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      patientDocumentNumber: "",
      patientFullName: "",
      patientBirthDate: "",
      patientTreatment: "",
      patientDiagnosisInProgress: false,
      doctorName: "",
      doctorDocumentNumber: "",
      doctorSpecialty: "",
      kind: undefined,
    },
  })

  useEffect(() => {
    const user = authSystem.getCurrentUser()
    if (!user || user.tipoUsuario !== "eps") {
      router.push("/login")
      return
    }
    // Use backendId from session if available, otherwise fallback to placeholder
    setCurrentEpsId(user.backendId ? user.backendId.toString() : "550e8400-e29b-41d4-a716-446655440001")

    // Fetch EPS information
    fetchEpsInfo()
  }, [router])

  const fetchEpsInfo = async () => {
    try {
      const token = localStorage.getItem("jwtToken")
      const response = await fetch('http://localhost:8080/MedCloud/api/v1/users/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })

      if (response.ok) {
        const epsList = await response.json()
        // Find current EPS user
        const currentUser = authSystem.getCurrentUser()
        const currentEps = epsList.find((eps: any) => eps.email === currentUser?.usuario)
        setEpsInfo(currentEps)
      }
    } catch (error) {
      console.error('Error fetching EPS info:', error)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setMimeType(selectedFile.type)
      setSizeBytes(selectedFile.size)

      // Convert file to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1]
        setFileContentBase64(base64)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const onSubmit = async (data: UploadFormData) => {
    console.log("[DEBUG] onSubmit called with data:", data)
    if (!file) {
      console.log("[DEBUG] No file selected")
      alert("Por favor seleccione un archivo para subir")
      return
    }

    console.log("[DEBUG] File selected:", file.name)
    setIsUploading(true)
    console.log("[DEBUG] Set isUploading to true")

    const payload = {
      patientDocumentNumber: data.patientDocumentNumber,
      patientFullName: data.patientFullName,
      patientBirthDate: data.patientBirthDate,
      patientTreatment: data.patientTreatment || "",
      patientDiagnosisInProgress: data.patientDiagnosisInProgress,
      uploadedByEpsId: currentEpsId,
      doctorName: data.doctorName,
      doctorDocumentNumber: data.doctorDocumentNumber,
      doctorSpecialty: data.doctorSpecialty || "",
      kind: data.kind,
      filename: file.name,
      fileContentBase64,
      mimeType,
      sizeBytes,
    }
    console.log("[DEBUG] Payload constructed:", payload)

    try {
      console.log("[DEBUG] Checking if window.backendIntegration exists:", !!window.backendIntegration)
      // Access the backend integration from window object
      const result = await window.backendIntegration.uploadClinicalDocument(payload)
      console.log("[DEBUG] Backend integration result:", result)

      if (result.success) {
        console.log("[DEBUG] Upload successful, resetting form")
        alert("¡Archivo subido exitosamente!")
        // Reset form
        form.reset()
        setFile(null)
        setFileContentBase64("")
        setMimeType("")
        setSizeBytes(0)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        console.log("[DEBUG] Upload failed with message:", result.message)
        alert(`Error al subir archivo: ${result.message}`)
      }
    } catch (error) {
      console.error("[DEBUG] Error uploading document:", error)
      alert("Error inesperado al subir el archivo. Por favor intente nuevamente.")
    } finally {
      console.log("[DEBUG] Setting isUploading to false")
      setIsUploading(false)
    }
  }

  const handleLogout = () => {
    authSystem.logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Bienvenido al Panel EPS</h1>
            <p className="text-muted-foreground">{epsInfo?.fullName || "EPS Salud Total"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido de vuelta!</h2>
                <p className="text-gray-600 mt-2">
                  Gestiona las historias clínicas de tus pacientes de manera eficiente y segura.
                  Sube documentos médicos directamente desde aquí.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1250</div>
                  <div className="text-sm text-gray-600">Pacientes Afiliados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">89</div>
                  <div className="text-sm text-gray-600">Historias Subidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">45</div>
                  <div className="text-sm text-gray-600">Consultas Pendientes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EPS Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Información de la EPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre de la EPS</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {epsInfo?.fullName || "Cargando..."}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">ID de la EPS</label>
                <p className="text-sm text-muted-foreground mt-1 font-mono">
                  {currentEpsId || "Cargando..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subida Directa de Historia Clínica
            </CardTitle>
            <CardDescription>
              Seleccione un archivo y proporcione la información requerida para subir un documento clínico directamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Patient Document Number */}
                <FormField
                  control={form.control}
                  name="patientDocumentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula del Paciente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese la cédula del paciente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Patient Full Name */}
                <FormField
                  control={form.control}
                  name="patientFullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo del Paciente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el nombre completo del paciente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Patient Birth Date */}
                <FormField
                  control={form.control}
                  name="patientBirthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento del Paciente</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Patient Treatment */}
                <FormField
                  control={form.control}
                  name="patientTreatment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tratamiento del Paciente (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el tratamiento del paciente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Patient Diagnosis In Progress */}
                <FormField
                  control={form.control}
                  name="patientDiagnosisInProgress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Diagnóstico en Progreso?</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el estado del diagnóstico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Sí</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Doctor Name */}
                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Médico</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el nombre del médico"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Doctor Document Number */}
                <FormField
                  control={form.control}
                  name="doctorDocumentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula del Médico</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese la cédula del médico"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Doctor Specialty */}
                <FormField
                  control={form.control}
                  name="doctorSpecialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad del Médico (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese la especialidad del médico"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Type */}
                <FormField
                  control={form.control}
                  name="kind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Archivo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el tipo de archivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="IMAGE">Imagen</SelectItem>
                          <SelectItem value="LAB_REPORT">Informe de Laboratorio</SelectItem>
                          <SelectItem value="SCAN">Escaneo</SelectItem>
                          <SelectItem value="OTHER">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Input */}
                <div className="space-y-2">
                  <FormLabel>Archivo</FormLabel>
                  <div className="flex items-center gap-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    {file && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        {file.name}
                      </div>
                    )}
                  </div>
                  {file && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Tamaño: {(sizeBytes / 1024).toFixed(2)} KB</p>
                      <p>Tipo: {mimeType}</p>
                    </div>
                  )}
                </div>

                {/* Auto-populated fields (read-only display) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium">Subido Por (ID de EPS)</label>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {currentEpsId || "Cargando..."}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nombre del Archivo</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {file?.name || "Ningún archivo seleccionado"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo MIME</label>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {mimeType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tamaño (Bytes)</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {sizeBytes || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={!file || isUploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Subiendo..." : "Subir Documento"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Historia clínica subida</p>
                  <p className="text-xs text-muted-foreground">Paciente: María González - hace 2 horas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Cita autorizada</p>
                  <p className="text-xs text-muted-foreground">Dr. Pérez - hace 4 horas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Nuevo paciente afiliado</p>
                  <p className="text-xs text-muted-foreground">Carlos Rodríguez - hace 1 día</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}