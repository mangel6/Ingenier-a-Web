"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowLeft, Upload, FileText } from "lucide-react"
import { authSystem } from "@/lib/auth"

// Validation schema
const uploadSchema = z.object({
  patientId: z.string().uuid("El ID del paciente debe ser un UUID válido"),
  kind: z.enum(["PDF", "IMAGE", "DOCUMENT"], {
    required_error: "Por favor seleccione un tipo de archivo",
  }),
})

type UploadFormData = z.infer<typeof uploadSchema>

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileContentBase64, setFileContentBase64] = useState<string>("")
  const [mimeType, setMimeType] = useState<string>("")
  const [sizeBytes, setSizeBytes] = useState<number>(0)
  const [currentDoctorId, setCurrentDoctorId] = useState<string>("")

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      patientId: "",
      kind: undefined,
    },
  })

  useEffect(() => {
    const user = authSystem.getCurrentUser()
    if (!user || user.tipoUsuario !== "doctor") {
      router.push("/login")
      return
    }
    // For now, use a placeholder UUID for the doctor ID
    // In a real app, this would come from the authenticated user
    setCurrentDoctorId("550e8400-e29b-41d4-a716-446655440000")
  }, [router])

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

  const onSubmit = (data: UploadFormData) => {
    if (!file) {
      alert("Por favor seleccione un archivo para subir")
      return
    }

    const payload = {
      patientId: data.patientId,
      uploadedByUserId: currentDoctorId,
      kind: data.kind,
      filename: file.name,
      fileContentBase64,
      mimeType,
      sizeBytes,
    }

    console.log("Upload payload:", JSON.stringify(payload, null, 2))

    // For now, just show success message
    alert("¡Archivo subido exitosamente! Revise la consola para el payload.")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/doctor")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Subir Historia Clínica</h1>
          </div>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subida de Documento
            </CardTitle>
            <CardDescription>
              Seleccione un archivo y proporcione la información requerida para subir un documento clínico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Patient ID */}
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID del Paciente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el UUID del paciente"
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
                    <FormLabel className="text-sm font-medium">Subido Por (ID del Doctor)</FormLabel>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {currentDoctorId || "Cargando..."}
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
                <Button type="submit" className="w-full" disabled={!file}>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}