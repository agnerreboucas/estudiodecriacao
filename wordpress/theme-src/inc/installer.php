<?php
/* Instalador guiado: Studio (plugin que vem dentro do tema) → Elementor grátis (do WordPress.org) → páginas base.
   Tudo roda por botões, com nonce e só para quem pode instalar plugins. */
if (!defined('ABSPATH')) exit;

function ampt_cap(): string { return 'install_plugins'; }
function ampt_bundled_zip(): string { return get_template_directory() . '/bundled/ampliacao-studio-plugin.zip'; }
function ampt_plugin_file(string $slug): string {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    foreach (array_keys(get_plugins()) as $f) { if (strpos($f, $slug . '/') === 0) return $f; }
    return '';
}
function ampt_status(): array {
    $studio = ampt_plugin_file('ampliacao-studio'); $el = ampt_plugin_file('elementor');
    $pages = get_option('ampt_pages', []);
    return [
        'php' => version_compare(PHP_VERSION, '8.0', '>='), 'curl' => function_exists('curl_init'), 'zip' => class_exists('ZipArchive') || function_exists('unzip_file'),
        'studio_installed' => $studio !== '', 'studio_active' => $studio !== '' && is_plugin_active($studio), 'studio_file' => $studio,
        'el_installed' => $el !== '', 'el_active' => defined('ELEMENTOR_VERSION') || ($el !== '' && is_plugin_active($el)), 'el_file' => $el,
        'pages' => is_array($pages) ? $pages : [], 'bundled' => is_file(ampt_bundled_zip()),
    ];
}

add_action('admin_menu', function () {
    add_theme_page('Instalação do Studio', 'Instalação do Studio', ampt_cap(), 'ampt-setup', 'ampt_setup_page');
});
add_action('after_switch_theme', function () { set_transient('ampt_go_setup', 1, 60); });
add_action('admin_init', function () {
    if (get_transient('ampt_go_setup') && current_user_can(ampt_cap()) && !wp_doing_ajax()) { delete_transient('ampt_go_setup'); wp_safe_redirect(admin_url('themes.php?page=ampt-setup')); exit; }
});
add_action('admin_notices', function () {
    if (!current_user_can(ampt_cap())) return;
    $s = ampt_status(); if ($s['studio_active'] && $s['el_active']) return;
    $screen = get_current_screen(); if ($screen && $screen->id === 'appearance_page_ampt-setup') return;
    echo '<div class="notice notice-warning"><p><strong>Ampliação Studio:</strong> falta terminar a instalação. <a href="' . esc_url(admin_url('themes.php?page=ampt-setup')) . '">Abrir o instalador</a></p></div>';
});

function ampt_back(string $msg, bool $ok = true): void {
    wp_safe_redirect(add_query_arg(['page' => 'ampt-setup', 'ampt_msg' => rawurlencode($msg), 'ampt_ok' => $ok ? 1 : 0], admin_url('themes.php')));
    exit;
}
function ampt_guard(): void {
    if (!current_user_can(ampt_cap())) wp_die('Sem permissão.', 403);
    check_admin_referer('ampt_wizard');
    @set_time_limit(300);
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/misc.php';
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
}
function ampt_activate(string $file): ?string {
    $r = activate_plugin($file);
    return is_wp_error($r) ? $r->get_error_message() : null;
}

add_action('admin_post_ampt_studio', function () {
    ampt_guard();
    $s = ampt_status();
    if (!$s['studio_installed']) {
        if (!$s['bundled']) ampt_back('O arquivo do plugin do Studio não está dentro do tema. Reenvie o pacote completo ou instale o ampliacao-studio-plugin.zip pela tela Plugins.', false);
        $up = new Plugin_Upgrader(new Automatic_Upgrader_Skin());
        $r = $up->install(ampt_bundled_zip());
        if (is_wp_error($r) || !$r) ampt_back('Não consegui instalar o plugin do Studio: ' . (is_wp_error($r) ? $r->get_error_message() : 'verifique a permissão da pasta wp-content/plugins.'), false);
        wp_clean_plugins_cache();
    }
    $f = ampt_plugin_file('ampliacao-studio');
    if ($f === '') ampt_back('Plugin do Studio instalado, mas não encontrei o arquivo principal.', false);
    $e = ampt_activate($f); if ($e) ampt_back('Não consegui ativar o Studio: ' . $e, false);
    ampt_back('Plugin do Ampliação Studio instalado e ativado.');
});
add_action('admin_post_ampt_elementor', function () {
    ampt_guard();
    $s = ampt_status();
    if (!$s['el_installed']) {
        $api = plugins_api('plugin_information', ['slug' => 'elementor', 'fields' => ['sections' => false]]);
        if (is_wp_error($api) || empty($api->download_link)) ampt_back('Não consegui falar com o WordPress.org para baixar o Elementor. Instale pela tela Plugins → Adicionar novo → "Elementor".', false);
        $up = new Plugin_Upgrader(new Automatic_Upgrader_Skin());
        $r = $up->install($api->download_link);
        if (is_wp_error($r) || !$r) ampt_back('Não consegui instalar o Elementor: ' . (is_wp_error($r) ? $r->get_error_message() : 'verifique a permissão de escrita.'), false);
        wp_clean_plugins_cache();
    }
    $f = ampt_plugin_file('elementor');
    if ($f === '') ampt_back('Elementor baixado, mas não encontrei o arquivo principal.', false);
    $e = ampt_activate($f); if ($e) ampt_back('Não consegui ativar o Elementor: ' . $e, false);
    ampt_back('Elementor (versão grátis) instalado e ativado.');
});
add_action('admin_post_ampt_pages', function () {
    ampt_guard();
    $defs = [
        'inicio' => ['Início', '', 'elementor_canvas'],
        'obrigado' => ['Obrigado', '<h1>Recebemos o seu contato!</h1><p>Em breve falaremos com você. [CONFIRMAR o texto e o prazo de resposta]</p>', 'elementor_canvas'],
        'privacidade' => ['Política de privacidade', '<p>[CONFIRMAR: texto da política de privacidade, revisado por quem entende de LGPD]</p>', ''],
    ];
    $made = get_option('ampt_pages', []); if (!is_array($made)) $made = [];
    foreach ($defs as $k => [$title, $html, $tpl]) {
        if (!empty($made[$k]) && get_post($made[$k])) continue;
        $id = wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => $title, 'post_name' => $k, 'post_content' => $html], true);
        if (is_wp_error($id)) continue;
        if ($tpl) update_post_meta($id, '_wp_page_template', $tpl);
        $made[$k] = $id;
    }
    update_option('ampt_pages', $made, false);
    if (!empty($made['inicio']) && !empty($_POST['frontpage'])) { update_option('show_on_front', 'page'); update_option('page_on_front', (int) $made['inicio']); }
    ampt_back('Páginas base criadas: Início, Obrigado e Política de privacidade.');
});

function ampt_setup_page(): void {
    if (!current_user_can(ampt_cap())) wp_die('Sem permissão.');
    $s = ampt_status();
    $row = function (bool $ok, string $t, string $extra = '') { return '<li style="margin:6px 0">' . ($ok ? '✅' : '⬜') . ' ' . esc_html($t) . ($extra ? ' <span style="color:#666">' . esc_html($extra) . '</span>' : '') . '</li>'; };
    $btn = function (string $action, string $label, bool $done, string $extra = '') {
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:inline-block;margin-right:8px">';
        wp_nonce_field('ampt_wizard'); echo '<input type="hidden" name="action" value="' . esc_attr($action) . '">' . $extra;
        echo '<button class="button ' . ($done ? '' : 'button-primary') . '">' . esc_html($label) . '</button></form>';
    };
    echo '<div class="wrap"><h1>Instalação do Ampliação Studio</h1>';
    if (isset($_GET['ampt_msg'])) printf('<div class="notice notice-%s"><p>%s</p></div>', !empty($_GET['ampt_ok']) ? 'success' : 'error', esc_html(rawurldecode((string) $_GET['ampt_msg'])));
    echo '<p style="max-width:760px;font-size:15px">Siga os passos abaixo, de cima para baixo. Cada botão faz uma etapa. Se algo falhar, a mensagem diz o motivo; o documento <strong>Instalação</strong> que veio no pacote explica a instalação manual.</p>';
    echo '<h2>1 · Verificação</h2><ul>' . $row($s['php'], 'PHP ' . PHP_VERSION, '(precisa do 8.0 ou mais novo)') . $row($s['curl'], 'cURL ativo', '(IA, imagens e integrações)') . $row($s['zip'], 'Extração de arquivos .zip') . $row($s['bundled'], 'Plugin do Studio dentro do tema') . '</ul>';
    echo '<h2>2 · Plugin do Ampliação Studio</h2><ul>' . $row($s['studio_active'], $s['studio_active'] ? 'Instalado e ativo' : ($s['studio_installed'] ? 'Instalado, falta ativar' : 'Ainda não instalado')) . '</ul>';
    $btn('ampt_studio', $s['studio_active'] ? 'Reinstalar/ativar de novo' : 'Instalar e ativar o Studio', $s['studio_active']);
    echo '<h2>3 · Elementor (versão grátis)</h2><ul>' . $row($s['el_active'], $s['el_active'] ? 'Elementor ativo' : ($s['el_installed'] ? 'Instalado, falta ativar' : 'Ainda não instalado'), 'O Elementor Pro não é necessário.') . '</ul>';
    $btn('ampt_elementor', $s['el_active'] ? 'Verificar de novo' : 'Baixar e ativar o Elementor grátis', $s['el_active']);
    echo '<h2>4 · Páginas base</h2><ul>' . $row(!empty($s['pages']), !empty($s['pages']) ? 'Criadas: ' . implode(', ', array_keys($s['pages'])) : 'Início, Obrigado e Política de privacidade (Início e Obrigado em tela livre para o Elementor)') . '</ul>';
    $btn('ampt_pages', 'Criar as páginas base', !empty($s['pages']), '<label style="margin-right:10px"><input type="checkbox" name="frontpage" value="1" checked> Usar "Início" como página inicial</label>');
    echo '<h2>5 · Abrir</h2><p>';
    if ($s['studio_active']) echo '<a class="button button-primary" href="' . esc_url(admin_url('admin.php?page=ampliacao-studio')) . '">Ir para o Ampliação Studio</a> ';
    if ($s['pages'] && $s['el_active'] && !empty($s['pages']['inicio'])) echo '<a class="button" href="' . esc_url(admin_url('post.php?post=' . (int) $s['pages']['inicio'] . '&action=elementor')) . '">Montar a página Início no Elementor</a>';
    echo '</p></div>';
}
