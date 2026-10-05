<?php
if (!defined('ABSPATH')) exit;
define('AMPT_VER', '1.0.0');

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('custom-logo', ['height' => 80, 'width' => 240, 'flex-height' => true, 'flex-width' => true]);
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');
    register_nav_menus(['primary' => 'Menu principal', 'footer' => 'Menu do rodapé']);
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('ampt', get_stylesheet_uri(), [], AMPT_VER);
    wp_enqueue_style('ampt-main', get_template_directory_uri() . '/assets/theme.css', ['ampt'], AMPT_VER);
    wp_enqueue_script('ampt-menu', get_template_directory_uri() . '/assets/menu.js', [], AMPT_VER, true);
});

/* Personalizar: cores e textos do rodapé (o Elementor grátis não tem Theme Builder, então cabeçalho e rodapé vêm do tema) */
add_action('customize_register', function ($wp) {
    $wp->add_section('ampt', ['title' => 'Ampliação Studio', 'priority' => 30]);
    foreach (['ampt_accent' => ['Cor de destaque', '#111111'], 'ampt_bg' => ['Cor de fundo', '#ffffff'], 'ampt_fg' => ['Cor do texto', '#111111']] as $k => $v) {
        $wp->add_setting($k, ['default' => $v[1], 'sanitize_callback' => 'sanitize_hex_color']);
        $wp->add_control(new WP_Customize_Color_Control($wp, $k, ['label' => $v[0], 'section' => 'ampt']));
    }
    $wp->add_setting('ampt_footer', ['default' => '', 'sanitize_callback' => 'wp_kses_post']);
    $wp->add_control('ampt_footer', ['label' => 'Texto do rodapé (ex.: CNPJ, endereço)', 'section' => 'ampt', 'type' => 'textarea']);
    $wp->add_setting('ampt_show_header', ['default' => true, 'sanitize_callback' => 'rest_sanitize_boolean']);
    $wp->add_control('ampt_show_header', ['label' => 'Mostrar cabeçalho', 'section' => 'ampt', 'type' => 'checkbox']);
});
add_action('wp_head', function () {
    printf('<style id="ampt-vars">:root{--a:%s;--bg:%s;--fg:%s}</style>', esc_attr(get_theme_mod('ampt_accent', '#111111')), esc_attr(get_theme_mod('ampt_bg', '#ffffff')), esc_attr(get_theme_mod('ampt_fg', '#111111')));
}, 5);

require_once get_template_directory() . '/inc/installer.php';
