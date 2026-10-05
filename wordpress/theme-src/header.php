<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="ampt-skip" href="#conteudo">Ir para o conteúdo</a>
<?php if (get_theme_mod('ampt_show_header', true)) : ?>
<header class="ampt-header">
  <div class="ampt-bar">
    <div class="ampt-brand"><?php if (has_custom_logo()) { the_custom_logo(); } else { echo '<a href="' . esc_url(home_url('/')) . '">' . esc_html(get_bloginfo('name')) . '</a>'; } ?></div>
    <button class="ampt-burger" aria-expanded="false" aria-controls="ampt-nav" aria-label="Abrir menu">☰</button>
    <nav id="ampt-nav" class="ampt-nav" aria-label="Menu principal"><?php wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'fallback_cb' => false, 'depth' => 2]); ?></nav>
  </div>
</header>
<?php endif; ?>
