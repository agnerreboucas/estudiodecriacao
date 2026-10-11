<?php
/* Copie este arquivo para config.php e preencha. NUNCA suba config.php para o GitHub. */
return [
    /* Acesso ao Studio. Gere o hash com: php -r "echo password_hash('SUA_SENHA', PASSWORD_DEFAULT);"
       (ou, mais simples e menos seguro, use ADMIN_PASSWORD em texto). Sem nenhum dos dois, o app fica aberto. */
    'ADMIN_PASSWORD_HASH' => '',
    'ADMIN_PASSWORD'      => '',
    /* Opcional: código exigido no primeiro acesso, quando a senha é criada pelo app (Configurações → Integrações). Evita que outra pessoa crie a senha antes de você. */
    'SETUP_CODE'          => '',

    /* IA (Claude). Chave em https://console.anthropic.com */
    'ANTHROPIC_API_KEY' => '',
    'ANTHROPIC_MODEL'   => 'claude-sonnet-5-5',
    'AI_CALLS_PER_HOUR' => 60,

    /* Provedor do texto/visão da IA: 'anthropic' (padrão) ou 'openai'. Com 'openai' usa OPENAI_API_KEY e OPENAI_TEXT_MODEL. */
    'AI_PROVIDER'       => 'anthropic',
    'OPENAI_TEXT_MODEL' => 'gpt-4o',      // confira o nome do modelo na documentação da OpenAI

    /* Narração (ElevenLabs). Chave em https://elevenlabs.io → Developers → API Keys */
    'ELEVENLABS_API_KEY'  => '',
    'ELEVENLABS_MODEL'    => 'eleven_multilingual_v2',
    'STT_CALLS_PER_HOUR'  => 20,          // transcrição de áudio (usa a chave ElevenLabs ou, se não houver, a OpenAI)
    'TTS_CHARS_PER_DAY'   => 60000,       // trava de custo (caracteres por dia)

    /* Magnific (antigo Freepik API): banco de imagens e upscale. Chave em https://www.magnific.com/api (ou painel de desenvolvedor Freepik) */
    'MAGNIFIC_API_KEY'  => '',
    'MAGNIFIC_API_URL'  => 'https://api.freepik.com/v1',
    'MAGNIFIC_CALLS_PER_HOUR' => 60,

    /* Higgsfield (vídeo/imagem): espaço reservado. A integração só será escrita quando você contratar e enviar a documentação da API. */
    'HIGGSFIELD_API_KEY' => '',

    /* Geração de imagem (OpenAI). Chave em https://platform.openai.com/api-keys — confira nomes de modelo e preços na documentação da OpenAI */
    'OPENAI_API_KEY'       => '',
    'OPENAI_IMAGE_MODEL'   => 'gpt-image-1',
    'OPENAI_IMAGE_QUALITY' => 'medium',   // low = mais barato, high = mais caro
    /* Opcional: listas que aparecem em Configurações → Escolha da IA (formato 'id-do-modelo' => 'Nome que aparece'). Confira os nomes na documentação do provedor.
       'ANTHROPIC_MODELS'   => ['claude-haiku-5-5' => 'Rápido e econômico', 'claude-sonnet-5-5' => 'Equilibrado', 'claude-opus-5-5' => 'Mais inteligente'],
       'OPENAI_TEXT_MODELS' => ['gpt-4o-mini' => 'Rápido e econômico', 'gpt-4o' => 'Equilibrado'],
       'OPENAI_IMAGE_MODELS'=> ['gpt-image-1' => 'GPT Image 1', 'gpt-image-1-mini' => 'GPT Image 1 Mini (mais barato)'], */
    'IMAGE_CALLS_PER_HOUR' => 20,
    'IMAGE_CALLS_PER_DAY'  => 80,         // trava de custo

    /* Webhook de saída (n8n, Make, Zapier) */
    'WEBHOOK_URL'    => '',
    'WEBHOOK_SECRET' => '',

    /* Captura de leads: formulários/landing pages enviam POST para api/leads.php?token=...&project=ID */
    'LEADS_TOKEN'           => '',   // texto longo e aleatório
    // Publicação na Meta (Instagram + Facebook) — veja o card "Conexão com a Meta" em Publicação > Contas e dados
    'META_APP_ID' => '', 'META_APP_SECRET' => '',      // app em developers.facebook.com
    'META_PAGE_ID' => '', 'META_PAGE_TOKEN' => '', 'META_IG_USER_ID' => '',  // (opcional) preenchidos pelo botão Conectar
    'META_CRON_KEY' => '',           // chave p/ o cron chamar api/meta_social.php?action=run&key=...
    'META_DRY_RUN' => false,         // true = simula sem enviar nada à Meta
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
