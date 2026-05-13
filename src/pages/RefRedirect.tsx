import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const RefRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (!code) return navigate("/");
      try {
        // store ref for 30 days
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem("metafit_ref", JSON.stringify({ code, expiry }));
        document.cookie = `metafit_ref=${code}; max-age=${30 * 24 * 60 * 60}; path=/; SameSite=Lax`;
        // fire-and-forget click tracking
        supabase.functions.invoke("affiliate-track-click", {
          body: { code, referrer: document.referrer || null },
        }).catch(() => {});
      } catch {}
      navigate(`/auth?signup=1&ref=${encodeURIComponent(code)}`, { replace: true });
    };
    run();
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">A redirecionar…</div>
    </div>
  );
};

export default RefRedirect;