# Guia Completo - Painel de Afiliados MetaFitNutri

## 📋 Visão Geral

O painel de afiliados está agora completamente funcional e integrado no painel de admin. Permite criar, gerir e monitorizar afiliados, bem como gerar links únicos para cada um.

## 🚀 Como Usar

### 1. Aceder ao Painel de Afiliados

1. Acede ao painel de admin (`/admin`)
2. Na barra lateral, clica em **"Afiliados"**
3. Serás redirecionado para o painel de gestão de afiliados

### 2. Criar um Novo Afiliado

**Passo 1:** Na aba **"Afiliados"**, clica no botão **"+ Novo Afiliado"** (canto superior direito)

**Passo 2:** Preenche o formulário com os seguintes dados:

- **Nome** (obrigatório): Nome completo do afiliado
- **Email** (obrigatório): Email do afiliado
- **WhatsApp** (obrigatório): Número de WhatsApp (ex: +244 9XX XXX XXX)
- **Método de Pagamento** (obrigatório): Escolhe entre:
  - IBAN (Transferência Bancária)
  - Carteira Digital
- **Detalhes de Pagamento** (obrigatório): 
  - Se IBAN: Número IBAN (ex: PT50 0002 0123 1234 5678 9015 4)
  - Se Carteira: Número ou identificador da carteira
- **Comissão (%)** (opcional): Percentagem de comissão (padrão: 40%)

**Passo 3:** Clica em **"Criar Afiliado"**

O sistema irá:
- Gerar automaticamente um **código único** para o afiliado
- Ativar o afiliado imediatamente
- Mostrar uma mensagem de sucesso com o código gerado

### 3. Gerar e Visualizar Links de Afiliados

**Para visualizar o link de um afiliado existente:**

1. Na tabela de afiliados, localiza a linha do afiliado
2. Clica no botão **"Link"** (ícone de corrente)
3. Abre-se um modal com:
   - **Link de Indicação**: URL completa (ex: `https://teudominio.com/ref/CODIGO`)
   - **Botão Copiar**: Copia o link para a área de transferência
   - **QR Code**: Código QR do link (podes descarregar como PNG)
   - **Estatísticas**: Cliques, conversões, taxa de conversão e ganho total

### 4. Copiar Links para Partilhar

1. Abre o modal do link (conforme descrito acima)
2. Clica no botão **"Copiar"** (ícone de clipboard)
3. O link é copiado para a área de transferência
4. Podes agora partilhar o link via:
   - Email
   - WhatsApp
   - Redes Sociais
   - Qualquer outra plataforma

### 5. Descarregar QR Code

1. Abre o modal do link de um afiliado
2. Clica em **"Descarregar QR Code"**
3. O QR Code é descarregado como imagem PNG
4. Podes usar o QR Code em:
   - Materiais de marketing
   - Cartazes
   - Brochuras
   - Posts em redes sociais

### 6. Filtrar e Pesquisar Afiliados

**Busca por Nome, Email ou Código:**
- Usa o campo de pesquisa no topo da tabela
- Digita qualquer parte do nome, email ou código
- A tabela filtra em tempo real

**Filtrar por Status:**
- Usa o dropdown "Todos os Status"
- Opções disponíveis:
  - Todos os Status
  - Pendente (aguardando aprovação)
  - Ativo (aprovado e a gerar links)
  - Suspenso (temporariamente desativado)
  - Rejeitado (não aprovado)

### 7. Visualizar Detalhes de um Afiliado

1. Na tabela, clica no botão **"Olho"** (ícone de visualização)
2. Abre-se um modal com informações completas:
   - Dados pessoais (nome, email, WhatsApp)
   - Código único
   - Status
   - Percentagem de comissão
   - Estatísticas (cliques, conversões, ganho total, total pago)
   - Link de indicação
   - Notas (se existirem)

### 8. Editar Afiliado

1. Na tabela, clica no botão **"Editar"**
2. Abre-se um modal onde podes alterar:
   - Percentagem de comissão
   - Bónus (valor extra em Kz)
   - Notas internas
3. Clica em **"Guardar"** para confirmar

### 9. Aprovar/Suspender Afiliados

**Aprovar um afiliado pendente:**
- Clica no botão **"Aprovar"** (apenas aparece se o status é "Pendente")
- O afiliado passa para status "Ativo" imediatamente

**Suspender um afiliado ativo:**
- Clica no botão **"Suspender"** (apenas aparece se o status é "Ativo")
- O afiliado passa para status "Suspenso"
- Os seus links deixam de funcionar

### 10. Registar Pagamento a um Afiliado

1. Na tabela, clica no botão **"Pagar"**
2. Abre-se um modal com:
   - Nome do afiliado
   - Método de pagamento
   - Campo para inserir o valor
3. Digita o valor em Kz
4. Clica em **"Confirmar"**
5. O pagamento é registado no histórico

### 11. Dashboard de Afiliados

Na aba **"Dashboard"**, podes ver:

- **KPIs Principais:**
  - Total de afiliados
  - Afiliados ativos
  - Total de vendas
  - Comissões pagas
  - Comissões pendentes
  - Cliques totais
  - Conversões totais
  - Pendentes de aprovação

- **Gráficos:**
  - Vendas semanais (linha)
  - Top 10 afiliados (barras)

### 12. Visualizar Comissões

Na aba **"Comissões"**, podes ver:

- Data da comissão
- Afiliado que gerou
- Plano vendido
- Valor da venda
- Valor da comissão
- Status (Pendente, Aprovada, Paga)
- Botão para marcar como paga

### 13. Histórico de Pagamentos

Na aba **"Pagamentos"**, podes ver:

- Data do pagamento
- Afiliado que recebeu
- Valor pago
- Método de pagamento
- Referência de pagamento

### 14. Ranking de Afiliados

Na aba **"Ranking"**, podes ver:

- **Diário**: Top afiliados do dia
- **Semanal**: Top afiliados da semana
- **Mensal**: Top afiliados do mês

Para cada período, mostra:
- Posição (#)
- Nome do afiliado
- Número de vendas
- Ganho total

### 15. Relatórios e Exportação

Na aba **"Relatórios"**, podes:

- **Exportar CSV**: Descarrega lista completa de afiliados com todas as métricas
- Ver estatísticas resumidas:
  - Receita total
  - Comissões pagas
  - Valor a pagar

### 16. Configurações Globais

Na aba **"Configurações"**, podes ajustar:

- **Percentagem Padrão (%)**: Comissão padrão para novos afiliados
- **Pagamento Mínimo (Kz)**: Valor mínimo para processar pagamento
- **Duração do Cookie (dias)**: Quantos dias o link permanece válido

## 📊 Fluxo Completo de um Afiliado

### 1. Criação
- Admin cria novo afiliado no painel
- Sistema gera código único automaticamente
- Afiliado fica ativo imediatamente

### 2. Geração de Link
- Admin visualiza o link do afiliado
- Copia o link ou descarrega QR Code
- Partilha com o afiliado

### 3. Partilha
- Afiliado partilha o link (ex: `https://teudominio.com/ref/CODIGO`)
- Pessoas clicam no link

### 4. Rastreamento
- Cada clique é registado na tabela de cliques
- Estatísticas são atualizadas em tempo real

### 5. Conversão
- Pessoa clica no link e faz signup
- Pessoa compra um plano
- Comissão é gerada automaticamente

### 6. Pagamento
- Admin visualiza comissão pendente
- Admin registra pagamento ao afiliado
- Histórico fica registado

## 🔗 URLs Importantes

- **Painel Admin**: `/admin`
- **Aba Afiliados**: `/admin?tab=affiliates`
- **Link de Afiliado**: `/ref/{CODIGO}`
- **Página de Afiliado (User)**: `/affiliate`

## ⚠️ Notas Importantes

1. **Código Único**: Cada afiliado recebe um código único gerado automaticamente. Este código é imutável.

2. **Status Ativo**: Apenas afiliados com status "Ativo" podem gerar links funcionais.

3. **Comissão**: A comissão é calculada automaticamente com base na percentagem definida e no valor da venda.

4. **Rastreamento**: Os links funcionam por cookie (30 dias por padrão). Podes alterar este período nas configurações.

5. **Backup**: Faz regularmente backup dos dados de afiliados.

## 🆘 Troubleshooting

**Problema: Link não funciona**
- Verifica se o afiliado está com status "Ativo"
- Verifica se o código está correto
- Testa o link em modo incógnito

**Problema: Comissão não aparece**
- Verifica se a pessoa fez signup usando o link
- Verifica se a pessoa completou o pagamento
- Espera alguns minutos para a comissão ser processada

**Problema: QR Code não descarrega**
- Tenta novamente
- Verifica as permissões do navegador
- Tenta outro navegador

## 📞 Suporte

Para problemas técnicos, contacta o suporte técnico com:
- Screenshot do erro
- Código do afiliado
- Data e hora do problema
