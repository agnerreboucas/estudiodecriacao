<?php
/* Copie este arquivo para config.php e preencha. NUNCA suba config.php para o GitHub. */
return [
    /* Acesso ao Studio. Gere o hash com: php -r "echo password_hash('SUA_SENHA', PASSWORD_DEFAULT);"
       (ou, mais simples e menos seguro, use ADMIN_PASSWORD em texto). Sem nenhum dos dois, o app fica aberto. */
    'ADMIN_PASSWORD_HASH' => '',
    'ADMIN_PASSWORD'      => '',

    /* IA (Claude). Chave em https://console.anthropic.com */
    'ANTHROPIC_API_KEY' => '',
    'ANTHROPIC_MODEL'   => 'claude-sonnet-5-5',
    'AI_CALLS_PER_HOUR' => 60,

    /* Webhook de saída (n8n, Make, Zapier) */
    'WEBHOOK_URL'    => '',
    'WEBHOOK_SECRET' => '',

    /* Captura de leads: formulários/landing pages enviam POST para api/leads.php?token=...&project=ID */
    'LEADS_TOKEN'           => '',   // texto longo e aleatório
    'WHATSAPP_VERIFY_TOKEN' => '',   // token de verificação do webhook do WhatsApp Cloud
    'META_APP_SECRET'       => '',   // valida a assinatura X-Hub-Signature-256 do WhatsApp/Meta

    /* Meta Ads (leitura de métricas) */
    'META_ACCESS_TOKEN'   => '',
    'META_AD_ACCOUNT_ID'  => '',     // somente números, sem "act_"

    /* Google Meu Negócio (Places API New): chave em console.cloud.google.com, com a API ativada */
    'GOOGLE_PLACES_API_KEY' => '',

    /* Radar de concorrentes: a leitura de sites bloqueia endereços internos. Só ligue em testes locais. */
    // 'ANALYZE_ALLOW_PRIVATE' => false,

    /* Onde guardar workspace e leads. Ideal: pasta FORA do public_html */
    // 'DATA_DIR' => '/home/USUARIO/studio-data',
];
