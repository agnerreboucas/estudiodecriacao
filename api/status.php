<?php
require __DIR__ . '/_lib.php';
$in = logged_in();
json_out(['ok' => true, 'wp' => defined('AMPLIA_WP'),
  'auth' => ['required' => auth_required(), 'loggedIn' => $in],
  'ai' => ['configured' => $in && cfg(strtolower((string) cfg('AI_PROVIDER', 'anthropic')) === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY') !== null,
           'provider' => strtolower((string) cfg('AI_PROVIDER', 'anthropic')) === 'openai' ? 'openai' : 'anthropic',
           'model' => $in ? (strtolower((string) cfg('AI_PROVIDER', 'anthropic')) === 'openai' ? cfg('OPENAI_TEXT_MODEL', 'gpt-4o') : cfg('ANTHROPIC_MODEL', 'claude-sonnet-5-5')) : null,
           'anthropicKey' => $in && cfg('ANTHROPIC_API_KEY') !== null, 'openaiKey' => $in && cfg('OPENAI_API_KEY') !== null],
  'image' => ['configured' => $in && cfg('OPENAI_API_KEY') !== null, 'model' => $in ? cfg('OPENAI_IMAGE_MODEL', 'gpt-image-1') : null],
  'tts' => ['configured' => $in && cfg('ELEVENLABS_API_KEY') !== null, 'model' => $in ? cfg('ELEVENLABS_MODEL', 'eleven_multilingual_v2') : null],
  'stt' => ['configured' => $in && (cfg('ELEVENLABS_API_KEY') !== null || cfg('OPENAI_API_KEY') !== null)],
  'magnific' => ['configured' => $in && cfg('MAGNIFIC_API_KEY') !== null],
  'higgsfield' => ['configured' => $in && cfg('HIGGSFIELD_API_KEY') !== null, 'implemented' => false],
  'keysEditable' => $in && auth_required(),
  'sync' =>['enabled' => $in],
  'webhook' => ['configured' => $in && cfg('WEBHOOK_URL') !== null],
  'leads' => ['configured' => $in && cfg('LEADS_TOKEN') !== null],
  'places' => ['configured' => $in && cfg('GOOGLE_PLACES_API_KEY') !== null],
  'meta' => ['configured' => $in && cfg('META_ACCESS_TOKEN') !== null && cfg('META_AD_ACCOUNT_ID') !== null],
]);
