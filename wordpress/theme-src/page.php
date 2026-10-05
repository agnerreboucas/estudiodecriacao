<?php get_header(); ?>
<main id="conteudo" class="ampt-wrap">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
  <article <?php post_class('ampt-post'); ?>>
    <h1 class="ampt-title"><?php if (is_singular()) { the_title(); } else { echo '<a href="' . esc_url(get_permalink()) . '">' . esc_html(get_the_title()) . '</a>'; } ?></h1>
    <div class="ampt-content"><?php is_singular() ? the_content() : the_excerpt(); ?></div>
  </article>
<?php endwhile; the_posts_pagination(); else : ?>
  <p>Nada por aqui ainda.</p>
<?php endif; ?>
</main>
<?php get_footer(); ?>
