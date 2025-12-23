# Instruções para Configurar Administrador

## Como Criar o Usuário Administrador

Para promover o email `repairlubatec@gmail.com` a administrador, siga estes passos:

### 1. Criar a Conta de Usuário

Primeiro, você precisa criar uma conta normal no aplicativo:

1. Acesse a página de login/registro do METAFIT
2. Registre-se com o email: `repairlubatec@gmail.com`
3. Use a senha: `Luba2025`
4. Complete o processo de registro normalmente

### 2. Promover a Conta a Administrador

Depois de criar a conta, você precisa executar um comando SQL no Supabase para dar permissões de administrador:

1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/kdskhwtqtrwqvdexcjeh
2. Vá para "SQL Editor"
3. Execute o seguinte comando SQL:

```sql
-- Primeiro, encontre o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'repairlubatec@gmail.com';

-- Depois, usando o ID retornado, promova para admin
-- Substitua 'USER_ID_AQUI' pelo ID real retornado na consulta acima
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_AQUI', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### 3. Acessar o Painel Admin

Após executar o SQL acima:

1. Faça logout e login novamente no aplicativo
2. Acesse: `https://seudominio.com/admin`
3. Você terá acesso completo ao painel de administração

## Funcionalidades do Painel Admin

### Gestão de Pagamentos
- Visualizar todos os pagamentos pendentes, aprovados e rejeitados
- Ver comprovativos de pagamento (imagens são exibidas diretamente)
- Aprovar ou rejeitar pagamentos
- Ativar automaticamente subscrições ao aprovar

### Gestão de Utilizadores
- Ver todos os utilizadores registados
- Pesquisar por nome ou email
- Filtrar por tipo de plano (Grátis, Mensal, Anual)
- Alterar plano de qualquer utilizador
- Remover utilizadores (com confirmação)

### Análises e Estatísticas
- Ver evolução de receita e novos utilizadores
- Análises realizadas por mês
- Distribuição de planos
- Taxa de conversão
- Total de subscrições ativas

### Notificações
- Enviar notificações para todos os utilizadores
- Segmentar por tipo de plano:
  - Todos os utilizadores
  - Apenas Premium (Mensal + Anual)
  - Apenas Grátis
  - Apenas Mensais
  - Apenas Anuais
- As notificações são armazenadas no banco de dados
- Modelos de mensagem pré-definidos para facilitar

## Segurança

⚠️ **IMPORTANTE**: Nunca compartilhe as credenciais de administrador. O acesso ao painel admin permite:
- Ver dados de todos os utilizadores
- Aprovar/rejeitar pagamentos
- Alterar planos de utilizadores
- Remover utilizadores
- Enviar notificações em massa

## Suporte

Para problemas com o painel admin:
1. Verifique se o utilizador está devidamente promovido a admin no banco de dados
2. Certifique-se de que fez logout e login após a promoção
3. Verifique os logs do navegador para possíveis erros
