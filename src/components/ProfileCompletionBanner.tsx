import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProfileCompletionBannerProps {
  missingFields: string[];
}

export const ProfileCompletionBanner = ({ missingFields }: ProfileCompletionBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible || missingFields.length === 0) return null;

  return (
    <Alert className="mb-6 border-primary/50 bg-primary/5">
      <AlertCircle className="h-4 w-4 text-primary" />
      <AlertTitle className="flex items-center justify-between">
        <span>Complete o seu perfil</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>
          Faltam alguns dados para personalizar a sua experiência: <strong>{missingFields.join(', ')}</strong>
        </p>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate('/profile')}
          className="mt-2"
        >
          Completar Perfil
        </Button>
      </AlertDescription>
    </Alert>
  );
};
