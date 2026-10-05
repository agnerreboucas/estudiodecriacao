<?php
/* Porta de entrada do Studio: só abre com login do WordPress e permissão. */
require __DIR__ . '/api/wp-bridge.php';
if (!defined('AMPLIA_WP')) { http_response_code(500); header('Content-Type: text/plain; charset=utf-8'); echo 'WordPress não encontrado a partir deste plugin.'; exit; }
if (!is_user_logged_in()) { auth_redirect(); exit; }
if (!amp_wp_can()) { wp_die('Você não tem permissão para usar o Ampliação Studio.', 'Sem permissão', ['response' => 403]); }
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Frame-Options: SAMEORIGIN');
readfile(__DIR__ . '/index.html');
