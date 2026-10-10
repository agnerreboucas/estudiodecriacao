<?php
/**
 * Plugin Name: Ampliação Studio
 * Description: Estúdio de marketing completo dentro do WordPress: campanhas, anúncios nas 3 medidas, roteiros de vídeo, Stories, landing pages, logo, leads e Portal do cliente.
 * Version: 1.6.0
 * Requires PHP: 8.0
 * Author: Ampliação
 * License: Proprietary
 * Text Domain: ampliacao-studio
 */
if (!defined('ABSPATH')) exit;

define('AMPLIA_STUDIO_VERSION', '1.6.0');
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
    amplia_studio_role();
    if (!get_option('amplia_studio_leads_token')) add_option('amplia_studio_leads_token', wp_generate_password(40, false, false), '', 'no');
});
function amplia_studio_leads_token(): string {
    $t = (string) get_option('amplia_studio_leads_token', '');
    if ($t === '') { $t = wp_generate_password(40, false, false); update_option('amplia_studio_leads_token', $t, false); }
    return $t;
}

/* Formulário de leads para o Elementor GRÁTIS: cole [amp_lead_form] num widget "Shortcode".
   Atributos: title, text, button, thanks (URL da página de obrigado), privacy (URL da política), project (ID do projeto no Studio) */
add_shortcode('amp_lead_form', function ($atts) {
    $a = shortcode_atts(['title' => '', 'text' => '', 'button' => 'Enviar', 'thanks' => '', 'privacy' => '', 'project' => ''], $atts, 'amp_lead_form');
    $url = AMPLIA_STUDIO_URL . 'app/api/leads.php?token=' . rawurlencode(amplia_studio_leads_token()) . ($a['project'] !== '' ? '&project=' . rawurlencode(preg_replace('/[^\w-]/', '', $a['project'])) : '');
    static $assets = false;
    ob_start(); ?>
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
    if (!$assets) { $assets = true; echo '<style>' . file_get_contents(AMPLIA_STUDIO_DIR . 'assets/lead-form.css') . '</style><script>' . file_get_contents(AMPLIA_STUDIO_DIR . 'assets/lead-form.js') . '</script>'; }
    return ob_get_clean();
});


/* ===== Área de membros: conta de cliente que vê só o(s) portal(is) liberado(s) ===== */
function amplia_studio_role(): void { if (!get_role('amplia_cliente')) add_role('amplia_cliente', 'Cliente do Studio', ['read' => true]); }
add_action('init', 'amplia_studio_role');
function amplia_studio_portals(): array {
    $out = []; $base = amplia_studio_data_dir() . '/portal';
    foreach (glob($base . '/*/meta.json') ?: [] as $f) {
        $m = json_decode((string) @file_get_contents($f), true);
        if (is_array($m) && empty($m['revoked']) && !empty($m['t'])) $out[(string) $m['t']] = (string) ($m['name'] ?? $m['t']);
    }
    return $out;
}
function amplia_studio_user_codes(int $uid): array { $c = get_user_meta($uid, 'amplia_portal_codes', true); return is_array($c) ? array_values(array_filter($c, 'is_string')) : []; }
function amplia_studio_members_url(): string {
    $id = (int) get_option('amplia_members_page_id', 0);
    return $id && get_post_status($id) === 'publish' ? (string) get_permalink($id) : home_url('/');
}
/* o cliente não entra no painel do WordPress: vai direto para a área dele */
add_filter('show_admin_bar', function ($v) { return (is_user_logged_in() && in_array('amplia_cliente', (array) wp_get_current_user()->roles, true)) ? false : $v; });
add_action('admin_init', function () {
    if (wp_doing_ajax() || !is_user_logged_in()) return;
    if (in_array('amplia_cliente', (array) wp_get_current_user()->roles, true)) { wp_safe_redirect(amplia_studio_members_url()); exit; }
});
add_filter('login_redirect', function ($to, $req, $user) {
    return ($user instanceof WP_User && in_array('amplia_cliente', (array) $user->roles, true)) ? amplia_studio_members_url() : $to;
}, 10, 3);

/* [amp_area_cliente]: login + portal do cliente (cole num widget Shortcode do Elementor grátis) */
add_shortcode('amp_area_cliente', function ($atts) {
    $a = shortcode_atts(['height' => '88vh'], $atts, 'amp_area_cliente');
    if (!is_user_logged_in()) {
        return '<div class="amp-form" style="max-width:420px"><h2>Área do cliente</h2><p class="amp-sub">Entre com o e-mail e a senha que você recebeu.</p>' . wp_login_form(['echo' => false, 'redirect' => get_permalink(), 'label_username' => 'E-mail ou usuário', 'label_log_in' => 'Entrar']) . '<p><a href="' . esc_url(wp_lostpassword_url(get_permalink())) . '">Esqueci minha senha</a></p></div>';
    }
    $uid = get_current_user_id(); $all = amplia_studio_portals();
    $codes = amplia_studio_user_codes($uid);
    if (current_user_can(amplia_studio_capability()) && !$codes) $codes = array_keys($all);   // equipe vê todos (para conferir)
    $codes = array_values(array_filter($codes, fn($c) => isset($all[$c])));
    if (!$codes) return '<div class="amp-form"><p>Ainda não há projeto liberado para a sua conta. Fale com a equipe.</p></div>';
    $sel = isset($_GET['portal']) && in_array($_GET['portal'], $codes, true) ? (string) $_GET['portal'] : $codes[0];
    $url = AMPLIA_STUDIO_URL . 'app/cliente.html?t=' . rawurlencode($sel);
    $o = '';
    if (count($codes) > 1) { $o .= '<p>'; foreach ($codes as $c) $o .= '<a class="button" style="margin-right:8px" href="' . esc_url(add_query_arg('portal', $c)) . '">' . esc_html($all[$c]) . '</a>'; $o .= '</p>'; }
    $o .= '<iframe src="' . esc_url($url) . '" title="Portal do cliente" style="width:100%;height:' . esc_attr($a['height']) . ';border:0;border-radius:12px;background:#f5f5f7"></iframe>';
    $o .= '<p style="font-size:13px"><a href="' . esc_url($url) . '" target="_blank" rel="noopener">Abrir em tela cheia</a> · <a href="' . esc_url(wp_logout_url(get_permalink())) . '">Sair</a></p>';
    return $o;
});

/* Tela "Clientes" no painel: criar a conta, liberar portais, remover */
add_action('admin_menu', function () {
    add_submenu_page('ampliacao-studio', 'Clientes (área de membros)', 'Clientes', amplia_studio_capability(), 'ampliacao-studio-clientes', 'amplia_studio_clients_page');
});
add_action('admin_post_amplia_client_save', function () {
    if (!current_user_can(amplia_studio_capability())) wp_die('Sem permissão.', 403);
    check_admin_referer('amplia_client');
    $all = amplia_studio_portals(); $codes = array_values(array_filter((array) ($_POST['codes'] ?? []), fn($c) => is_string($c) && isset($all[$c])));
    $uid = (int) ($_POST['uid'] ?? 0); $msg = '';
    if ($uid) {
        $u = get_userdata($uid);
        if ($u && in_array('amplia_cliente', (array) $u->roles, true)) { update_user_meta($uid, 'amplia_portal_codes', $codes); $msg = 'Acessos atualizados.'; }
    } else {
        $email = sanitize_email(wp_unslash($_POST['email'] ?? '')); $name = sanitize_text_field(wp_unslash($_POST['name'] ?? ''));
        if (!is_email($email) || $name === '') $msg = 'Informe nome e e-mail válidos.';
        elseif (email_exists($email)) $msg = 'Já existe uma conta com este e-mail.';
        else {
            $id = wp_insert_user(['user_login' => $email, 'user_email' => $email, 'display_name' => $name, 'first_name' => $name, 'user_pass' => wp_generate_password(20), 'role' => 'amplia_cliente']);
            if (is_wp_error($id)) $msg = $id->get_error_message();
            else { update_user_meta($id, 'amplia_portal_codes', $codes); wp_new_user_notification($id, null, 'user'); $msg = 'Conta criada. O cliente recebeu um e-mail para criar a senha.'; }
        }
    }
    wp_safe_redirect(add_query_arg(['page' => 'ampliacao-studio-clientes', 'm' => rawurlencode($msg)], admin_url('admin.php'))); exit;
});
add_action('admin_post_amplia_client_delete', function () {
    if (!current_user_can(amplia_studio_capability())) wp_die('Sem permissão.', 403);
    check_admin_referer('amplia_client_del');
    $uid = (int) ($_GET['uid'] ?? 0); $u = get_userdata($uid);
    if ($u && in_array('amplia_cliente', (array) $u->roles, true)) { require_once ABSPATH . 'wp-admin/includes/user.php'; wp_delete_user($uid); }
    wp_safe_redirect(add_query_arg(['page' => 'ampliacao-studio-clientes', 'm' => rawurlencode('Conta removida.')], admin_url('admin.php'))); exit;
});
function amplia_studio_clients_page(): void {
    if (!current_user_can(amplia_studio_capability())) wp_die('Sem permissão.');
    $all = amplia_studio_portals(); $users = get_users(['role' => 'amplia_cliente']);
    echo '<div class="wrap"><h1>Clientes (área de membros)</h1>';
    if (!empty($_GET['m'])) echo '<div class="notice notice-info"><p>' . esc_html(rawurldecode((string) $_GET['m'])) . '</p></div>';
    echo '<p style="max-width:760px">Cada cliente tem uma conta e vê <strong>só os portais liberados para ele</strong>. Crie o portal dentro do Studio (menu <em>Portal do cliente</em>) e marque <em>Exigir login</em>. A página do cliente é a <code>Área do cliente</code> (criada pelo instalador do tema) ou qualquer página com o shortcode <code>[amp_area_cliente]</code>.</p>';
    if (!$all) echo '<div class="notice notice-warning inline"><p>Ainda não há portais publicados. Crie um no Studio primeiro.</p></div>';
    $boxes = function (array $sel) use ($all) { $h = ''; foreach ($all as $c => $n) $h .= '<label style="display:block"><input type="checkbox" name="codes[]" value="' . esc_attr($c) . '" ' . checked(in_array($c, $sel, true), true, false) . '> ' . esc_html($n) . '</label>'; return $h ?: '<em>nenhum portal</em>'; };
    echo '<h2>Novo cliente</h2><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">'; wp_nonce_field('amplia_client'); echo '<input type="hidden" name="action" value="amplia_client_save"><p><input name="name" placeholder="Nome" class="regular-text" required> <input name="email" type="email" placeholder="E-mail" class="regular-text" required></p><p>' . $boxes([]) . '</p><p><button class="button button-primary">Criar conta e enviar e-mail</button></p></form>';
    echo '<h2>Contas</h2>';
    if (!$users) echo '<p>Nenhuma conta ainda.</p>';
    foreach ($users as $u) {
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="border:1px solid #ddd;background:#fff;padding:10px 14px;margin:8px 0;max-width:760px">'; wp_nonce_field('amplia_client');
        echo '<input type="hidden" name="action" value="amplia_client_save"><input type="hidden" name="uid" value="' . (int) $u->ID . '"><strong>' . esc_html($u->display_name) . '</strong> · ' . esc_html($u->user_email) . '<div style="margin:6px 0">' . $boxes(amplia_studio_user_codes($u->ID)) . '</div><button class="button">Salvar acessos</button> <a class="button-link-delete" style="margin-left:12px" href="' . esc_url(wp_nonce_url(admin_url('admin-post.php?action=amplia_client_delete&uid=' . (int) $u->ID), 'amplia_client_del')) . '" onclick="return confirm(\'Remover esta conta?\')">Remover conta</a></form>';
    }
    echo '</div>';
}

function amplia_studio_capability(): string { return apply_filters('amplia_studio_capability', 'manage_options'); }

add_action('admin_menu', function () {
    add_menu_page('Ampliação Studio', 'Ampliação Studio', amplia_studio_capability(), 'ampliacao-studio', 'amplia_studio_admin_page', 'dashicons-megaphone', 3);
});
/* seusite.com/studio leva à página de entrada do Studio */
add_action('template_redirect', function () {
    $path = trim((string) wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/'); $home = trim((string) wp_parse_url(home_url('/'), PHP_URL_PATH), '/');
    $rel = $home !== '' && strpos($path, $home) === 0 ? trim(substr($path, strlen($home)), '/') : $path;
    if ($rel === 'studio') { wp_safe_redirect(AMPLIA_STUDIO_URL . 'app/entrar.php'); exit; }
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
    echo '<p>Página de entrada (landing + login) para a equipe: <code>' . esc_html(home_url('/studio/')) . '</code> · direto: <code>' . esc_html(AMPLIA_STUDIO_URL . 'app/entrar.php') . '</code></p>';
    echo '<h2>Verificação</h2><ul>';
    echo $row(version_compare(PHP_VERSION, '8.0', '>='), 'PHP ' . PHP_VERSION . ' (precisa do 8.0 ou mais novo)');
    echo $row($curl, $curl ? 'cURL ativo (necessário para IA, imagens e integrações)' : 'cURL desligado: peça à hospedagem para ativar');
    echo $row($ok, $ok ? 'Pasta de dados pronta: ' . amplia_studio_data_dir() : 'Não consegui criar/gravar a pasta de dados em uploads. Verifique a permissão de wp-content/uploads.');
    $el = defined('ELEMENTOR_VERSION');
    echo $row($el, $el ? 'Elementor (grátis) ativo, versão ' . ELEMENTOR_VERSION : 'Elementor ainda não está ativo: instale o plugin "Elementor" (grátis) para montar as telas. O Elementor Pro NÃO é necessário.');
    echo '</ul><h2>Formulário de leads</h2><p>No Elementor, arraste o widget <strong>Shortcode</strong> e cole: <code>[amp_lead_form title="Receba contato" button="Quero saber mais" thanks="' . esc_url(home_url('/obrigado/')) . '"]</code></p><h2>Endereços para integrações</h2>';
    echo '<p>Receber leads (formulário, landing, WhatsApp): <code>' . esc_html($api) . 'leads.php?token=' . esc_html(amplia_studio_leads_token()) . '&amp;project=ID</code><br>Webhook do WhatsApp: <code>' . esc_html($api) . 'webhook.php</code><br>Portal do cliente: <code>' . esc_html(AMPLIA_STUDIO_URL . 'app/cliente.html') . '</code></p>';
    echo '<h2>Chaves de IA</h2><p>Dentro do Studio, em <strong>Configurações → Integrações</strong>. As chaves ficam só no servidor. Opcional: crie <code>config.php</code> na pasta de dados (modelo em <code>app/api/config.sample.php</code>) para definir token de leads, webhook e limites.</p>';
    echo '<p style="color:#666">Quem pode usar: administradores. Para liberar editores, use o filtro <code>amplia_studio_capability</code>.</p></div>';
}
