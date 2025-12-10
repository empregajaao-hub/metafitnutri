import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Loader2 } from "lucide-react";

interface ReceiptViewerProps {
  receiptPath: string;
}

export const ReceiptViewer = ({ receiptPath }: ReceiptViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSignedUrl = async () => {
    if (signedUrl) {
      window.open(signedUrl, "_blank");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Não autenticado");
        return;
      }

      const response = await supabase.functions.invoke("get-receipt-url", {
        body: { filePath: receiptPath },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao obter URL");
      }

      const { signedUrl: url } = response.data;
      setSignedUrl(url);
      window.open(url, "_blank");
    } catch (err: any) {
      console.error("Error fetching signed URL:", err);
      setError(err.message || "Erro ao obter comprovativo");
    } finally {
      setLoading(false);
    }
  };

  const isImage = receiptPath.match(/\.(jpg|jpeg|png|webp)$/i);

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={fetchSignedUrl}
        disabled={loading}
        className="flex items-center gap-1"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
        Ver
      </Button>
      {signedUrl && isImage && (
        <img
          src={signedUrl}
          alt="Comprovativo"
          className="h-10 w-10 object-cover rounded cursor-pointer hover:scale-150 transition-transform"
          onClick={() => window.open(signedUrl, "_blank")}
        />
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};
