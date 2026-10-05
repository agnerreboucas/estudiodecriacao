<footer class="ampt-footer">
  <div class="ampt-bar">
    <div><?php echo wp_kses_post(get_theme_mod('ampt_footer', '')) ?: '&copy; ' . esc_html(date('Y')) . ' ' . esc_html(get_bloginfo('name')); ?></div>
    <nav aria-label="Rodapé"><?php wp_nav_menu(['theme_location' => 'footer', 'container' => false, 'fallback_cb' => false, 'depth' => 1]); ?></nav>
  </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
