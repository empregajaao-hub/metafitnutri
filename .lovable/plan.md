## Sistema Completo de Afiliados — METAFIT NUTRI

Vou integrar um sistema profissional de afiliados ao painel admin existente, mantendo 100% do design atual (AdminSidebar, cores, componentes shadcn, padrão visual).

---

### 1. Base de Dados (Supabase Migration)

Criar 5 tabelas novas + enum + RLS + triggers + função de comissão automática:

**`affiliates`** — perfil do afiliado
- `user_id`, `code` (único, ex: `usuario123`), `name`, `whatsapp`, `email`, `payment_method` (`iban`|`wallet`), `payment_details`, `status` (`pending`|`active`|`suspended`|`rejected`), `commission_percent` (default 40), `bonus`, `total_earned`, `total_paid`, `total_clicks`, `total_conversions`

**`affiliate_clicks`** — rastreio de cliques (anti-spam: hash IP + UA, índice no `affiliate_id`+`created_at`)

**`referrals`** — quando alguém se regista via link
- `affiliate_id`, `referred_user_id` (único), `clicked_at`, `signed_up_at`, `subscribed_at`, `status`

**`commissions`** — gerada automaticamente em cada pagamento aprovado
- `affiliate_id`, `referral_id`, `payment_id`, `plan`, `sale_amount`, `commission_amount`, `percent_applied`, `status` (`pending`|`approved`|`paid`|`cancelled`)

**`affiliate_payments`** — pagouts manuais feitos pelo admin
- `affiliate_id`, `amount`, `method`, `reference`, `paid_at`, `notes`

**`affiliate_settings`** — single-row com `default_percent`, `min_payout`, `cookie_days`, `bonus_rules`

**Segurança:**
- RLS: afiliado vê só os seus dados; admin vê tudo (via `has_role`)
- Trigger anti-auto-referência: rejeita se `referred_user_id = affiliates.user_id`
- Índices em `code`, `affiliate_id`, `referred_user_id`, `status`
- Função `register_affiliate_click(code, ip_hash)` — security definer
- Função `attribute_referral(user_id, code)` — chamada no signup
- Função `generate_commission_for_payment(payment_id)` — chamada pelo webhook Kursinha

### 2. Edge Functions

- **`affiliate-track-click`** (público) — regista clique, define cookie de atribuição (30 dias)
- **`affiliate-attribute`** — chamado após signup com o código guardado em localStorage
- Atualizar **`kursinha-webhook`** existente — após ativar subscrição, chama `generate_commission_for_payment`
- **`admin-affiliate-payout`** — admin marca comissões como pagas e cria registo em `affiliate_payments`

### 3. Painel Admin — adicionar ao `AdminSidebar` existente

Novo grupo "Afiliados" com sub-itens (mantendo o estilo dos `menuItems` atuais):
- `affiliates-overview` — Dashboard
- `affiliates-list` — Lista (aprovar/suspender/editar %)
- `affiliates-commissions` — Comissões (filtros por status, marcar como paga em lote)
- `affiliates-payments` — Histórico de pagamentos
- `affiliates-ranking` — Top afiliados (diário/semanal/mensal — tabs)
- `affiliates-reports` — Relatórios + export CSV
- `affiliates-settings` — % default, regras de bónus, dias de cookie

Novos componentes em `src/components/admin/affiliates/`:
- `AffiliatesOverview.tsx` — KPI cards + Recharts (LineChart vendas semanais, BarChart top 10)
- `AffiliatesList.tsx` — DataTable com ações (aprovar, suspender, editar)
- `AffiliatesCommissions.tsx`
- `AffiliatesPayments.tsx`
- `AffiliatesRanking.tsx` — tabs diário/semanal/mensal
- `AffiliatesReports.tsx`
- `AffiliatesSettings.tsx`

Atualizar `src/pages/Admin.tsx` para renderizar estes tabs e `AdminSidebar.tsx` para incluir o grupo (com badge de pedidos pendentes).

### 4. Painel do Afiliado (área do utilizador)

Nova rota `/affiliate` (`src/pages/Affiliate.tsx`) — usa o tema/design do app:
- Se `status='none'` → form de candidatura (nome, WhatsApp, email, método pagamento, IBAN/carteira)
- Se `status='pending'` → ecrã "em análise"
- Se `status='active'` → dashboard pessoal:
  - Card com link `https://metafitnutri.lovable.app/ref/{code}` + botão copiar
  - Botões partilhar: WhatsApp, Facebook, Instagram (deep links)
  - Stats: cliques, conversões, ganho total, pendente
  - Histórico de comissões e pagamentos
  - Posição no ranking

Adicionar entrada "Programa de Afiliados" no menu do utilizador.

### 5. Sistema de Referência (frontend)

- **Rota `/ref/:code`** — `src/pages/RefRedirect.tsx`:
  - Chama edge function para registar clique
  - Guarda `metafit_ref` em `localStorage` (30 dias) + cookie
  - Redireciona para `/auth?ref={code}`
- **`Auth.tsx`** — após signup bem-sucedido, lê `metafit_ref` e chama `affiliate-attribute`
- **`Subscription.tsx` / `kursinha-webhook`** — quando pagamento aprovado, comissão gerada automaticamente via trigger/função SQL

### 6. Segurança / Anti-fraude

- Bloquear auto-referência (trigger SQL)
- Rate-limit em cliques (máx 10/min por IP-hash) 
- Comissão só `approved` quando subscrição confirmada pelo webhook
- Logs em `affiliate_clicks` com hash de IP (não o IP cru)
- Validações Zod em todos os forms e edge functions
- Apenas admin (via `has_role`) pode aprovar/pagar/alterar %

### 7. Stack & Visual

- React + TS + Tailwind (tokens semânticos do `index.css`)
- Recharts para gráficos (já no projeto)
- Framer Motion para transições suaves
- shadcn Components (Card, Table, Tabs, Dialog, Badge) — iguais aos do admin atual
- Totalmente responsivo (mobile/tablet/desktop), testado nos breakpoints existentes

---

### Ordem de execução

1. Migration Supabase (tabelas + RLS + funções + triggers)
2. Atualizar webhook Kursinha para chamar `generate_commission_for_payment`
3. Edge functions de tracking/atribuição
4. Componentes admin de afiliados + integração no `AdminSidebar` e `Admin.tsx`
5. Página do afiliado + form de candidatura
6. Rota `/ref/:code` + atribuição no signup
7. QA visual e fluxo end-to-end
