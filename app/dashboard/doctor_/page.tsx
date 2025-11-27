"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, Clock, Stethoscope, Activity, Bell, Plus, Search, Filter, LogOut } from "lucide-react"
import { authSystem } from "@/lib/auth"

export default function DoctorDashboard() {
  const router = useRouter()

  useEffect(() => {
    const user = authSystem.getCurrentUser()
    if (!user || user.tipoUsuario !== "doctor") {
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
            <h1 className="text-3xl font-bold">Panel Médico</h1>
            <p className="text-muted-foreground">Dr. Juan Pérez - Cardiología</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Consulta
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Métricas del día */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Citas Hoy</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-blue-600">3 pendientes</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Pacientes Activos</p>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-green-600">+5 esta semana</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Historias Clínicas</p>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-purple-600">Por completar</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-2xl font-bold">25min</p>
                  <p className="text-xs text-orange-600">Por consulta</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agenda y pacientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Agenda de Hoy
                  </CardTitle>
                  <CardDescription>Martes, 15 de Enero 2024</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg bg-blue-50">
                  <div className="text-center">
                    <p className="text-sm font-medium">09:00</p>
                    <p className="text-xs text-muted-foreground">30min</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">María González</p>
                    <p className="text-sm text-muted-foreground">Control cardiológico - CC: 12345678</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Control
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Presencial
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm">Iniciar</Button>
                </div>

                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium">09:30</p>
                    <p className="text-xs text-muted-foreground">30min</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Carlos Rodríguez</p>
                    <p className="text-sm text-muted-foreground">Primera consulta - CC: 87654321</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Primera vez
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Presencial
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Esperar
                  </Button>
                </div>

                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium">10:00</p>
                    <p className="text-xs text-muted-foreground">30min</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Ana Martínez</p>
                    <p className="text-sm text-muted-foreground">Seguimiento post-operatorio - CC: 11223344</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        Seguimiento
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Telemedicina
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Esperar
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Ver Agenda Completa
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Últimas acciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Historia clínica completada</p>
                    <p className="text-xs text-muted-foreground">Pedro Sánchez - hace 10 min</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Receta médica enviada</p>
                    <p className="text-xs text-muted-foreground">Laura Torres - hace 25 min</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Examen solicitado</p>
                    <p className="text-xs text-muted-foreground">Roberto Díaz - hace 1 hora</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Cita reagendada</p>
                    <p className="text-xs text-muted-foreground">Carmen López - hace 2 horas</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Ver Historial Completo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas y herramientas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Herramientas Médicas
              </CardTitle>
              <CardDescription>Accesos rápidos a funcionalidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent" onClick={() => router.push('/dashboard/doctor/upload')}>
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Nueva Historia</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">Agendar Cita</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                  <Activity className="w-6 h-6" />
                  <span className="text-sm">Solicitar Examen</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Buscar Paciente</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Mes</CardTitle>
              <CardDescription>Resumen de actividad mensual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Consultas realizadas</span>
                  <span className="font-bold">247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Historias clínicas</span>
                  <span className="font-bold">189</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Exámenes solicitados</span>
                  <span className="font-bold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recetas emitidas</span>
                  <span className="font-bold">203</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Satisfacción promedio</span>
                  <span className="font-bold text-green-600">4.8/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
