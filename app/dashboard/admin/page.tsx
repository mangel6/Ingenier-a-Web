"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Activity, Server, AlertTriangle, Shield, Database, BarChart3, Settings, LogOut } from "lucide-react"
import { authSystem } from "@/lib/auth"

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    const user = authSystem.getCurrentUser()
    if (!user || user.tipoUsuario !== "admin") {
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
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Sistema Médico Integral - Monitoreo y Control</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Sistema Operativo
            </Badge>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                  <p className="text-2xl font-bold">1,847</p>
                  <p className="text-xs text-green-600">+12% vs mes anterior</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consultas/Día</p>
                  <p className="text-2xl font-bold">2,341</p>
                  <p className="text-xs text-green-600">+8% vs promedio</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uptime Sistema</p>
                  <p className="text-2xl font-bold">99.8%</p>
                  <p className="text-xs text-green-600">Excelente</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Server className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alertas Activas</p>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-red-600">Requiere atención</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos y estado del sistema */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Métricas de Uso del Sistema
              </CardTitle>
              <CardDescription>Evolución mensual de usuarios, consultas y estudios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                [Gráfico de barras - Datos mensuales]
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Estado de Integraciones
              </CardTitle>
              <CardDescription>Conectividad con sistemas externos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>HL7</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>FHIR</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>DICOM</span>
                  <span>78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>APIs</span>
                  <span>95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Centros Conectados</p>
                <p className="text-2xl font-bold text-blue-900">24</p>
                <p className="text-xs text-blue-700">12 hospitales, 8 clínicas, 4 laboratorios</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas y solicitudes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertas del Sistema
              </CardTitle>
              <CardDescription>Notificaciones críticas y de mantenimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Fallo en sincronización con Centro Norte</p>
                    <p className="text-xs text-muted-foreground">hace 5 min</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    error
                  </Badge>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Uso de almacenamiento al 85%</p>
                    <p className="text-xs text-muted-foreground">hace 15 min</p>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    warning
                  </Badge>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Actualización de seguridad disponible</p>
                    <p className="text-xs text-muted-foreground">hace 1 hora</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    info
                  </Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Ver Todas las Alertas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Solicitudes Pendientes
              </CardTitle>
              <CardDescription>Requests que requieren aprobación administrativa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium">Nuevo Usuario</p>
                      <p className="text-xs text-muted-foreground">Dr. Ana López - Cardiología</p>
                      <p className="text-xs text-muted-foreground">Fecha: 2024-01-15</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Revisar
                    </Button>
                    <Button size="sm">Aprobar</Button>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium">Acceso a Datos</p>
                      <p className="text-xs text-muted-foreground">EPS Salud Total - Administración</p>
                      <p className="text-xs text-muted-foreground">Fecha: 2024-01-14</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Revisar
                    </Button>
                    <Button size="sm">Aprobar</Button>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Ver Todas las Solicitudes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
