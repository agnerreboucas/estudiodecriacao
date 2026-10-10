<?php
/* Catálogo de modelos de IA que a usuária pode escolher (texto e imagem).
   Só o que está nestas listas é aceito pelo servidor. Para mudar nomes/modelos, defina no config.php:
   ANTHROPIC_MODELS, OPENAI_TEXT_MODELS, OPENAI_IMAGE_MODELS (formato  'id-do-modelo' => 'Nome que aparece').
   Confira sempre os nomes na documentação do provedor. */
function model_map(string $key, array $def): array {
    $v = cfg($key); if (!is_array($v) || !$v) return $def;
    $o = []; foreach ($v as $id => $lab) { if (is_string($id) && preg_match('~^[A-Za-z0-9._:/-]{2,80}$~', $id)) $o[$id] = (string) $lab; } return $o ?: $def;
}
function text_models(string $prov): array {
    if ($prov === 'openai') {
        $m = model_map('OPENAI_TEXT_MODELS', ['gpt-4o-mini' => 'Rápido e econômico', 'gpt-4o' => 'Equilibrado']);
        $d = (string) cfg('OPENAI_TEXT_MODEL', 'gpt-4o'); if (!isset($m[$d])) $m[$d] = 'Padrão do servidor'; return $m;
    }
    $m = model_map('ANTHROPIC_MODELS', ['claude-haiku-5-5' => 'Rápido e econômico', 'claude-sonnet-5-5' => 'Equilibrado', 'claude-opus-5-5' => 'Mais inteligente (mais lento e mais caro)']);
    $d = (string) cfg('ANTHROPIC_MODEL', 'claude-sonnet-5-5'); if (!isset($m[$d])) $m[$d] = 'Padrão do servidor'; return $m;
}
function text_default(string $prov): string { return $prov === 'openai' ? (string) cfg('OPENAI_TEXT_MODEL', 'gpt-4o') : (string) cfg('ANTHROPIC_MODEL', 'claude-sonnet-5-5'); }
/* imagem: openai (gera e edita com referências) e magnific (modelos do catálogo; caminhos e campos NÃO validados com chave real) */
function image_models_openai(): array { $m = model_map('OPENAI_IMAGE_MODELS', ['gpt-image-1' => 'GPT Image 1 (melhor qualidade, aceita referências)', 'gpt-image-1-mini' => 'GPT Image 1 Mini (mais barato)']); $d = (string) cfg('OPENAI_IMAGE_MODEL', 'gpt-image-1'); if (!isset($m[$d])) $m[$d] = 'Padrão do servidor'; return $m; }
function image_models_magnific(): array {
    return ['flux-dev' => ['label' => 'Flux Dev (rápido)', 'path' => '/ai/text-to-image/flux-dev', 'refs' => false],
            'mystic' => ['label' => 'Mystic (alta qualidade)', 'path' => '/ai/mystic', 'refs' => false],
            'gemini-flash' => ['label' => 'Gemini Flash Image (aceita referências)', 'path' => '/ai/gemini-2-5-flash-image-preview', 'refs' => true]];
}
function pick_model(array $list, $req, string $def): string { $req = is_string($req) ? $req : ''; return isset($list[$req]) ? $req : (isset($list[$def]) ? $def : (string) array_key_first($list)); }
function ai_catalog(): array {
    $prov = strtolower((string) cfg('AI_PROVIDER', 'anthropic')) === 'openai' ? 'openai' : 'anthropic';
    $mk = fn($m) => array_map(fn($id, $lab) => ['id' => $id, 'name' => $lab], array_keys($m), array_values($m));
    return [
        'text' => ['default' => $prov, 'providers' => [
            ['id' => 'anthropic', 'name' => 'Claude', 'configured' => cfg('ANTHROPIC_API_KEY') !== null, 'default' => text_default('anthropic'), 'models' => $mk(text_models('anthropic'))],
            ['id' => 'openai', 'name' => 'GPT (OpenAI)', 'configured' => cfg('OPENAI_API_KEY') !== null, 'default' => text_default('openai'), 'models' => $mk(text_models('openai'))]]],
        'image' => ['default' => cfg('OPENAI_API_KEY') !== null ? 'openai' : 'magnific', 'providers' => [
            ['id' => 'openai', 'name' => 'GPT Image (OpenAI)', 'configured' => cfg('OPENAI_API_KEY') !== null, 'default' => (string) cfg('OPENAI_IMAGE_MODEL', 'gpt-image-1'), 'refs' => true, 'models' => $mk(image_models_openai())],
            ['id' => 'magnific', 'name' => 'Magnific', 'configured' => cfg('MAGNIFIC_API_KEY') !== null, 'default' => 'flux-dev', 'refs' => true, 'models' => array_map(fn($id, $x) => ['id' => $id, 'name' => $x['label'], 'refs' => $x['refs']], array_keys(image_models_magnific()), array_values(image_models_magnific()))]]],
    ];
}
