# Análise do Sistema de Afiliados - MetaFitNutri

## Estado Atual

### O que já existe:
1. **Tabelas Supabase**: Estrutura completa de tabelas (affiliates, commissions, referrals, affiliate_clicks, affiliate_payments, affiliate_settings)
2. **Página de Afiliados**: `/src/pages/Affiliate.tsx` - Permite que utilizadores se candidatem e vejam seus links
3. **Painel Admin**: `/src/components/admin/AdminAffiliates.tsx` - Gestão básica de afiliados
4. **Funções Supabase**: Funções para registar cliques e gerar comissões
5. **Rota de Redirecionamento**: `/ref/:code` para rastrear cliques

### Funcionalidades Implementadas no Admin:
- Dashboard com KPIs (total afiliados, ativos, pendentes, etc.)
- Lista de afiliados com status, comissão, cliques, conversões
- Aprovação/Rejeição de candidaturas
- Edição de comissão e bónus por afiliado
- Gestão de pagamentos
- Visualização de comissões
- Ranking de afiliados
- Exportação em CSV
- Configurações globais (percentagem padrão, pagamento mínimo, duração do cookie)

### O que FALTA implementar:

1. **Geração de Links de Afiliados no Admin**
   - Botão para gerar/copiar link de cada afiliado
   - Visualização do link único do afiliado
   - QR Code do link
   - Histórico de links gerados

2. **Melhorias na Gestão de Afiliados**
   - Busca/Filtro por nome, email, código, status
   - Ordenação por diferentes colunas
   - Paginação (atualmente sem limite)
   - Visualização detalhada de um afiliado individual
   - Histórico de atividades do afiliado

3. **Análise Avançada de Afiliados**
   - Gráficos de performance por afiliado
   - Taxa de conversão por afiliado
   - Valor médio por venda
   - Tendências de cliques e conversões

4. **Gestão de Comissões**
   - Aprovação em massa de comissões
   - Cancelamento de comissões
   - Ajuste manual de comissões
   - Histórico de alterações

5. **Relatórios Avançados**
   - Relatório de afiliados por período
   - Relatório de comissões por período
   - Relatório de pagamentos
   - Exportação em diferentes formatos (PDF, Excel)

6. **Notificações**
   - Notificar afiliados quando ganham comissão
   - Notificar afiliados quando comissão é aprovada
   - Notificar afiliados quando pagamento é processado

## Prioridades para Implementação:

1. **ALTA**: Geração de links no admin + Busca/Filtro
2. **ALTA**: Visualização detalhada de afiliado individual
3. **MÉDIA**: Gráficos de performance
4. **MÉDIA**: Paginação e melhor UX
5. **BAIXA**: Relatórios avançados e exportação

## Tecnologias Usadas:
- React + TypeScript
- Supabase (PostgreSQL)
- Tailwind CSS
- Recharts (gráficos)
- Lucide Icons
