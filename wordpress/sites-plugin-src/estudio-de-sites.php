<?php
/**
 * Plugin Name: Estúdio de Sites
 * Description: Estúdio para criar sites de clientes dentro do WordPress: briefing, templates, Mesa de páginas, sites de aula, link de aprovação e exportação para HTML, Kit do Elementor e tema.
 * Version: 1.0.0
 * Requires PHP: 8.0
 * Author: Ampliação
 * License: Proprietary
 * Text Domain: estudio-de-sites
 */
if (!defined('ABSPATH')) exit;

define('ESITES_VERSION', '1.0.0');
define('ESITES_DIR', plugin_dir_path(__FILE__));
define('ESITES_URL', plugin_dir_url(__FILE__));

/* Projetos, leads e chaves ficam em uploads, fora do plugin: sobrevivem a atualizações */
function esites_data_dir(): string { $u = wp_upload_dir(null, false); return rtrim($u['basedir'], '/') . '/estudio-de-sites-data'; }
function esites_prepare_data_dir(): bool {
    $d = esites_data_dir(); if (!is_dir($d)) wp_mkdir_p($d); if (!is_dir($d)) return false;
    if (!is_file($d . '/.htaccess')) @file_put_contents($d . '/.htaccess', "Require all denied\nDeny from all\n");
    if (!is_file($d . '/index.php')) @file_put_contents($d . '/index.php', "<?php // silêncio\n");
    return is_writable($d);
}
function esites_capability(): string { return apply_filters('esites_capability', 'manage_options'); }
function esites_leads_token(): string {
    $t = (string) get_option('amplia_studio_leads_token', '');
    if ($t === '') { $t = wp_generate_password(40, false, false); update_option('amplia_studio_leads_token', $t, false); }
    return $t;
}
register_activation_hook(__FILE__, function () {
    if (version_compare(PHP_VERSION, '8.0', '<')) { deactivate_plugins(plugin_basename(__FILE__)); wp_die('O Estúdio de Sites precisa do PHP 8.0 ou mais novo.'); }
    esites_prepare_data_dir(); esites_leads_token();
});

/* Formulário de leads para o Elementor GRÁTIS: cole [amp_lead_form] num widget "Shortcode".
   Atributos: title, text, button, thanks (URL da página de obrigado), privacy (URL da política), project (ID do projeto) */
add_shortcode('amp_lead_form', function ($atts) {
    $a = shortcode_atts(['title' => '', 'text' => '', 'button' => 'Enviar', 'thanks' => '', 'privacy' => '', 'project' => ''], $atts, 'amp_lead_form');
    $url = ESITES_URL . 'app/api/leads.php?token=' . rawurlencode(esites_leads_token()) . ($a['project'] !== '' ? '&project=' . rawurlencode(preg_replace('/[^\w-]/', '', $a['project'])) : '');
    static $assets = false; ob_start(); ?>
    <div class="amp-form" data-leads="<?php echo esc_url($url); ?>" data-thanks="<?php echo esc_url($a['thanks']); ?>">
        <?php if ($a['title'] !== '') : ?><h2><?php echo esc_html($a['title']); ?></h2><?php endif; ?>
        <?php if ($a['text'] !== '') : ?><p class="amp-sub"><?php echo esc_html($a['text']); ?></p><?php endif; ?>
        <form novalidate>
            <input type="text" name="name" placeholder="Seu nome" required autocomplete="name" aria-label="Seu nome">
            <input type="tel" name="phone" placeholder="WhatsApp com DDD" required autocomplete="tel" inputmode="tel" aria-label="WhatsApp">
            <input type="email" name="email" placeholder="E-mail (opcional)" autocomplete="email" aria-label="E-mail">
            <input type="text" name="message" placeholder="O que você precisa? (opcional)" aria-label="Mensagem">
            <input type="text" name="website" tabindex="-1" autocomplete="off" class="amp-hp" aria-hidden="true">
            <label class="amp-consent"><input type="checkbox" name="consent" value="sim"> Concordo em receber contato por WhatsApp, telefone ou e-mail.<?php if ($a['privacy'] !== '') : ?> <a href="<?php echo esc_url($a['privacy']); ?>" target="_blank" rel="noopener">Política de privacidade</a><?php endif; ?></label>
            <button type="submit" class="amp-btn"><?php echo esc_html($a['button']); ?></button>
            <p class="amp-msg" role="status" hidden></p>
        </form>
    </div>
    <?php
    if (!$assets) { $assets = true; echo '<style>' . file_get_contents(ESITES_DIR . 'assets/lead-form.css') . '</style><script>' . file_get_contents(ESITES_DIR . 'assets/lead-form.js') . '</script>'; }
    return ob_get_clean();
});

add_action('admin_menu', function () {
    add_menu_page('Estúdio de Sites', 'Estúdio de Sites', esites_capability(), 'estudio-de-sites', 'esites_admin_page', 'dashicons-layout', 3);
});
/* seusite.com/sites abre o estúdio */
add_action('template_redirect', function () {
    $path = trim((string) wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/'); $home = trim((string) wp_parse_url(home_url('/'), PHP_URL_PATH), '/');
    $rel = $home !== '' && strpos($path, $home) === 0 ? trim(substr($path, strlen($home)), '/') : $path;
    if ($rel === 'sites') { wp_safe_redirect(ESITES_URL . 'app/index.php'); exit; }
});
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($l) { array_unshift($l, '<a href="' . esc_url(admin_url('admin.php?page=estudio-de-sites')) . '">Abrir</a>'); return $l; });

function esites_admin_page(): void {
    if (!current_user_can(esites_capability())) wp_die('Sem permissão.');
    $ok = esites_prepare_data_dir(); $app = ESITES_URL . 'app/index.php'; $api = ESITES_URL . 'app/api/'; $curl = function_exists('curl_init');
    $row = function (bool $good, string $t) { return '<li>' . ($good ? '✅ ' : '⚠️ ') . esc_html($t) . '</li>'; };
    echo '<div class="wrap"><h1>Estúdio de Sites</h1><p style="font-size:15px;max-width:720px">O estúdio abre em tela cheia, com o seu login do WordPress. Os projetos ficam salvos aqui no seu site.</p>';
    echo '<p><a class="button button-primary button-hero" href="' . esc_url($app) . '" target="_blank" rel="noopener">Abrir o Estúdio de Sites</a></p>';
    echo '<p>Atalho: <code>' . esc_html(home_url('/sites/')) . '</code></p><h2>Verificação</h2><ul>';
    echo $row(version_compare(PHP_VERSION, '8.0', '>='), 'PHP ' . PHP_VERSION . ' (precisa do 8.0 ou mais novo)');
    echo $row($curl, $curl ? 'cURL ativo (necessário para IA, imagens e o link de aprovação)' : 'cURL desligado: peça à hospedagem para ativar');
    echo $row($ok, $ok ? 'Pasta de dados pronta: ' . esites_data_dir() : 'Não consegui gravar a pasta de dados em uploads. Verifique a permissão de wp-content/uploads.');
    $el = defined('ELEMENTOR_VERSION');
    echo $row($el, $el ? 'Elementor (grátis) ativo, versão ' . ELEMENTOR_VERSION : 'Elementor ainda não está ativo: instale o plugin "Elementor" (grátis). O Elementor Pro NÃO é necessário.');
    echo '</ul><h2>Como usar com o Elementor grátis</h2><ol style="max-width:720px"><li>No estúdio, monte o site na Mesa de páginas e use <em>Exportar → Kit do Elementor (.zip)</em>.</li><li>No WordPress: Elementor → Ferramentas → Importar/Exportar Kit → envie o .zip.</li><li>Edite as páginas no Elementor (as páginas importadas viram páginas normais).</li></ol>';
    echo '<h2>Formulário de leads</h2><p>No Elementor, arraste o widget <strong>Shortcode</strong> e cole: <code>[amp_lead_form title="Receba contato" button="Quero saber mais" thanks="' . esc_url(home_url('/obrigado/')) . '"]</code></p>';
    echo '<p>Receber leads: <code>' . esc_html($api) . 'leads.php?token=' . esc_html(esites_leads_token()) . '&amp;project=ID</code></p>';
    echo '<h2>Chaves de IA</h2><p>Dentro do estúdio, em <strong>Configurações → Integrações</strong>. As chaves ficam só no servidor.</p><p style="color:#666">Quem pode usar: administradores. Para liberar editores, use o filtro <code>esites_capability</code>.</p></div>';
}
