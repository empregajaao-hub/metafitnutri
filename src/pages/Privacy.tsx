import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Trash2 } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Privacidade e Segurança
            </h1>
            <p className="text-lg text-muted-foreground">
              A tua privacidade é a nossa prioridade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Dados Protegidos
              </h3>
              <p className="text-sm text-muted-foreground">
                Todos os teus dados são encriptados e armazenados de forma
                segura em servidores protegidos.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Acesso Restrito
              </h3>
              <p className="text-sm text-muted-foreground">
                Apenas tu tens acesso aos teus dados pessoais, análises e
                histórico.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Transparência Total
              </h3>
              <p className="text-sm text-muted-foreground">
                Sabes sempre como os teus dados são usados e para que fins.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Controlo Total
              </h3>
              <p className="text-sm text-muted-foreground">
                Podes apagar os teus dados a qualquer momento directamente na
                app.
              </p>
            </Card>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Como Usamos os Teus Dados
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  📸 Fotos das Refeições
                </h3>
                <p className="text-muted-foreground">
                  As fotos que envias são analisadas pela nossa IA para estimar
                  macronutrientes. São armazenadas apenas no teu histórico
                  pessoal e podes apagá-las a qualquer momento. Nunca partilhamos
                  as tuas fotos publicamente sem o teu consentimento explícito.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  👤 Informações Pessoais
                </h3>
                <p className="text-muted-foreground">
                  Dados como nome, email, idade, peso e altura são usados
                  exclusivamente para personalizar as tuas recomendações
                  nutricionais e treinos. Estes dados são privados e não são
                  vendidos ou partilhados com terceiros.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  📊 Histórico e Análises
                </h3>
                <p className="text-muted-foreground">
                  O teu histórico de refeições, receitas e análises é guardado
                  para te ajudar a acompanhar o teu progresso. Só tu tens acesso
                  a estes dados através da tua conta protegida por senha.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  🔔 Notificações
                </h3>
                <p className="text-muted-foreground">
                  Usamos as tuas preferências de notificações para enviar
                  lembretes úteis (treinos, refeições, dicas). Podes desactivar
                  qualquer notificação a qualquer momento nas configurações.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-8 bg-primary/10 border-primary">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Os Teus Direitos
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-semibold">✓</span>
                <span>
                  <strong>Acesso:</strong> Podes ver todos os dados que temos
                  sobre ti
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-semibold">✓</span>
                <span>
                  <strong>Correcção:</strong> Podes actualizar as tuas
                  informações pessoais
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-semibold">✓</span>
                <span>
                  <strong>Eliminação:</strong> Podes apagar a tua conta e todos
                  os dados associados
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-semibold">✓</span>
                <span>
                  <strong>Portabilidade:</strong> Podes exportar os teus dados
                  em formato PDF
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-semibold">✓</span>
                <span>
                  <strong>Oposição:</strong> Podes opor-te ao uso dos teus dados
                  para fins específicos
                </span>
              </li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Segurança dos Dados
            </h2>
            <p className="text-muted-foreground mb-4">
              Implementamos medidas de segurança técnicas e organizacionais para
              proteger os teus dados contra acesso não autorizado, perda ou
              alteração:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Encriptação de dados em trânsito e em repouso</li>
              <li>• Autenticação segura com Google OAuth</li>
              <li>• Backups regulares e automáticos</li>
              <li>• Monitorização contínua de segurança</li>
              <li>• Acesso restrito aos servidores</li>
            </ul>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Última actualização: 20 de Novembro de 2025</p>
            <p className="mt-2">
              Dúvidas sobre privacidade?{" "}
              <a
                href="/support"
                className="text-primary hover:underline font-semibold"
              >
                Contacta-nos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;