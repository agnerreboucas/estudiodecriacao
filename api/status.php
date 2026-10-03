<?php
require __DIR__ . '/_lib.php';
$in = logged_in();
json_out(['ok' => true,
  'auth' => ['required' => auth_required(), 'loggedIn' => $in],
  'ai' => ['configured' => $in && cfg('ANTHROPIC_API_KEY') !== null, 'model' => $in ? cfg('ANTHROPIC_MODEL', 'claude-sonnet-5-5') : null],
  'image' => ['configured' => $in && cfg('OPENAI_API_KEY') !== null, 'model' => $in ? cfg('OPENAI_IMAGE_MODEL', 'gpt-image-1') : null],
  'sync' =>['enabled' => $in],
  'webhook' => ['configured' => $in && cfg('WEBHOOK_URL') !== null],
  'leads' => ['configured' => $in && cfg('LEADS_TOKEN') !== null],
  'places' => ['configured' => $in && cfg('GOOGLE_PLACES_API_KEY') !== null],
  'meta' => ['configured' => $in && cfg('META_ACCESS_TOKEN') !== null && cfg('META_AD_ACCOUNT_ID') !== null],
]);
