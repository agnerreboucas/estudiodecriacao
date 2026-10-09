<?php
/* Página de entrada do Studio no WordPress: landing + login. Quem já está logado e tem permissão vai direto aos projetos. */
require __DIR__ . '/api/wp-bridge.php';
$tpl = __DIR__ . '/entrar.html';
if (!defined('AMPLIA_WP') || !is_file($tpl)) { header('Location: index.php'); exit; }
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$dir = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/'), '/\\');
$app = $dir . '/index.php';
if (is_user_logged_in() && amp_wp_can()) { wp_safe_redirect($app . '#projetos'); exit; }
if (is_user_logged_in() && function_exists('amplia_studio_members_url')) { wp_safe_redirect(amplia_studio_members_url()); exit; }
$cfg = ['wp' => true, 'appUrl' => $app, 'loginUrl' => site_url('wp-login.php', 'login_post'), 'lostUrl' => wp_lostpassword_url(), 'err' => !empty($_GET['login'])];
header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: no-store');
echo str_replace('<script type="application/json" id="amp-cfg">null</script>', '<script type="application/json" id="amp-cfg">' . wp_json_encode($cfg, JSON_HEX_TAG | JSON_HEX_AMP) . '</script>', (string) file_get_contents($tpl));
