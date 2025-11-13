"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, ArrowLeft, Loader2 } from "lucide-react"
import { authSystem } from "@/lib/auth"

interface ClinicalDocument {
  id: number
  patientId: string
  uploadedByUserId: string
  kind: string
  filename: string
  fileContentBase64: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
}

export default function PatientHistoryPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<ClinicalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<ClinicalDocument | null>(null)
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [isLargeFile, setIsLargeFile] = useState(false)

  useEffect(() => {
    const user = authSystem.getCurrentUser()
    if (!user || user.tipoUsuario !== "paciente") {
      router.push("/login")
      return
    }

    fetchDocuments(user.backendId)
  }, [router])

  const fetchDocuments = async (patientId?: number) => {
    console.log("fetchDocuments called with patientId:", patientId);
    if (!patientId) {
      console.log("No patientId provided, setting loading to false");
      setLoading(false)
      return
    }

    try {
      console.log("About to call window.backendIntegration.fetchClinicalDocumentsForPatient");
      // @ts-ignore - backendIntegration is available globally
      const result = await window.backendIntegration.fetchClinicalDocumentsForPatient(patientId.toString())
      console.log("fetchClinicalDocumentsForPatient result:", result);

      if (result.success) {
        setDocuments(result.documents || [])
        console.log("Documents set:", result.documents || []);
      } else {
        console.error("Error fetching documents:", result.message)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = async (document: ClinicalDocument) => {
    setSelectedDocument(document)
    setPdfLoading(true)
    setPdfData(null)
    setIsLargeFile(false)

    try {
      // Check if file is too large for preview (>5MB)
      const maxPreviewSize = 5 * 1024 * 1024 // 5MB
      if (document.sizeBytes > maxPreviewSize) {
        setIsLargeFile(true)
        setPdfLoading(false)
        return
      }

      // Use fileContentBase64 directly from the document object
      if (document.fileContentBase64) {
        // Create data URL for iframe
        const dataUrl = `data:${document.mimeType};base64,${document.fileContentBase64}`
        setPdfData(dataUrl)
      } else {
        console.error("No fileContentBase64 found in document")
      }
    } catch (error) {
      console.error("Error displaying document:", error)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleDownloadDocument = async (doc: ClinicalDocument) => {
    try {
      // Use fileContentBase64 directly from the document object
      if (doc.fileContentBase64) {
        // Convert base64 to blob and trigger download
        const binaryString = atob(doc.fileContentBase64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: doc.mimeType })
        const url = URL.createObjectURL(blob)

        const link = window.document.createElement('a')
        link.href = url
        link.download = doc.filename
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)

        URL.revokeObjectURL(url)
      } else {
        console.error("No fileContentBase64 found in document")
      }
    } catch (error) {
      console.error("Error downloading document:", error)
    }
  }


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando documentos clínicos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/patient')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mi Historial Clínico</h1>
            <p className="text-muted-foreground">Documentos clínicos y resultados de exámenes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentos Disponibles
                </CardTitle>
                <CardDescription>
                  {documents.length} documento{documents.length !== 1 ? 's' : ''} encontrado{documents.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay documentos clínicos disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedDocument?.id === document.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleViewDocument(document)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{document.filename}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {document.kind}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(document.sizeBytes)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(document.uploadedAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewDocument(document)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadDocument(document)
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* PDF Viewer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Visor de Documentos</CardTitle>
                <CardDescription>
                  {selectedDocument ? selectedDocument.filename : 'Selecciona un documento para visualizar'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDocument ? (
                  <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Selecciona un documento de la lista para visualizarlo</p>
                    </div>
                  </div>
                ) : pdfLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p>Cargando documento...</p>
                    </div>
                  </div>
                ) : isLargeFile ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Este archivo es demasiado grande para previsualizar en el navegador</p>
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadDocument(selectedDocument)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar archivo completo
                      </Button>
                    </div>
                  </div>
                ) : pdfData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(selectedDocument)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-auto max-h-[600px]">
                      <iframe
                        src={pdfData}
                        className="w-full h-[600px] border-0"
                        title={`PDF Viewer - ${selectedDocument.filename}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <p className="text-red-500">Error al cargar el documento</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => handleViewDocument(selectedDocument)}
                      >
                        Reintentar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}