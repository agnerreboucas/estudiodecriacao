<?php
/**
 * Plugin Name: Ampliação Studio
 * Description: Estúdio de marketing completo dentro do WordPress: campanhas, anúncios nas 3 medidas, roteiros de vídeo, Stories, landing pages, logo, leads e Portal do cliente.
 * Version: 1.0.0
 * Requires PHP: 8.0
 * Author: Ampliação
 * License: Proprietary
 * Text Domain: ampliacao-studio
 */
if (!defined('ABSPATH')) exit;

define('AMPLIA_STUDIO_VERSION', '1.0.0');
define('AMPLIA_STUDIO_DIR', plugin_dir_path(__FILE__));
define('AMPLIA_STUDIO_URL', plugin_dir_url(__FILE__));

/* Pasta de dados (projetos, leads, chaves) fica em uploads, fora do plugin: sobrevive a atualizações */
function amplia_studio_data_dir(): string {
    $u = wp_upload_dir(null, false);
    return rtrim($u['basedir'], '/') . '/ampliacao-studio-data';
}
function amplia_studio_prepare_data_dir(): bool {
    $d = amplia_studio_data_dir();
    if (!is_dir($d)) wp_mkdir_p($d);
    if (!is_dir($d)) return false;
    if (!is_file($d . '/.htaccess')) @file_put_contents($d . '/.htaccess', "Require all denied\nDeny from all\n");
    if (!is_file($d . '/index.php')) @file_put_contents($d . '/index.php', "<?php // silêncio\n");
    return is_writable($d);
}
register_activation_hook(__FILE__, function () {
    if (version_compare(PHP_VERSION, '8.0', '<')) { deactivate_plugins(plugin_basename(__FILE__)); wp_die('O Ampliação Studio precisa do PHP 8.0 ou mais novo.'); }
    amplia_studio_prepare_data_dir();
});

function amplia_studio_capability(): string { return apply_filters('amplia_studio_capability', 'manage_options'); }

add_action('admin_menu', function () {
    add_menu_page('Ampliação Studio', 'Ampliação Studio', amplia_studio_capability(), 'ampliacao-studio', 'amplia_studio_admin_page', 'dashicons-megaphone', 3);
});
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($l) {
    array_unshift($l, '<a href="' . esc_url(admin_url('admin.php?page=ampliacao-studio')) . '">Abrir</a>'); return $l;
});

function amplia_studio_admin_page(): void {
    if (!current_user_can(amplia_studio_capability())) wp_die('Sem permissão.');
    $ok = amplia_studio_prepare_data_dir();
    $app = AMPLIA_STUDIO_URL . 'app/index.php';
    $api = AMPLIA_STUDIO_URL . 'app/api/';
    $curl = function_exists('curl_init');
    $row = function (bool $good, string $t) { return '<li>' . ($good ? '✅ ' : '⚠️ ') . esc_html($t) . '</li>'; };
    echo '<div class="wrap"><h1>Ampliação Studio</h1>';
    echo '<p style="font-size:15px;max-width:720px">O Studio abre em tela cheia, com o seu login do WordPress. Os projetos ficam salvos aqui no seu site.</p>';
    echo '<p><a class="button button-primary button-hero" href="' . esc_url($app) . '" target="_blank" rel="noopener">Abrir o Ampliação Studio</a></p>';
    echo '<h2>Verificação</h2><ul>';
    echo $row(version_compare(PHP_VERSION, '8.0', '>='), 'PHP ' . PHP_VERSION . ' (precisa do 8.0 ou mais novo)');
    echo $row($curl, $curl ? 'cURL ativo (necessário para IA, imagens e integrações)' : 'cURL desligado: peça à hospedagem para ativar');
    echo $row($ok, $ok ? 'Pasta de dados pronta: ' . amplia_studio_data_dir() : 'Não consegui criar/gravar a pasta de dados em uploads. Verifique a permissão de wp-content/uploads.');
    echo '</ul><h2>Endereços para integrações</h2>';
    echo '<p>Receber leads (formulário, landing, WhatsApp): <code>' . esc_html($api) . 'leads.php?token=SEU_TOKEN&amp;project=ID</code><br>Webhook do WhatsApp: <code>' . esc_html($api) . 'webhook.php</code><br>Portal do cliente: <code>' . esc_html(AMPLIA_STUDIO_URL . 'app/cliente.html') . '</code></p>';
    echo '<h2>Chaves de IA</h2><p>Dentro do Studio, em <strong>Configurações → Integrações</strong>. As chaves ficam só no servidor. Opcional: crie <code>config.php</code> na pasta de dados (modelo em <code>app/api/config.sample.php</code>) para definir token de leads, webhook e limites.</p>';
    echo '<p style="color:#666">Quem pode usar: administradores. Para liberar editores, use o filtro <code>amplia_studio_capability</code>.</p></div>';
}
