<?php
/* Ponte com o WordPress: carrega o WP (se achar), usa o login do WP no lugar da senha do Studio e grava os dados em uploads.
   Se o WordPress não for encontrado, a API continua funcionando como no modo independente. */
if (!defined('AMPLIA_WP') && !isset($GLOBALS['AMPLIA_WP_TRIED'])) {
    $GLOBALS['AMPLIA_WP_TRIED'] = true;
    $d = __DIR__; $found = '';
    if (defined('AMPLIA_WP_LOAD') && is_file(AMPLIA_WP_LOAD)) $found = AMPLIA_WP_LOAD;
    for ($i = 0; $found === '' && $i < 8; $i++) { $d = dirname($d); if (is_file($d . '/wp-load.php')) $found = $d . '/wp-load.php'; }
    if ($found !== '') {
        if (!defined('SHORTINIT')) { /* carga completa: precisa dos cookies de login e das capacidades */ }
        require_once $found;
        if (function_exists('wp_upload_dir') && function_exists('is_user_logged_in')) define('AMPLIA_WP', true);
    }
}
function amp_wp_can(): bool {
    if (!defined('AMPLIA_WP') || !is_user_logged_in()) return false;
    return current_user_can(function_exists('apply_filters') ? apply_filters('amplia_studio_capability', 'manage_options') : 'manage_options');
}
function amp_wp_data_dir(): string {
    $u = wp_upload_dir(null, false);
    return rtrim((string) $u['basedir'], '/') . '/ampliacao-studio-data';
}
