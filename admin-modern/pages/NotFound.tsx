import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-xl font-semibold text-foreground mb-2">Página não encontrada</p>
        <p className="text-muted-foreground mb-8">
          Desculpa, a página que procuras não existe ou foi movida.
        </p>

        <Link href="/">
          <Button className="gap-2">Voltar ao Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
