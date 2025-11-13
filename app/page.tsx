import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.676-.732 5.016-2.297 6.834-4.397"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Sistema Médico Integral</CardTitle>
          <CardDescription>Gestiona información médica de forma segura y eficiente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Link href="/login" className="w-full">
              <Button className="w-full" size="lg">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/registro" className="w-full">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                Registrarse
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>¿Necesitas ayuda?</p>
            <Link href="/soporte" className="text-primary hover:underline">
              Contactar Soporte Técnico
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
