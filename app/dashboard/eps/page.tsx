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

// Note: backendIntegration type is declared in upload/page.tsx

// Validation schema
const uploadSchema = z.object({
  patientDocumentType: z.string().min(1, "El tipo de documento es requerido"),
  patientDocumentNumber: z.string().min(1, "La cédula del paciente es requerida"),
  patientBirthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  patientFullName: z.string().min(1, "El nombre completo del paciente es requerido"),
  patientTreatment: z.string().max(1000, "El tratamiento no puede exceder los 1000 caracteres").optional(),
  patientDiagnosisInProgress: z.boolean({
    required_error: "El estado del diagnóstico es requerido",
  }),
  doctorDocumentNumber: z.string().min(1, "La cédula del médico es requerida"),
  kind: z.enum(["PDF", "IMAGE", "LAB_REPORT", "SCAN", "OTHER"], {
    required_error: "Por favor seleccione un tipo de archivo",
  }),
  captchaSolution: z.string().min(1, "La solución del captcha es requerida"),
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
  const [captchaImage, setCaptchaImage] = useState<string>("")
  const [captchaSessionId, setCaptchaSessionId] = useState<string>("")
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState<boolean>(false)
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false)
  const [isValidatingPatient, setIsValidatingPatient] = useState<boolean>(false)
  const [patientValidationResult, setPatientValidationResult] = useState<any>(null)
  const [pendingFormData, setPendingFormData] = useState<UploadFormData | null>(null)

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      patientDocumentType: "",
      patientDocumentNumber: "",
      patientBirthDate: "",
      patientFullName: "",
      patientTreatment: "",
      patientDiagnosisInProgress: false,
      doctorDocumentNumber: "",
      kind: undefined,
      captchaSolution: "",
    },
  })

  useEffect(() => {
    const user = authSystem.getCurrentUser()
    if (!user || user.tipoUsuario !== "eps") {
      router.push("/login")
      return
    }
    // Fetch EPS information first to get the correct ID
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
        // Set the correct EPS ID from the backend
        if (currentEps?.id) {
          setCurrentEpsId(currentEps.id)
        }
      } else {
        console.error('Failed to fetch EPS info:', response.status, await response.text())
        // Set fallback info
        setEpsInfo({ fullName: 'EPS Salud Total', id: null })
      }
    } catch (error) {
      console.error('Error fetching EPS info:', error)
      // Set fallback info on error
      setEpsInfo({ fullName: 'EPS Salud Total', id: null })
    }
  }

  const initiateCaptcha = async (tipoDocumento: string, numeroDocumento: string) => {
    if (!tipoDocumento || !numeroDocumento) {
      console.log('Skipping captcha initiation - missing parameters')
      return
    }

    console.log('Making captcha API call with:', tipoDocumento, numeroDocumento)
    setIsLoadingCaptcha(true)
    try {
      const response = await fetch(`http://localhost:8080/MedCloud/api/v1/validation/eps/initiate?tipoDocumento=${tipoDocumento}&numeroDocumento=${numeroDocumento}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Captcha API response status:', response.status)
      const responseText = await response.text()
      console.log('Captcha API response:', responseText)

      if (response.ok) {
        const captchaData = JSON.parse(responseText)
        console.log('Parsed captcha data:', captchaData)
        setCaptchaImage(captchaData.captchaImage)
        setCaptchaSessionId(captchaData.sessionId)
      } else {
        console.error('Error initiating captcha - status:', response.status, 'response:', responseText)
        alert('Error al cargar el captcha. Por favor intente nuevamente.')
      }
    } catch (error) {
      console.error('Error initiating captcha:', error)
      alert('Error de conexión al cargar el captcha.')
    } finally {
      setIsLoadingCaptcha(false)
    }
  }

  // Function to check and initiate captcha
  const checkAndInitiateCaptcha = () => {
    const formValues = form.getValues()
    console.log('Checking captcha initiation:', formValues.patientDocumentType, formValues.patientDocumentNumber)
    if (formValues.patientDocumentType && formValues.patientDocumentNumber && formValues.patientDocumentNumber.trim() !== '') {
      console.log('Initiating captcha with:', formValues.patientDocumentType, formValues.patientDocumentNumber)
      initiateCaptcha(formValues.patientDocumentType, formValues.patientDocumentNumber)
    } else {
      console.log('Not initiating captcha - missing data')
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

  const validatePatientData = async (data: UploadFormData) => {
    console.log("[VALIDATION] Starting patient data validation")
    setIsValidatingPatient(true)
    setPatientValidationResult(null)

    try {
      // Map document type to abbreviated form for validation API
      const mapTipoDocumento = (tipo: string) => {
        switch (tipo) {
          case "Cédula de Ciudadanía":
          case "Cedula de Ciudadanía":
            return "CC"
          case "Tarjeta de Identidad":
            return "TI"
          case "Cédula de Extranjería":
            return "CE"
          default:
            return tipo
        }
      }

      const validationData = {
        sessionId: captchaSessionId,
        tipoDocumento: mapTipoDocumento(data.patientDocumentType),
        numeroDocumento: data.patientDocumentNumber,
        captchaSolution: data.captchaSolution,
      }

      console.log("[VALIDATION] Validation data:", validationData)
      const result = await window.backendIntegration.validatePatientData(validationData)
      console.log("[VALIDATION] Validation result:", result)

      if (result.success && result.isValid) {
        setPatientValidationResult(result)
      } else {
        alert(`Error en validación: ${result.message}`)
        setShowValidationModal(false)
      }
    } catch (error) {
      console.error("[VALIDATION] Error validating patient data:", error)
      alert("Error al validar los datos del paciente. Por favor intente nuevamente.")
      setShowValidationModal(false)
    } finally {
      setIsValidatingPatient(false)
    }
  }

  const confirmAndUpload = async () => {
    if (!pendingFormData) return

    console.log("[UPLOAD] Starting confirmed upload")
    setIsUploading(true)

    const payload = {
      patientDocumentType: pendingFormData.patientDocumentType,
      patientDocumentNumber: pendingFormData.patientDocumentNumber,
      patientBirthDate: pendingFormData.patientBirthDate,
      patientFullName: pendingFormData.patientFullName,
      patientTreatment: pendingFormData.patientTreatment || "",
      patientDiagnosisInProgress: pendingFormData.patientDiagnosisInProgress,
      uploadedByEpsId: currentEpsId,
      doctorDocumentNumber: pendingFormData.doctorDocumentNumber,
      kind: pendingFormData.kind,
      filename: file!.name,
      fileContentBase64,
      mimeType,
      sizeBytes,
      captchaSessionId,
      captchaSolution: pendingFormData.captchaSolution,
    }
    console.log("[UPLOAD] Payload constructed:", payload)

    try {
      const result = await window.backendIntegration.uploadClinicalDocument(payload)
      console.log("[UPLOAD] Upload result:", result)

      if (result.success) {
        alert("¡Archivo subido exitosamente!")
        // Reset form and states
        form.reset()
        setFile(null)
        setFileContentBase64("")
        setMimeType("")
        setSizeBytes(0)
        setCaptchaImage("")
        setCaptchaSessionId("")
        setShowValidationModal(false)
        setPatientValidationResult(null)
        setPendingFormData(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        alert(`Error al subir archivo: ${result.message}`)
      }
    } catch (error) {
      console.error("[UPLOAD] Error uploading document:", error)
      alert("Error inesperado al subir el archivo. Por favor intente nuevamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: UploadFormData) => {
    console.log("[SUBMIT] onSubmit called with data:", data)
    if (!file) {
      alert("Por favor seleccione un archivo para subir")
      return
    }

    if (!captchaImage) {
      alert("Por favor complete el captcha primero")
      return
    }

    // Store form data and show validation modal
    setPendingFormData(data)
    setShowValidationModal(true)

    // Start validation
    await validatePatientData(data)
  }

  const closeValidationModal = () => {
    setShowValidationModal(false)
    setPatientValidationResult(null)
    setPendingFormData(null)
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
            <p className="text-muted-foreground">{epsInfo?.fullName || epsInfo?.username || "EPS Salud Total"}</p>
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
                  {epsInfo?.fullName || epsInfo?.username || "EPS Salud Total"}
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
                {/* Patient Document Type */}
                <FormField
                  control={form.control}
                  name="patientDocumentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento del Paciente</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Trigger captcha check after a short delay
                          setTimeout(checkAndInitiateCaptcha, 100)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el tipo de documento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                          <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                          <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          onChange={(e) => {
                            field.onChange(e)
                            // Trigger captcha check after a short delay
                            setTimeout(checkAndInitiateCaptcha, 100)
                          }}
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

                {/* Captcha Section */}
                {captchaImage && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <FormLabel className="text-sm font-medium">Verificación de Captcha</FormLabel>
                    <div className="flex items-center gap-4">
                      <img
                        src={`data:image/png;base64,${captchaImage}`}
                        alt="Captcha"
                        className="border rounded"
                      />
                      <FormField
                        control={form.control}
                        name="captchaSolution"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Ingrese el texto del captcha"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

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
                <Button type="submit" className="w-full" disabled={!file || !captchaImage || isUploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Subiendo..." : "Subir Documento"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Patient Validation Modal */}
        {showValidationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Validando en ADRES
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isValidatingPatient ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-sm text-muted-foreground">
                      Consultando la base de datos ADRES para verificar la información del paciente...
                    </p>
                  </div>
                ) : patientValidationResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">Validación Exitosa</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Número de Documento:</span>
                          <span className="font-mono font-medium">{patientValidationResult.numeroDocumento}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado en ADRES:</span>
                          <Badge variant={patientValidationResult.status === 'ACTIVO' ? 'default' : 'destructive'}>
                            {patientValidationResult.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">EPS Afiliada:</span>
                          <span className="font-medium">{patientValidationResult.epsName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={closeValidationModal}
                        className="flex-1"
                        disabled={isUploading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={confirmAndUpload}
                        disabled={isUploading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isUploading ? "Subiendo..." : "Confirmar y Subir"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-600">Error en la validación. Por favor intente nuevamente.</p>
                    <Button
                      variant="outline"
                      onClick={closeValidationModal}
                      className="mt-4"
                    >
                      Cerrar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

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