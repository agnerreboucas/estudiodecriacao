<?php
/* Porta de entrada do estúdio: só abre com login do WordPress e permissão. */
require __DIR__ . '/api/wp-bridge.php';
if (!defined('AMPLIA_WP')) { http_response_code(500); header('Content-Type: text/plain; charset=utf-8'); echo 'WordPress não encontrado a partir deste plugin.'; exit; }
if (!is_user_logged_in()) { wp_safe_redirect(wp_login_url(plugins_url('app/index.php', dirname(__DIR__) . '/estudio-de-sites.php'))); exit; }
if (!amp_wp_can()) { wp_die('Você não tem permissão para usar o Estúdio de Sites.', 'Sem permissão', ['response' => 403]); }
header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: no-store'); header('X-Frame-Options: SAMEORIGIN');
readfile(__DIR__ . '/app.html');
