"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Heart, Pill, User, Clock, Phone, MapPin, Download, Eye, LogOut } from "lucide-react"
import { authSystem } from "@/lib/auth"

export default function PatientDashboard() {
  const router = useRouter()

  useEffect(() => {
    const user = authSystem.getCurrentUser()
    if (!user || user.tipoUsuario !== "paciente") {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    authSystem.logout()
    router.push("/login")
  }
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Mi Portal de Salud</h1>
            <p className="text-muted-foreground">María González - CC: 12345678</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Cita
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Contactar
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Información rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próxima Cita</p>
                  <p className="text-lg font-bold">15 Ene</p>
                  <p className="text-xs text-blue-600">Dr. Pérez - 09:00</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Historias Clínicas</p>
                  <p className="text-lg font-bold">12</p>
                  <p className="text-xs text-green-600">Disponibles</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medicamentos</p>
                  <p className="text-lg font-bold">3</p>
                  <p className="text-xs text-purple-600">Activos</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Pill className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado General</p>
                  <p className="text-lg font-bold">Bueno</p>
                  <p className="text-xs text-green-600">Última revisión</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Citas y medicamentos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Próximas Citas
              </CardTitle>
              <CardDescription>Tus citas médicas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50">
                  <div className="text-center">
                    <p className="text-lg font-bold">15</p>
                    <p className="text-xs text-muted-foreground">ENE</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Control Cardiológico</p>
                    <p className="text-sm text-muted-foreground">Dr. Juan Pérez - Cardiología</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        09:00 - 09:30
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Consultorio 201
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-2">Confirmada</Badge>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline">
                        Reagendar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold">22</p>
                    <p className="text-xs text-muted-foreground">ENE</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Examen de Laboratorio</p>
                    <p className="text-sm text-muted-foreground">Laboratorio Central</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        07:00 - 08:00
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Piso 1 - Lab
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Pendiente</Badge>
                    <div className="flex flex-col gap-1 mt-2">
                      <Button size="sm" variant="outline">
                        Reagendar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold">28</p>
                    <p className="text-xs text-muted-foreground">ENE</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Consulta de Seguimiento</p>
                    <p className="text-sm text-muted-foreground">Dr. Ana López - Medicina General</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        14:30 - 15:00
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Telemedicina
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Pendiente</Badge>
                    <div className="flex flex-col gap-1 mt-2">
                      <Button size="sm" variant="outline">
                        Reagendar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Ver Todas las Citas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Medicamentos Activos
              </CardTitle>
              <CardDescription>Tratamientos actuales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium text-sm">Losartán 50mg</p>
                  <p className="text-xs text-muted-foreground">1 tableta cada 12 horas</p>
                  <p className="text-xs text-muted-foreground mt-1">Hasta: 15 Feb 2024</p>
                  <Badge variant="secondary" className="text-xs mt-2">
                    Hipertensión
                  </Badge>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-medium text-sm">Atorvastatina 20mg</p>
                  <p className="text-xs text-muted-foreground">1 tableta en la noche</p>
                  <p className="text-xs text-muted-foreground mt-1">Hasta: 28 Feb 2024</p>
                  <Badge variant="secondary" className="text-xs mt-2">
                    Colesterol
                  </Badge>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-medium text-sm">Omeprazol 20mg</p>
                  <p className="text-xs text-muted-foreground">1 cápsula en ayunas</p>
                  <p className="text-xs text-muted-foreground mt-1">Hasta: 10 Feb 2024</p>
                  <Badge variant="secondary" className="text-xs mt-2">
                    Gastritis
                  </Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Ver Historial Completo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Historias clínicas y resultados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Historias Clínicas Recientes
              </CardTitle>
              <CardDescription>Últimas consultas y diagnósticos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-bold">08</p>
                    <p className="text-xs text-muted-foreground">ENE</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Control Cardiológico</p>
                    <p className="text-xs text-muted-foreground">Dr. Juan Pérez</p>
                    <p className="text-xs text-green-600 mt-1">Estado: Estable</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-bold">20</p>
                    <p className="text-xs text-muted-foreground">DIC</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Exámenes de Laboratorio</p>
                    <p className="text-xs text-muted-foreground">Laboratorio Central</p>
                    <p className="text-xs text-blue-600 mt-1">Resultados disponibles</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-bold">15</p>
                    <p className="text-xs text-muted-foreground">DIC</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Consulta General</p>
                    <p className="text-xs text-muted-foreground">Dr. Ana López</p>
                    <p className="text-xs text-green-600 mt-1">Revisión rutinaria</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => router.push('/dashboard/patient/history')}>
                Ver Historial Completo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Mi Información
              </CardTitle>
              <CardDescription>Datos personales y de contacto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre Completo</p>
                    <p className="font-medium">María González</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Documento</p>
                    <p className="font-medium">CC 12345678</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de Nacimiento</p>
                    <p className="font-medium">15/03/1985</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Edad</p>
                    <p className="font-medium">38 años</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="font-medium">+57 300 123 4567</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">maria@email.com</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="font-medium">Calle 123 #45-67, Bogotá</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">EPS</p>
                  <p className="font-medium">Salud Total</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Contacto de Emergencia</p>
                  <p className="font-medium">Juan González - +57 300 987 6543</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Actualizar Información
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
