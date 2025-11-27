"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface EpsValidationResponseDTO {
  isValid: boolean
  epsName: string | null
  numeroDocumento: string | null
  status: string | null
  message: string | null
}

interface EpsValidationModalProps {
  isOpen: boolean
  validationResult: EpsValidationResponseDTO | null
  isValidating: boolean
  onContinue: () => void
  onCancel: () => void
}

export function EpsValidationModal({
  isOpen,
  validationResult,
  isValidating,
  onContinue,
  onCancel,
}: EpsValidationModalProps) {
  console.log("[DEBUG] EpsValidationModal render:", { isOpen, validationResult, isValidating })
  if (!validationResult) {
    console.log("[DEBUG] EpsValidationModal: no validationResult, returning null")
    return null
  }

  const { isValid, epsName, numeroDocumento, status, message } = validationResult

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            Resultado de Validación EPS
          </DialogTitle>
          <DialogDescription>
            Verifique la información de validación antes de continuar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Estado:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              isValid
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              {isValid ? "Válido" : "Inválido"}
            </span>
          </div>

          {epsName && (
            <div>
              <span className="font-medium">Nombre EPS:</span>
              <p className="text-sm text-muted-foreground mt-1">{epsName}</p>
            </div>
          )}

          {numeroDocumento && (
            <div>
              <span className="font-medium">Número de Documento:</span>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{numeroDocumento}</p>
            </div>
          )}

          {status && (
            <div>
              <span className="font-medium">Estado del Sistema:</span>
              <p className="text-sm text-muted-foreground mt-1">{status}</p>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-sm">Mensaje:</span>
                  <p className="text-sm text-muted-foreground mt-1">{message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isValidating}>
            Cancelar
          </Button>
          <Button onClick={onContinue} disabled={!isValid || isValidating}>
            {isValidating ? "Validando..." : "Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}