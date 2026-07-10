"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@/hooks/use-auth";
import { uploadAndExtractInsurance } from "@/app/actions/insurance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Loader2, CheckCircle2, XCircle, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

type UploadStatus = "idle" | "uploading" | "extracting" | "success" | "error";

export function UploadZone({
  open,
  onOpenChange,
  onUploadComplete,
}: UploadZoneProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string>("");

  const processFile = useCallback(
    async (file: File) => {
      if (!user) return;

      setFileName(file.name);
      setStatus("uploading");

      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        setStatus("extracting");
        const result = await uploadAndExtractInsurance(
          user.uid,
          base64,
          file.name,
          file.type
        );

        if (result.success) {
          setStatus("success");
          toast.success("Seguro adicionado com sucesso!", {
            description: `${result.policy?.insurerName} - ${result.policy?.policyType}`,
          });
          onUploadComplete();
        } else {
          setStatus("error");
          toast.error("Erro ao processar o documento", {
            description: result.error,
          });
        }
      } catch {
        setStatus("error");
        toast.error("Erro inesperado ao processar o ficheiro.");
      }
    },
    [user, onUploadComplete]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: status === "uploading" || status === "extracting",
  });

  function handleOpenChange(value: boolean) {
    if (!value && (status === "uploading" || status === "extracting")) return;
    onOpenChange(value);
    if (!value) {
      setTimeout(() => {
        setStatus("idle");
        setFileName("");
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg gradient-brand p-1.5">
              <FileText className="h-4 w-4 text-white" />
            </div>
            Carregar seguro
          </DialogTitle>
          <DialogDescription>
            Arrasta ou seleciona uma Ficha de Informação Normalizada (FIN) em
            formato PDF. A IA vai extrair todos os dados automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
            (status === "uploading" || status === "extracting") &&
              "pointer-events-none opacity-60"
          )}
        >
          <input {...getInputProps()} />
          {status === "idle" && (
            <>
              <div className={cn(
                "rounded-2xl p-4 mb-4 transition-colors duration-200",
                isDragActive ? "bg-primary/10" : "bg-muted"
              )}>
                <Upload className={cn(
                  "h-8 w-8 transition-colors duration-200",
                  isDragActive ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Solta o ficheiro aqui..."
                  : "Arrasta um PDF ou clica para selecionar"}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Apenas ficheiros PDF, até 10MB
              </p>
            </>
          )}
          {status === "uploading" && (
            <>
              <div className="rounded-2xl bg-primary/10 p-4 mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-sm font-medium">A enviar o teu ficheiro...</p>
              <p className="mt-1 text-xs text-muted-foreground">{fileName}</p>
            </>
          )}
          {status === "extracting" && (
            <>
              <div className="rounded-2xl bg-primary/10 p-4 mb-4">
                <Sparkles className="h-8 w-8 animate-pulse text-primary" />
              </div>
              <p className="text-sm font-medium">A IA está a analisar o documento...</p>
              <p className="mt-1 text-xs text-muted-foreground">
                A extrair seguradora, coberturas, exclusões e custos
              </p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="rounded-2xl bg-emerald-100 p-4 mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-600">
                Seguro adicionado com sucesso!
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Todos os dados foram extraídos e guardados
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="rounded-2xl bg-red-100 p-4 mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-sm font-medium text-destructive">
                Não conseguimos processar este documento
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Verifica se o ficheiro é uma FIN válida em formato PDF
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus("idle");
                  setFileName("");
                }}
              >
                Tentar com outro ficheiro
              </Button>
            </>
          )}
        </div>
        {status !== "uploading" && status !== "extracting" && (
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full"
          >
            {status === "success" ? "Fechar" : "Cancelar"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
