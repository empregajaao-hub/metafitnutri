# METAFIT - Configuração PWA Mobile

## Resumo da Implementação

O METAFIT foi configurado como uma **Progressive Web App (PWA)** 100% otimizada para dispositivos móveis (iOS e Android), comportando-se como uma aplicação nativa.

## ✨ Funcionalidades Implementadas

### 📱 Instalação PWA

#### **Android / Chrome / Edge**
- ✅ Detecção automática do evento `beforeinstallprompt`
- ✅ Banner personalizado para instalação com CTA claro
- ✅ Prompt nativo de instalação acionado pelo usuário
- ✅ Armazenamento de preferências (não mostrar novamente por 7 dias)

#### **iOS / Safari**
- ✅ Modal instruções passo-a-passo com ilustrações
- ✅ Detecção de iOS e modo standalone
- ✅ Opção "Não mostrar novamente"
- ⚠️ **Limitação**: Safari não permite instalação automática - requer interação manual do usuário

### 🎨 Design Mobile-First

- ✅ Layout otimizado para ecrãs 320px-450px (telefones) e 451px-820px (tablets)
- ✅ Touch targets mínimos de 44×44 px
- ✅ Tipografia responsiva (16px base, 15px em móveis pequenos)
- ✅ Navegação bottom-first com menu inferior fixo
- ✅ Espaçamento adequado para safe areas (iOS)

### 🎯 Navegação Mobile

O menu inferior (`MobileBottomNav`) oferece acesso rápido a:
- 🏠 Início
- 🎯 Planos
- 👨‍🍳 Receitas
- 👤 Perfil
- ❓ Ajuda

### 🆓 Plano Gratuito Sem Login

- ✅ Uso da app sem registo (até 3 análises)
- ✅ Armazenamento local com `localStorage`
- ✅ Rastreamento de uso via `useFreeUsageTracker` hook
- ✅ Modal de conversão após 3 usos

### 💳 Fluxo de Conversão e Pagamento

O modal `FreePlanModal` apresenta:
- Plano Mensal: 5.000 Kz/mês
- Plano Anual: 50.000 Kz/ano (poupa 10.000 Kz)
- Métodos de pagamento: Multicaixa, Transferência Bancária, MB WAY
- Instruções para anexar comprovativo após pagamento

### 🔄 Service Worker e Cache

Configurado via `vite-plugin-pwa`:
- Cache de shell da app (JS, CSS, HTML, imagens)
- Cache de Google Fonts (1 ano)
- Cache de API Supabase (NetworkFirst, 5 minutos)
- Estratégia de fallback offline

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── MobileBottomNav.tsx          # Navegação inferior mobile
│   ├── InstallPromptAndroid.tsx     # Banner instalação Android
│   ├── InstallInstructionsIOS.tsx   # Modal instruções iOS
│   └── FreePlanModal.tsx            # Modal conversão planos
├── hooks/
│   ├── usePWAInstall.tsx            # Hook para instalação PWA
│   └── useFreeUsageTracker.tsx      # Hook rastreamento uso gratuito
public/
└── manifest.json                     # Manifest PWA
vite.config.ts                        # Configuração PWA
index.html                            # Meta tags mobile e PWA
```

## 🚀 Como Testar

### Testar Instalação Android
1. Abra o site em Chrome/Edge Android
2. Aguarde 3 segundos - banner de instalação aparece
3. Clique em "Instalar" para acionar o prompt nativo

### Testar Instruções iOS
1. Abra o site em Safari iOS
2. Aguarde 3 segundos - banner de instruções aparece
3. Clique em "Ver como fazer" para ver instruções passo-a-passo

### Testar Uso Gratuito
1. Acesse `/upload` sem fazer login
2. Analise 3 fotos de refeições
3. Modal de planos aparece automaticamente

### Testar Offline
1. Instale a PWA
2. Desconecte a internet
3. App shell ainda carrega (imagens e CSS em cache)

## 📊 Analytics Recomendados

Eventos importantes para rastrear:
- `pwa_install_prompt_shown` - Banner de instalação mostrado
- `pwa_install_accepted` - Usuário instalou a app
- `pwa_install_dismissed` - Usuário recusou instalação
- `free_usage_limit_reached` - Modal de planos mostrado
- `plan_selected` - Usuário escolheu um plano

## ⚠️ Limitações Conhecidas

### iOS Safari
- ❌ Instalação automática não é possível (restrição do Safari)
- ✅ Solução: Instruções claras passo-a-passo
- 💡 Alternativa: Publicar app nativa via Capacitor/Flutter na App Store

### Offline
- ✅ Shell da app funciona offline
- ⚠️ Funcionalidades que requerem API (análise de fotos, receitas) precisam de internet
- 💡 Possível melhoria: Queue de requisições offline

## 🔧 Configuração Adicional Sugerida

### Para Produção
1. Gerar ícones PWA em múltiplos tamanhos (192x192, 512x512, maskable)
2. Criar splash screens iOS personalizadas
3. Configurar notificações push (Web Push API)
4. Implementar update prompt quando nova versão disponível

### Para App Stores (Opcional)
Se o cliente quiser presença nas lojas oficiais:
1. **Android**: Criar TWA (Trusted Web Activity) ou APK via Capacitor
2. **iOS**: Criar wrapper nativo com WebView via Capacitor
3. Submeter à Play Store e App Store
4. Manter paridade de funcionalidades com PWA

## 📚 Documentação de Referência

- [PWA Docs](https://web.dev/progressive-web-apps/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [iOS Add to Home Screen](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Capacitor (para apps nativas)](https://capacitorjs.com/)

## 🎯 Próximos Passos Recomendados

1. ✅ Testar instalação em dispositivos reais (Android e iOS)
2. 📊 Implementar analytics de instalação e conversão
3. 🔔 Adicionar notificações push para engagement
4. 🎨 Criar ícones e splash screens otimizados
5. 📱 Considerar publicação nas lojas oficiais se cliente solicitar
6. 🧪 Testes A/B no modal de conversão
7. 📧 Integrar email marketing para recuperação de sessões gratuitas

## 🛠️ Manutenção

### Atualizar Service Worker
Sempre que modificar arquivos estáticos importantes:
```bash
npm run build
# Service worker será regenerado automaticamente
```

### Testar PWA Localmente
```bash
npm run dev
# PWA funciona em modo desenvolvimento também
```

### Build Produção
```bash
npm run build
npm run preview  # Testar build localmente
```

---

**Nota Importante**: Este projeto está pronto para uso como PWA. Para instalação automática em iOS, seria necessário criar uma app nativa e submetê-la à App Store, o que requer trabalho adicional (builds nativos, certificados Apple, submissão à loja).
