import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AffiliateQRCodeProps {
  link: string;
  affiliateName?: string;
  size?: number;
}

export const AffiliateQRCode = ({ link, affiliateName = "Afiliado", size = 200 }: AffiliateQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, link, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }, (error) => {
        if (error) console.error("Erro ao gerar QR Code:", error);
      });
    }
  }, [link, size]);

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${affiliateName.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} />
      <Button size="sm" variant="outline" onClick={downloadQRCode}>
        <Download className="w-4 h-4 mr-2" /> Descarregar QR Code
      </Button>
    </div>
  );
};

export default AffiliateQRCode;
