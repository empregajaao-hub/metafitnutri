import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useProfileCompletion = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        setIsLoading(false);
        return;
      }

      const missing: string[] = [];
      
      if (!profile.Objetivo) missing.push('objetivo');
      if (!profile.Idade) missing.push('idade');
      if (!profile.peso) missing.push('peso');
      if (!profile.Altura) missing.push('altura');
      if (!profile["Nivel de Atividade"]) missing.push('nível de actividade');
      if (!profile["Nome Completo"]) missing.push('nome completo');

      setMissingFields(missing);
      setIsProfileComplete(missing.length === 0);
      setIsLoading(false);

      // Notificar usuário se houver campos faltando
      if (missing.length > 0) {
        toast({
          title: "Perfil Incompleto",
          description: `Faltam dados: ${missing.join(', ')}. Clique no banner para completar!`,
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Erro ao verificar perfil:', error);
      setIsLoading(false);
    }
  };

  const promptToComplete = () => {
    toast({
      title: "Complete o seu perfil",
      description: `Ainda faltam alguns dados para personalizar a sua experiência.`,
    });
    navigate('/profile');
  };

  return {
    isProfileComplete,
    missingFields,
    isLoading,
    checkProfileCompletion,
    promptToComplete,
  };
};
