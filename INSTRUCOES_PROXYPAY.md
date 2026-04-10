# Configuração da Integração ProxyPay (Multicaixa Express)

Esta integração permite que os utilizadores paguem as suas subscrições diretamente através da App Multicaixa Express.

## 1. Configuração no Supabase

Para que a integração funcione, deves configurar as seguintes variáveis de ambiente (Secrets) no teu painel do Supabase:

1.  Acede a **Project Settings** > **Edge Functions**.
2.  Adiciona as seguintes variáveis:
    *   `PROXYPAY_API_TOKEN`: O teu token de API fornecido pelo ProxyPay.
    *   `PROXYPAY_POS_ID`: O teu POS ID fornecido pelo ProxyPay.

## 2. Configuração do Webhook no ProxyPay

Para que o sistema saiba quando um pagamento foi concluído, deves configurar o URL do Webhook no painel do ProxyPay:

1.  Acede ao painel do ProxyPay.
2.  Configura o URL de Webhook para:
    `https://[TEU-PROJECT-ID].supabase.co/functions/v1/proxypay-webhook`
3.  Certifica-te de que o Webhook está configurado para enviar eventos de transações concluídas.

## 3. Como Funciona o Fluxo

1.  **Pedido:** O utilizador insere o número de telemóvel na página de subscrição.
2.  **Transação:** A Edge Function `create-proxypay-transaction` é chamada e cria um pedido no ProxyPay.
3.  **Confirmação:** O utilizador recebe uma notificação na App Multicaixa Express e autoriza o pagamento.
4.  **Atualização:** O ProxyPay envia um sinal para a Edge Function `proxypay-webhook`, que automaticamente:
    *   Marca o pagamento como aprovado na tabela `Pagamentos`.
    *   Ativa a subscrição do utilizador na tabela `user_subscriptions`.

## 4. Notas de Segurança

*   As chaves de API nunca devem ser colocadas diretamente no código do frontend.
*   O sistema utiliza o `user_id` nos campos personalizados (`custom_fields`) da transação para garantir que o pagamento é atribuído ao utilizador correto.
