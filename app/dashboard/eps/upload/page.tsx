"use client"

import { useEffect, useState, useRef } from "react"

export const dynamic = 'force-dynamic'

// Type declaration for window.backendIntegration
declare global {
  interface Window {
    backendIntegration: {
      uploadClinicalDocument: (payload: any) => Promise<{ success: boolean; message: string }>
      validatePatientData: (validationData: any) => Promise<{ success: boolean; isValid?: boolean; epsName?: string; numeroDocumento?: string; status?: string; message: string }>
      registerUser: (userData: any) => Promise<{ success: boolean; message: string }>
      loginUser: (usuario: string, password: string, tipoUsuario: string) => Promise<{ success: boolean; user?: any }>
      fetchClinicalDocuments: (patientId: string) => Promise<{ success: boolean; documents?: any[] }>
      fetchClinicalDocumentsForPatient: (backendId: string) => Promise<{ success: boolean; documents?: any[] }>
      fetchClinicalDocumentContent: (documentId: string, patientId: string) => Promise<{ success: boolean; content?: string; mimeType?: string }>
    }
  }
}
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowLeft, Upload, FileText, Building } from "lucide-react"
import { authSystem } from "@/lib/auth"
import { EpsValidationModal } from "@/components/EpsValidationModal"

// Validation schema
const uploadSchema = z.object({
  patientDocumentType: z.string().min(1, "El tipo de documento es requerido"),
  patientDocumentNumber: z.string().min(1, "El número de documento es requerido"),
  patientBirthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  patientFullName: z.string().min(1, "El nombre completo del paciente es requerido"),
  kind: z.enum(["PDF", "IMAGE", "DOCUMENT"], {
    required_error: "Por favor seleccione un tipo de archivo",
  }),
  captchaSolution: z.string().min(1, "La solución del captcha es requerida"),
})

type UploadFormData = z.infer<typeof uploadSchema>

interface EpsValidationResponseDTO {
  isValid: boolean
  epsName: string | null
  numeroDocumento: string | null
  status: string | null
  message: string | null
}

export default function EpsUploadPage() {
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
  const [validationResult, setValidationResult] = useState<EpsValidationResponseDTO | null>(null)
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false)
  const [isValidating, setIsValidating] = useState<boolean>(false)

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      patientDocumentType: "",
      patientDocumentNumber: "",
      patientBirthDate: "",
      patientFullName: "",
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
    // Use backendId from session if available, otherwise fallback to placeholder
    setCurrentEpsId(user.backendId ? user.backendId.toString() : "550e8400-e29b-41d4-a716-446655440001")

    // Fetch EPS information
    fetchEpsInfo()
  }, [router])

  // Function to check and initiate captcha
  const checkAndInitiateCaptcha = () => {
    const formValues = form.getValues()
    if (formValues.patientDocumentType && formValues.patientDocumentNumber) {
      initiateCaptcha(formValues.patientDocumentType, formValues.patientDocumentNumber)
    }
  }

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

  const initiateCaptcha = async (tipoDocumento: string, numeroDocumento: string) => {
    console.log("[DEBUG] initiateCaptcha called with:", { tipoDocumento, numeroDocumento })
    if (!tipoDocumento || !numeroDocumento) {
      console.log("[DEBUG] initiateCaptcha: missing params, returning")
      return
    }

    setIsLoadingCaptcha(true)
    try {
      const response = await fetch(`http://localhost:8080/MedCloud/api/v1/validation/eps/initiate?tipoDocumento=${tipoDocumento}&numeroDocumento=${numeroDocumento}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log("[DEBUG] initiateCaptcha response status:", response.status)
      if (response.ok) {
        const captchaData = await response.json()
        console.log("[DEBUG] initiateCaptcha response data:", captchaData)
        setCaptchaImage(captchaData.captchaImage)
        setCaptchaSessionId(captchaData.sessionId)
        console.log("[DEBUG] Captcha state updated")
      } else {
        console.error('Error initiating captcha')
        alert('Error al cargar el captcha. Por favor intente nuevamente.')
      }
    } catch (error) {
      console.error('Error initiating captcha:', error)
      alert('Error de conexión al cargar el captcha.')
    } finally {
      setIsLoadingCaptcha(false)
    }
  }

  const validateEps = async (tipoDocumento: string, numeroDocumento: string, captchaSolution: string, sessionId: string) => {
    console.log("[DEBUG] validateEps called with:", { tipoDocumento, numeroDocumento, captchaSolution, sessionId })
    setIsValidating(true)
    try {
      const response = await fetch(`http://localhost:8080/MedCloud/api/v1/validation/eps/validate?sessionId=${sessionId}&tipoDocumento=${tipoDocumento}&numeroDocumento=${numeroDocumento}&captchaSolution=${captchaSolution}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log("[DEBUG] validateEps response status:", response.status)
      if (response.ok) {
        const validationData: EpsValidationResponseDTO = await response.json()
        console.log("[DEBUG] validateEps response data:", validationData)
        setValidationResult(validationData)
        setShowValidationModal(true)
        console.log("[DEBUG] setShowValidationModal(true) called")
      } else {
        console.error('Error validating EPS')
        alert('Error al validar la EPS. Por favor intente nuevamente.')
      }
    } catch (error) {
      console.error('Error validating EPS:', error)
      alert('Error de conexión al validar la EPS.')
    } finally {
      setIsValidating(false)
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
    // Validate EPS first
    await validateEps(data.patientDocumentType, data.patientDocumentNumber, data.captchaSolution, captchaSessionId)
  }

  const handleValidationContinue = async () => {
    setShowValidationModal(false)
    setIsUploading(true)

    const data = form.getValues()
    const payload = {
      patientDocumentType: data.patientDocumentType,
      patientDocumentNumber: data.patientDocumentNumber,
      patientBirthDate: data.patientBirthDate,
      patientFullName: data.patientFullName,
      uploadedByEpsId: currentEpsId,
      kind: data.kind,
      filename: file!.name,
      fileContentBase64,
      mimeType,
      sizeBytes,
      captchaSessionId,
      captchaSolution: data.captchaSolution,
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
        setCaptchaImage("")
        setCaptchaSessionId("")
        setValidationResult(null)
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

  const handleValidationCancel = () => {
    setShowValidationModal(false)
    setValidationResult(null)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/eps")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard EPS
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Subir Historia Clínica</h1>
            <p className="text-muted-foreground">{epsInfo?.fullName || "EPS"}</p>
          </div>
        </div>

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
                <FormLabel className="text-sm font-medium">Nombre de la EPS</FormLabel>
                <p className="text-sm text-muted-foreground mt-1">
                  {epsInfo?.fullName || "Cargando..."}
                </p>
              </div>
              <div>
                <FormLabel className="text-sm font-medium">ID de la EPS</FormLabel>
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
              Subida de Documento Médico
            </CardTitle>
            <CardDescription>
              Seleccione un archivo y proporcione la información requerida para subir un documento clínico.
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
                      <FormLabel>Número de Documento del Paciente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el número de documento"
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
                          <SelectItem value="DOCUMENT">Documento</SelectItem>
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
                    <FormLabel className="text-sm font-medium">Subido Por (ID de EPS)</FormLabel>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {currentEpsId || "Cargando..."}
                    </p>
                  </div>
                  <div>
                    <FormLabel className="text-sm font-medium">Nombre del Archivo</FormLabel>
                    <p className="text-sm text-muted-foreground mt-1">
                      {file?.name || "Ningún archivo seleccionado"}
                    </p>
                  </div>
                  <div>
                    <FormLabel className="text-sm font-medium">Tipo MIME</FormLabel>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {mimeType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <FormLabel className="text-sm font-medium">Tamaño (Bytes)</FormLabel>
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
      </div>

      <EpsValidationModal
        isOpen={showValidationModal}
        validationResult={validationResult}
        isValidating={isValidating}
        onContinue={handleValidationContinue}
        onCancel={handleValidationCancel}
      />
    </div>
  )
}